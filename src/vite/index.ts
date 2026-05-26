import { createReadStream } from 'node:fs';
import { copyFile, mkdir, readdir, readFile, stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, extname, join, resolve } from 'node:path';
import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite';

export interface DesignSystemPluginOptions {
  /**
   * Source directory for SVG icons.
   * Defaults to `<dir-of-@7pmlabs/design-system>/dist/assets/icons`,
   * resolved from the consumer's `node_modules`.
   */
  iconsDir?: string;
  /**
   * URL prefix at which icons are served (runtime fallback).
   * Must match `BIcon`'s hardcoded path. Default: `/_design-system/icons`.
   */
  iconsRoute?: string;
  /**
   * Whether to copy the icon directory into `outDir` during build (runtime fallback).
   * Set to `false` when running inside the design system's own dev/storybook —
   * we don't want to pollute the published `dist/`.
   * Default: `true`.
   */
  emit?: boolean;
  /**
   * Project-relative roots (or absolute paths) to scan for static `<BIcon>`
   * usage. Default: `['src']`.
   */
  include?: string[];
  /**
   * Variant assumed when `<BIcon icon="..." />` has no explicit `variant` prop.
   * Must match `BIconVariant.Regular` in the lib. Default: `'regular'`.
   */
  defaultVariant?: string;
  /**
   * Keep the runtime fetch fallback (dev middleware + build-time copy) for
   * icons that can't be statically resolved (dynamic `:icon` bindings, etc.).
   * Default: `true`.
   */
  runtimeFallback?: boolean;
}

const DEFAULT_ROUTE = '/_design-system/icons';

// Sentinel literal shipped in the published BIcon module. The plugin's
// transform finds this exact pattern and replaces it with a populated map of
// statically-used icons. Consumers without this plugin keep the inert literal
// and fall back to the runtime fetch path inside BIcon.
const PLACEHOLDER_KEY = '__BICON_STATIC_ICONS_PLACEHOLDER__';
const PLACEHOLDER_RE = new RegExp(
  `Object\\.freeze\\(\\s*\\{\\s*(?:["']?)${PLACEHOLDER_KEY}\\1?\\s*:\\s*["']["']\\s*,?\\s*\\}\\s*\\)`,
);

const SCAN_EXTS = new Set(['.vue', '.tsx', '.jsx', '.ts', '.js', '.mts', '.mjs']);
const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  '.nuxt',
  '.output',
  '.git',
  '.cache',
  '.vite',
]);

// Matches an opening BIcon tag (PascalCase or kebab-case). The capture is the
// inner attribute string. `[^>]*?` is non-greedy and won't handle a `>` inside
// an attribute value — acceptable, that's vanishingly rare.
const TAG_RE = /<(?:BIcon|b-icon)\b([^>]*?)\/?>/g;

function makeStaticAttrRe(name: string): RegExp {
  // Negative lookbehind excludes `:icon=`, `v-bind:icon=`, `@icon=`, `data-icon=`, etc.
  return new RegExp(`(?<![\\w:@.-])${name}\\s*=\\s*"([^"]*)"`);
}

function makeBooleanAttrRe(name: string): RegExp {
  return new RegExp(`(?<![\\w:@.-])${name}(?=[\\s/>])`);
}

function makeDynamicAttrRe(name: string): RegExp {
  return new RegExp(`(?:^|\\s)(?::|v-bind:)${name}\\s*=`);
}

function getStaticAttr(attrs: string, name: string): string | undefined {
  const m = makeStaticAttrRe(name).exec(attrs);
  return m ? m[1] : undefined;
}

function hasBooleanAttr(attrs: string, name: string): boolean {
  return makeBooleanAttrRe(name).test(attrs);
}

function hasDynamicAttr(attrs: string, name: string): boolean {
  if (makeDynamicAttrRe(name).test(attrs)) return true;
  if (/(?:^|\s)v-bind\s*=/.test(attrs)) return true;
  return false;
}

function scanCode(code: string, defaultVariant: string): Set<string> {
  const keys = new Set<string>();
  TAG_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = TAG_RE.exec(code)) !== null) {
    const attrs = m[1] ?? '';
    if (hasDynamicAttr(attrs, 'icon')) continue;
    const icon = getStaticAttr(attrs, 'icon');
    if (!icon) continue;

    let variant: string;
    if (hasBooleanAttr(attrs, 'brand') || getStaticAttr(attrs, 'brand') === 'true') {
      variant = 'brands';
    } else if (hasDynamicAttr(attrs, 'brand') || hasDynamicAttr(attrs, 'variant')) {
      continue;
    } else {
      variant = getStaticAttr(attrs, 'variant') || defaultVariant;
    }
    keys.add(`${variant}/${icon}`);
  }
  return keys;
}

async function* walkDir(dir: string): AsyncGenerator<string> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkDir(full);
    } else if (entry.isFile() && SCAN_EXTS.has(extname(entry.name))) {
      yield full;
    }
  }
}

function resolveDefaultIconsDir(): string {
  const require = createRequire(import.meta.url);
  const pkgPath = require.resolve('@7pmlabs/design-system/package.json');
  return join(dirname(pkgPath), 'dist/assets/icons');
}

async function copyDir(src: string, dest: string): Promise<void> {
  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });
  await Promise.all(
    entries.map(async (entry) => {
      const s = join(src, entry.name);
      const d = join(dest, entry.name);
      if (entry.isDirectory()) await copyDir(s, d);
      else if (entry.isFile()) await copyFile(s, d);
    }),
  );
}

function normalizeRoute(route: string): string {
  let r = route.startsWith('/') ? route : `/${route}`;
  if (r.endsWith('/')) r = r.slice(0, -1);
  return r;
}

function makeIconMiddleware(iconsDir: string) {
  return async (
    req: { url?: string },
    res: {
      statusCode?: number;
      setHeader: (k: string, v: string) => void;
      end: (s?: string) => void;
      pipe?: unknown;
    },
    next: () => void,
  ): Promise<void> => {
    if (!req.url) return next();
    const relPath = decodeURIComponent(req.url.split('?')[0]);
    const filePath = resolve(iconsDir, '.' + relPath);
    if (!filePath.startsWith(iconsDir)) {
      res.statusCode = 403;
      res.end('Forbidden');
      return;
    }
    try {
      const st = await stat(filePath);
      if (!st.isFile()) return next();
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      createReadStream(filePath).pipe(res as unknown as NodeJS.WritableStream);
    } catch {
      next();
    }
  };
}

export function designSystem(options: DesignSystemPluginOptions = {}): Plugin {
  const route = normalizeRoute(options.iconsRoute ?? DEFAULT_ROUTE);
  const emit = options.emit !== false;
  const defaultVariant = options.defaultVariant ?? 'regular';
  const runtimeFallback = options.runtimeFallback !== false;

  let resolvedIconsDir: string | undefined;
  let viteConfig: ResolvedConfig | undefined;
  let server: ViteDevServer | undefined;

  // Per-source-file scan results — lets us update incrementally on edits
  // in dev (`handleHotUpdate`) without re-reading every file.
  const fileKeys = new Map<string, Set<string>>();
  const allKeys = new Set<string>();
  // Cached SVG content keyed by `<variant>/<name>`. Lazily filled.
  const svgCache = new Map<string, string>();
  // Modules that contain the placeholder literal — invalidated when the
  // icon set changes so they get re-transformed with the new map.
  const consumerModules = new Set<string>();

  function getIconsDir(): string {
    if (resolvedIconsDir) return resolvedIconsDir;
    const dir = options.iconsDir ?? resolveDefaultIconsDir();
    resolvedIconsDir = resolve(dir);
    return resolvedIconsDir;
  }

  function recomputeAllKeys(): void {
    allKeys.clear();
    for (const set of fileKeys.values()) {
      for (const k of set) allKeys.add(k);
    }
  }

  function updateFileKeys(file: string, keys: Set<string>): boolean {
    const prev = fileKeys.get(file);
    const same = prev && prev.size === keys.size && [...keys].every((k) => prev.has(k));
    if (same) return false;
    if (keys.size === 0) fileKeys.delete(file);
    else fileKeys.set(file, keys);
    recomputeAllKeys();
    return true;
  }

  async function loadSvg(key: string): Promise<string | undefined> {
    if (svgCache.has(key)) return svgCache.get(key);
    const iconsDir = getIconsDir();
    const filePath = resolve(iconsDir, key + '.svg');
    if (!filePath.startsWith(iconsDir)) return undefined;
    try {
      const content = await readFile(filePath, 'utf-8');
      svgCache.set(key, content);
      return content;
    } catch {
      return undefined;
    }
  }

  async function buildStaticIconsLiteral(): Promise<string> {
    const sortedKeys = [...allKeys].sort();
    const entries: string[] = [];
    for (const key of sortedKeys) {
      const svg = await loadSvg(key);
      if (svg === undefined) continue;
      entries.push(`${JSON.stringify(key)}:${JSON.stringify(svg)}`);
    }
    return `Object.freeze({${entries.join(',')}})`;
  }

  function invalidateConsumerModules(): void {
    if (!server) return;
    for (const id of consumerModules) {
      const mod = server.moduleGraph.getModuleById(id);
      if (!mod) continue;
      server.moduleGraph.invalidateModule(mod);
      void server.reloadModule(mod).catch(() => {
        /* swallow — happens during teardown */
      });
    }
  }

  return {
    name: '@7pmlabs/design-system',

    configResolved(config) {
      viteConfig = config;
    },

    async buildStart() {
      if (!viteConfig) return;
      // Library builds publish the inert sentinel — no need to scan.
      if (viteConfig.build.lib) return;
      const root = viteConfig.root;
      const includes = options.include ?? ['src'];
      fileKeys.clear();
      consumerModules.clear();
      for (const inc of includes) {
        const dir = resolve(root, inc);
        try {
          const st = await stat(dir);
          if (!st.isDirectory()) continue;
        } catch {
          continue;
        }
        for await (const file of walkDir(dir)) {
          try {
            const code = await readFile(file, 'utf-8');
            const keys = scanCode(code, defaultVariant);
            if (keys.size > 0) fileKeys.set(file, keys);
          } catch {
            /* ignore unreadable */
          }
        }
      }
      recomputeAllKeys();
    },

    async transform(code, id) {
      // Skip when this plugin is running inside a library build (the lib's
      // own dev/build pipeline). We must NOT bake icons into the published
      // BIcon module — consumers' copies of this plugin would then find the
      // sentinel already replaced and silently fail to inline their own
      // statically-used icons. The lib publishes with the inert literal
      // intact; storybook/dev just pay the runtime-fetch tax during preview.
      if (viteConfig?.build.lib) return null;
      // Inject the populated map into any module that carries the sentinel.
      // In practice that's exactly the published BIcon module from the lib,
      // but we don't hard-code its path — any module the lib ships in the
      // future with the same sentinel will be patched the same way.
      if (!code.includes(PLACEHOLDER_KEY)) return null;
      consumerModules.add(id);
      const replacement = await buildStaticIconsLiteral();
      const next = code.replace(PLACEHOLDER_RE, replacement);
      if (next === code) return null;
      return { code: next, map: null };
    },

    // Dev-only: when a consumer source file changes, re-scan it from disk
    // (NOT from a `transform`-time `code` param — vite-plugin-vue would have
    // compiled the template away by then) and invalidate the BIcon module
    // so its sentinel is replaced with the updated map.
    async handleHotUpdate({ file }) {
      const cleanId = file.split('?')[0];
      if (!SCAN_EXTS.has(extname(cleanId))) return;
      const norm = cleanId.replace(/\\/g, '/');
      if (
        norm.includes('/node_modules/') ||
        norm.includes('/.nuxt/') ||
        norm.includes('/.output/')
      ) {
        return;
      }
      let code: string;
      try {
        code = await readFile(cleanId, 'utf-8');
      } catch {
        return;
      }
      const keys = scanCode(code, defaultVariant);
      if (updateFileKeys(cleanId, keys)) invalidateConsumerModules();
    },

    configureServer(s) {
      server = s;
      if (!runtimeFallback) return;
      const handler = makeIconMiddleware(getIconsDir());
      s.middlewares.use(route, handler as never);
    },

    configurePreviewServer(s) {
      if (!runtimeFallback) return;
      const handler = makeIconMiddleware(getIconsDir());
      s.middlewares.use(route, handler as never);
    },

    async closeBundle() {
      if (!emit || !runtimeFallback) return;
      if (!viteConfig || viteConfig.command !== 'build') return;
      const iconsDir = getIconsDir();
      const outDir = resolve(viteConfig.root, viteConfig.build.outDir);
      const dest = join(outDir, route);
      await copyDir(iconsDir, dest);
    },
  };
}

export default designSystem;

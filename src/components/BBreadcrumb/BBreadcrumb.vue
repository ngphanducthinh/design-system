<script lang="ts" setup>
import { useComponentId } from '@/composables/useComponentId.ts';
import type { BBreadcrumbItem } from '@/types';
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';

interface BBreadcrumbItemInternal extends BBreadcrumbItem {
  hidden: boolean;
  width: number;
}

//#region Props
export interface BBreadcrumbProps {
  /**
   * Array of breadcrumb items.
   */
  items?: BBreadcrumbItem[];
  /**
   * Separator string between items.
   * @default '/'
   */
  separator?: string;
}

const props = withDefaults(defineProps<BBreadcrumbProps>(), {
  items: () => [],
  separator: '/',
});
//#endregion

//#region Data
const collapsedBreadcrumbMenu = ref(false);
const ulRef = ref<HTMLOListElement | null>(null);
const liRefs = ref<HTMLLIElement[]>([]);
const ellipsisRef = ref<HTMLSpanElement | null>(null);
const ellipsisMenuRef = ref<HTMLUListElement | null>(null);
const breadcrumbItems = ref<BBreadcrumbItemInternal[]>(
  props.items.map((item) => ({ ...item, hidden: false, width: 0 })),
);
const resizeObserver = new ResizeObserver(() => {
  if (breadcrumbItems.value.length <= 1) {
    return;
  }

  if (!ulRef.value) return;

  const ulRefWidth = ulRef.value.clientWidth;
  const ellipsisRefWidth = ellipsisRef.value?.clientWidth ?? 0;

  for (let i = 1; i < breadcrumbItems.value.length; i++) {
    if (
      breadcrumbItems.value.reduce((acc, item) => (!item.hidden ? acc + item.width : acc), 0) +
        ellipsisRefWidth >
      ulRefWidth
    ) {
      breadcrumbItems.value[i].hidden = true;
    } else {
      break;
    }
  }

  for (let i = breadcrumbItems.value.length - 1; i >= 1; i--) {
    if (breadcrumbItems.value[i].hidden) {
      if (
        breadcrumbItems.value.reduce((acc, item) => (!item.hidden ? acc + item.width : acc), 0) +
          breadcrumbItems.value[i].width +
          ellipsisRefWidth <=
        ulRefWidth
      ) {
        breadcrumbItems.value[i].hidden = false;
      } else {
        break;
      }
    }
  }
});
const isCollapsed = computed(() => breadcrumbItems.value.some((i) => i.hidden));
const { componentUID } = useComponentId();
const ellipsisMenuId = computed(() => `b-breadcrumb-menu-${componentUID.value}`);
//#endregion

//#region Methods
const toggleCollapedBreadcrumbMenu = () => {
  collapsedBreadcrumbMenu.value = !collapsedBreadcrumbMenu.value;
};
const initClickOutsideEventListener = () => {
  document.addEventListener('click', closeOnClickOutside);
};
const removeClickOutsideEventListener = () => {
  document.removeEventListener('click', closeOnClickOutside);
};
const closeOnClickOutside = (event: Event) => {
  const refs = [ellipsisRef.value, ellipsisMenuRef.value].filter(Boolean) as HTMLElement[];
  const withinBoundaries = refs.some((r) => event.composedPath().includes(r));
  if (!withinBoundaries) {
    collapsedBreadcrumbMenu.value = false;
  }
};
const onEllipsisKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    toggleCollapedBreadcrumbMenu();
  } else if (event.key === 'Escape') {
    collapsedBreadcrumbMenu.value = false;
  }
};
//#endregion

//#region Lifecycle hooks
onMounted(() => {
  initClickOutsideEventListener();
  resizeObserver.observe(ulRef.value!);

  nextTick(() => {
    breadcrumbItems.value.forEach((item, index) => {
      if (liRefs.value[index]) {
        item.width = liRefs.value[index].clientWidth;
      }
    });
  });
});
onUnmounted(() => {
  removeClickOutsideEventListener();
  if (ulRef.value) {
    resizeObserver.unobserve(ulRef.value);
  }
  resizeObserver.disconnect();
});
//#endregion
</script>

<template>
  <nav class="b-breadcrumb" aria-label="Breadcrumb">
    <ol ref="ulRef" role="list" class="b-breadcrumb__list b:relative b:flex">
      <template v-for="(item, index) in breadcrumbItems" :key="`item-${item.text}`">
        <li
          ref="liRefs"
          class="b-breadcrumb__item b:whitespace-nowrap b:text-black/[0.85]"
          :class="{ 'b:pl-2': index > 0 }"
        >
          <slot :item="item" :name="`item-${index}`">
            <a
              :href="item.href"
              :title="item.text"
              class="b-breadcrumb__link b:cursor-pointer b:transition-colors b:hover:text-primary"
              :aria-current="index === breadcrumbItems.length - 1 ? 'page' : undefined"
            >
              {{ item.text }}
            </a>
          </slot>

          <span
            v-if="index < breadcrumbItems.length - 1"
            aria-hidden="true"
            class="b-breadcrumb__separator b:pl-2"
          >
            <slot :item="item" :name="`separator-${index}`">
              {{ separator }}
            </slot>
          </span>
        </li>

        <!-- Ellipsis control after the first item -->
        <li v-if="index === 0 && isCollapsed" class="b-breadcrumb__ellipsis b:pl-2">
          <span ref="ellipsisRef" class="b:inline-block">
            <button
              type="button"
              class="b-breadcrumb__ellipsis-btn b:cursor-pointer b:rounded-lg b:bg-slate-100 b:px-2 b:text-primary b:transition-colors b:hover:bg-slate-50"
              :class="{ 'b:bg-slate-50': collapsedBreadcrumbMenu }"
              :aria-expanded="collapsedBreadcrumbMenu"
              aria-label="Show hidden breadcrumb items"
              @click.stop="toggleCollapedBreadcrumbMenu"
              @keydown="onEllipsisKeydown"
            >
              ...
            </button>
            <ol
              v-show="collapsedBreadcrumbMenu"
              :id="ellipsisMenuId"
              ref="ellipsisMenuRef"
              class="b:absolute b:mt-1 b:space-y-2 b:rounded-lg b:bg-white b:p-4 b:shadow"
            >
              <li
                v-for="hiddenItem in breadcrumbItems.filter((i) => i.hidden)"
                :key="hiddenItem.text"
              >
                <a
                  :href="hiddenItem.href"
                  :title="hiddenItem.text"
                  class="b-breadcrumb__link b:cursor-pointer b:transition-colors b:hover:text-primary"
                >
                  {{ hiddenItem.text }}
                </a>
              </li>
            </ol>
          </span>
        </li>
      </template>
    </ol>
  </nav>
</template>

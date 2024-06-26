<script lang="ts" setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
import { v4 as uuid } from 'uuid';
import type { BBreadcrumbItem } from '@/types';
import BBreadcrumbSeparator from '@/components/BBreadcrumb/BBreadcrumbSeparator.vue';

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
}

const props = withDefaults(defineProps<BBreadcrumbProps>(), {
  items: () => [],
});
//#endregion

//#region Data
const collapsedBreadcrumbMenu = ref(false);
const ulRef = ref<HTMLUListElement | null>(null);
const liRefs = ref<HTMLLIElement[] | null>(null);
const ellipsisRefs = ref<HTMLSpanElement[] | null>(null);
const ellipsisMenuRefs = ref<HTMLUListElement[] | null>(null);
const breadcrumbItems = ref<BBreadcrumbItemInternal[]>([]);
const resizeObserver = new ResizeObserver(() => {
  if (breadcrumbItems.value.length <= 1) {
    return;
  }

  const ulRefWidth = ulRef.value!.clientWidth;
  const ellipsisRefWidth = ellipsisRefs.value![0].clientWidth;

  for (let i = 1; i < breadcrumbItems.value.length; i++) {
    if (
      breadcrumbItems.value.reduce(
        (acc, item) => (!item.hidden ? acc + item.width : acc),
        0,
      ) +
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
        breadcrumbItems.value.reduce(
          (acc, item) => (!item.hidden ? acc + item.width : acc),
          0,
        ) +
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
const ellipsisMenuId = computed(() => `menu-id-${uuid()}`);
//#region

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
const closeOnClickOutside = (event: any) => {
  const refs = [ellipsisRefs.value![0], ellipsisMenuRefs.value![0]];
  const withinBoundaries = refs.some((r) => event.composedPath().includes(r));
  if (!withinBoundaries) {
    collapsedBreadcrumbMenu.value = false;
  }
};
//#region

//#region Lifecycle hooks
onMounted(() => {
  initClickOutsideEventListener();
  resizeObserver.observe(ulRef.value!);

  breadcrumbItems.value = props.items.map(
    (item) =>
      ({
        ...item,
        hidden: false,
        width: 0,
      }) as BBreadcrumbItemInternal,
  );
  nextTick(() => {
    breadcrumbItems.value.forEach((item, index) => {
      item.width = liRefs.value![index].clientWidth;
    });
  });
});
onUnmounted(() => {
  removeClickOutsideEventListener();
  resizeObserver.unobserve(ulRef.value!);
});
//#region
</script>

<template>
  <nav>
    <ol
      ref="ulRef"
      :class="{ collapsed: isCollapsed }"
      class="ds-relative ds-flex"
    >
      <template
        v-for="(item, index) in breadcrumbItems"
        :key="`item${item.text}`"
      >
        <template v-if="index === 0">
          <li ref="liRefs" class="ds-whitespace-nowrap ds-text-black/[0.85]">
            <slot :item="item" :name="`item-${index}`">
              <a
                :href="item.href"
                :title="item.href"
                class="ds-transition-colors hover:ds-text-primary-t"
              >
                {{ item.text }}
              </a>
            </slot>

            <span aria-hidden="true" class="ds-pl-2">
              <slot :item="item" :name="`separator-${index}`">
                <BBreadcrumbSeparator />
              </slot>
            </span>

            <div ref="ellipsisRefs" class="ds-inline-block">
              <button
                v-show="isCollapsed"
                :class="{ 'ds-bg-slate-50': collapsedBreadcrumbMenu }"
                class="ds-ml-2 ds-rounded-lg ds-bg-slate-100 ds-px-2 ds-text-primary-t ds-transition-colors hover:ds-bg-slate-50"
                @click="toggleCollapedBreadcrumbMenu"
              >
                ...
              </button>
              <ol
                v-show="isCollapsed && collapsedBreadcrumbMenu"
                :id="ellipsisMenuId"
                ref="ellipsisMenuRefs"
                class="ds-absolute ds-mt-1 ds-space-y-2 ds-rounded-lg ds-bg-white ds-p-4 ds-shadow"
              />
            </div>
          </li>
        </template>

        <template v-else>
          <Teleport :disabled="!item.hidden" :to="`#${ellipsisMenuId}`">
            <li
              ref="liRefs"
              class="ds-whitespace-nowrap ds-pl-2 ds-text-black/[0.85]"
            >
              <slot :item="item" :name="`item-${index}`">
                <a
                  :href="item.href"
                  :title="item.href"
                  class="ds-transition-colors hover:ds-text-primary-t"
                >
                  {{ item.text }}
                </a>
              </slot>

              <span
                v-if="index < items?.length - 1"
                aria-hidden="true"
                class="ds-pl-2"
              >
                <slot :item="item" :name="`separator-${index}`">
                  <BBreadcrumbSeparator />
                </slot>
              </span>
            </li>
          </Teleport>
        </template>
      </template>
    </ol>
  </nav>
</template>

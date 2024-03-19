<script lang="ts" setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
import { v4 as uuid } from 'uuid';
import type { BBreadcrumbItem } from '@/types';

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
const menuRefs = ref<HTMLUListElement[] | null>(null);
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
const menuId = computed(() => `menu-id-${uuid()}`);
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
  const refs = [ellipsisRefs.value![0], menuRefs.value![0]];
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
  <ul
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
              class="hover:ds-text-primary-t"
            >
              {{ item.text }}
            </a>
          </slot>

          <span aria-hidden="true" class="ds-pl-2">
            <slot :item="item" :name="`separator-${index}`">
              <svg
                class="ds-mb-0.5 ds-inline-block ds-h-4 ds-w-4"
                viewBox="0 0 320 512"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"
                />
              </svg>
            </slot>
          </span>

          <button
            v-show="isCollapsed"
            ref="ellipsisRefs"
            :class="{ 'ds-bg-slate-50': collapsedBreadcrumbMenu }"
            class="ds-ml-2 ds-rounded-lg ds-bg-slate-100 ds-px-2 ds-text-primary-t hover:ds-bg-slate-50"
            @click="toggleCollapedBreadcrumbMenu"
          >
            ...
          </button>
          <ul
            v-show="isCollapsed && collapsedBreadcrumbMenu"
            :id="menuId"
            ref="menuRefs"
            class="ds-absolute ds-space-y-2 ds-rounded-lg ds-bg-white ds-p-4 ds-shadow"
          />
        </li>
      </template>

      <template v-else>
        <Teleport :disabled="!item.hidden" :to="`#${menuId}`">
          <li
            ref="liRefs"
            class="ds-whitespace-nowrap ds-pl-2 ds-text-black/[0.85]"
          >
            <slot :item="item" :name="`item-${index}`">
              <a
                :href="item.href"
                :title="item.href"
                class="hover:ds-text-primary-t"
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
                <svg
                  class="ds-mb-0.5 ds-inline-block ds-h-4 ds-w-4"
                  viewBox="0 0 320 512"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"
                  />
                </svg>
              </slot>
            </span>
          </li>
        </Teleport>
      </template>
    </template>
  </ul>
</template>

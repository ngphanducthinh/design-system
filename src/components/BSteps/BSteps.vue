<script setup lang="ts">
import BIcon from '@/components/BIcon/BIcon.vue';
import {
  BCommonSize,
  BIconSize,
  BStepsDirection,
  BStepsLabelPlacement,
  BStepsStatus,
  BStepsType,
  type BStepItem,
} from '@/types.ts';
import { computed, toRefs } from 'vue';

export interface BStepsProps {
  /**
   * The step items to render.
   */
  items?: BStepItem[];
  /**
   * Current step index (0-based).
   */
  current?: number;
  /**
   * Status applied to the current step if not overridden by the item.
   */
  status?: `${BStepsStatus}`;
  /**
   * Layout direction.
   */
  direction?: `${BStepsDirection}`;
  /**
   * Size of the step icons and text.
   */
  size?: `${BCommonSize}`;
  /**
   * Placement of labels for horizontal steps.
   */
  labelPlacement?: `${BStepsLabelPlacement}`;
  /**
   * Step type styling.
   */
  type?: `${BStepsType}`;
}

const props = withDefaults(defineProps<BStepsProps>(), {
  items: () => [],
  current: 0,
  status: BStepsStatus.Process,
  direction: BStepsDirection.Horizontal,
  size: BCommonSize.Medium,
  labelPlacement: BStepsLabelPlacement.Horizontal,
  type: BStepsType.Default,
});
const { items, current, status, direction, size, labelPlacement, type } = toRefs(props);

const emit = defineEmits<{
  /**
   * Emitted when the current step changes via user interaction.
   */
  change: [value: number];
  /**
   * Emitted for v-model:current updates.
   */
  'update:current': [value: number];
}>();

const normalizedSize = computed(() =>
  size.value === BCommonSize.Small ? BCommonSize.Small : BCommonSize.Medium,
);
const iconSize = computed(() =>
  normalizedSize.value === BCommonSize.Small ? BIconSize.Small : BIconSize.Medium,
);

const rootStyle = computed(() => ({
  '--b-steps-icon-size': normalizedSize.value === BCommonSize.Small ? '1.5rem' : '2rem',
  '--b-steps-gap': normalizedSize.value === BCommonSize.Small ? '0.5rem' : '0.75rem',
}));

const titleSizeClass = computed(() =>
  normalizedSize.value === BCommonSize.Small ? 'b:text-sm' : 'b:text-base',
);
const descriptionSizeClass = computed(() =>
  normalizedSize.value === BCommonSize.Small ? 'b:text-xs' : 'b:text-sm',
);

const isClickable = computed(() => type.value === BStepsType.Navigation);

const getStepStatus = (item: BStepItem, index: number) => {
  if (item.status) {
    return item.status;
  }
  if (index === current.value) {
    return status.value || BStepsStatus.Process;
  }
  if (index < current.value) {
    return BStepsStatus.Finish;
  }
  return BStepsStatus.Wait;
};

const getTailColor = (status: `${BStepsStatus}`) => {
  switch (status) {
    case BStepsStatus.Finish:
    case BStepsStatus.Process:
      return 'var(--b-color-primary)';
    case BStepsStatus.Error:
      return 'var(--b-color-failure)';
    case BStepsStatus.Wait:
    default:
      return 'var(--b-color-zinc-200)';
  }
};

const onStepClick = (item: BStepItem, index: number) => {
  if (!isClickable.value || item.disabled) {
    return;
  }
  emit('update:current', index);
  emit('change', index);
};

const onStepKeydown = (event: KeyboardEvent, item: BStepItem, index: number) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    onStepClick(item, index);
  }
};

const iconClass = (status: `${BStepsStatus}`) => ({
  'b:border-secondary b:bg-white b:text-secondary': status === BStepsStatus.Wait,
  'b:border-primary b:bg-primary b:text-white': status === BStepsStatus.Process,
  'b:border-primary b:bg-white b:text-primary': status === BStepsStatus.Finish,
  'b:border-failure b:bg-white b:text-failure': status === BStepsStatus.Error,
});
const titleClass = (status: `${BStepsStatus}`) => ({
  'b:text-black-base': status === BStepsStatus.Process || status === BStepsStatus.Finish,
  'b:text-failure': status === BStepsStatus.Error,
  'b:text-black/[0.45]': status === BStepsStatus.Wait,
});
const descriptionClass = (status: `${BStepsStatus}`) => ({
  'b:text-black/[0.45]': status !== BStepsStatus.Error,
  'b:text-failure': status === BStepsStatus.Error,
});
</script>

<template>
  <ol
    class="b-steps"
    :class="[
      {
        'b-steps--horizontal': direction === BStepsDirection.Horizontal,
        'b-steps--vertical': direction === BStepsDirection.Vertical,
        'b-steps--label-vertical':
          direction === BStepsDirection.Horizontal &&
          labelPlacement === BStepsLabelPlacement.Vertical,
        'b-steps--navigation': type === BStepsType.Navigation,
        'b-steps--inline': type === BStepsType.Inline,
      },
    ]"
    :style="rootStyle"
  >
    <li
      v-for="(item, index) in items"
      :key="`${item.title}-${index}`"
      class="b-steps__item"
      :class="[
        { 'b:opacity-50': item.disabled },
        { 'b-steps__item--clickable': isClickable && !item.disabled },
      ]"
      :data-status="getStepStatus(item, index)"
      :style="{ '--b-steps-tail-color': getTailColor(getStepStatus(item, index)) }"
    >
      <div
        class="b-steps__item-inner"
        :role="isClickable && !item.disabled ? 'button' : undefined"
        :tabindex="isClickable && !item.disabled ? 0 : undefined"
        :aria-disabled="item.disabled ? 'true' : undefined"
        :aria-current="index === current ? 'step' : undefined"
        @click="onStepClick(item, index)"
        @keydown="onStepKeydown($event, item, index)"
      >
        <div
          class="b-steps__icon b:flex b:items-center b:justify-center b:rounded-full b:border"
          :class="[
            iconClass(getStepStatus(item, index)),
            {
              'b:h-6 b:w-6': normalizedSize === BCommonSize.Small,
              'b:h-8 b:w-8': normalizedSize === BCommonSize.Medium,
            },
          ]"
        >
          <template v-if="item.icon">
            <BIcon :icon="item.icon" :size="iconSize" />
          </template>
          <template v-else-if="getStepStatus(item, index) === BStepsStatus.Finish">
            <BIcon icon="check" :size="iconSize" />
          </template>
          <template v-else-if="getStepStatus(item, index) === BStepsStatus.Error">
            <BIcon icon="xmark" :size="iconSize" />
          </template>
          <template v-else>
            <span :class="titleSizeClass">{{ index + 1 }}</span>
          </template>
        </div>

        <div
          class="b-steps__content b:flex b:flex-col b:gap-y-1"
          :class="[
            {
              'b:items-center b:text-center':
                direction === BStepsDirection.Horizontal &&
                labelPlacement === BStepsLabelPlacement.Vertical,
            },
          ]"
        >
          <div class="b:flex b:items-center b:gap-x-2">
            <span
              class="b:font-medium"
              :class="[titleSizeClass, titleClass(getStepStatus(item, index))]"
            >
              {{ item.title }}
            </span>
            <span
              v-if="item.subTitle"
              class="b:text-xs b:text-black/[0.45]"
              :class="titleClass(getStepStatus(item, index))"
            >
              {{ item.subTitle }}
            </span>
          </div>
          <p
            v-if="item.description"
            class="b:leading-snug"
            :class="[descriptionSizeClass, descriptionClass(getStepStatus(item, index))]"
          >
            {{ item.description }}
          </p>
        </div>
      </div>
      <span
        v-if="direction === BStepsDirection.Horizontal && index < items.length - 1"
        aria-hidden="true"
        class="b-steps__tail"
      />
    </li>
  </ol>
</template>

<style scoped>
.b-steps {
  display: flex;
  gap: var(--b-steps-gap);
}

.b-steps--vertical {
  flex-direction: column;
}

.b-steps__item {
  position: relative;
  flex: 1;
  min-width: 0;
}

.b-steps__item-inner {
  display: flex;
  align-items: flex-start;
  gap: var(--b-steps-gap);
  flex: 0 1 auto;
  min-width: 0;
}

.b-steps__icon {
  flex-shrink: 0;
}

.b-steps__content {
  flex: 1 1 auto;
  min-width: 0;
}

.b-steps--label-vertical .b-steps__item-inner {
  flex-direction: column;
  align-items: center;
}

.b-steps--inline .b-steps__item-inner {
  align-items: center;
}

.b-steps--inline .b-steps__content {
  flex-direction: row;
  align-items: center;
  gap: var(--b-steps-gap);
}

.b-steps--inline .b-steps__content p {
  display: none;
}

.b-steps__item--clickable .b-steps__item-inner {
  cursor: pointer;
}

.b-steps--horizontal .b-steps__item {
  display: flex;
  align-items: flex-start;
  gap: var(--b-steps-gap);
}

.b-steps--vertical .b-steps__item {
  padding-bottom: var(--b-steps-gap);
}

.b-steps--vertical .b-steps__item::after {
  content: '';
  position: absolute;
  top: calc(var(--b-steps-icon-size) + var(--b-steps-gap));
  left: calc(var(--b-steps-icon-size) / 2);
  bottom: 0;
  width: 1px;
  background-color: var(--b-steps-tail-color);
}

.b-steps--vertical .b-steps__item:last-child::after {
  display: none;
}

.b-steps__tail {
  flex: 1 1 0;
  min-width: 1.5rem;
  height: 1px;
  margin-top: calc(var(--b-steps-icon-size) / 2);
  background-color: var(--b-steps-tail-color);
}

.b-steps--navigation .b-steps__item--clickable .b-steps__content {
  transition: color 0.2s ease;
}

.b-steps--navigation .b-steps__item--clickable:hover .b-steps__content {
  color: var(--b-color-primary);
}
</style>

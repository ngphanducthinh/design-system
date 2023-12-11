<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

/**
 * Props
 */
interface BCarouselProps {
  /**
   * Index of slide.
   */
  modelValue?: number;
  /**
   * Automatically go to the next slide every 5s (default).
   */
  autoplay?: boolean;
  /**
   * Waiting time before going to the next slide.
   */
  duration?: number;
  /**
   * Show navigation controls.
   */
  navigation?: boolean;
  /**
   * Show bottom controls.
   */
  pagination?: boolean;
  /**
   * Return to the first slide after reaching the end.
   */
  continuous?: boolean;
}
const props = withDefaults(defineProps<BCarouselProps>(), {
  modelValue: undefined,
  autoplay: false,
  duration: 5000,
  navigation: false,
  pagination: false,
  continuous: true,
});

/**
 * Events
 */
const emit = defineEmits<{
  'update:modelValue': [value: number];
}>();

/**
 * Data
 */
let autoplayIntervalFn: any;
const mValue = ref(0);
const itemCount = ref(0);
const container = ref<HTMLElement | null>(null);
const carouselItems = ref<Element[] | null>(null);
const value = computed({
  get() {
    return props.modelValue !== undefined ? props.modelValue : mValue.value;
  },
  set(val) {
    if (props.modelValue !== undefined) {
      emit('update:modelValue', val);
    } else {
      mValue.value = val;
    }
  },
});
const showNextNav = computed(
  () => props.continuous || value.value < itemCount.value - 1,
);
const showPrevNav = computed(() => props.continuous || value.value > 0);

/**
 * Watch
 */
watch(value, (val, oldVal) => {
  selectCarouselItem(val, oldVal);
});
watch(
  () => props.autoplay,
  (val) => {
    if (val) {
      if (props.duration > 0) {
        clearAutoPlay();
        setAutoPlay();
      } else {
        clearAutoPlay();
      }
    } else {
      clearAutoPlay();
    }
  },
);
watch(
  () => props.duration,
  (val) => {
    if (props.autoplay) {
      if (val > 0) {
        clearAutoPlay();
        setAutoPlay();
      } else {
        clearAutoPlay();
      }
    }
  },
);

/**
 * Methods
 */
const goToItem = (index: number) => {
  value.value = index;
};
const nextItem = () => {
  if (value.value === itemCount.value - 1) {
    if (props.continuous) {
      value.value = 0;
    }
  } else {
    value.value = value.value + 1;
  }
};
const prevItem = () => {
  if (value.value === 0) {
    if (props.continuous) {
      value.value = itemCount.value - 1;
    }
  } else {
    value.value = value.value - 1;
  }
};
const setAutoPlay = () => {
  autoplayIntervalFn = setInterval(() => {
    nextItem();
  }, props.duration);
};
const clearAutoPlay = () => {
  if (autoplayIntervalFn) {
    clearInterval(autoplayIntervalFn);
  }
};
const selectCarouselItem = (index: number, oldIndex: number) => {
  if (carouselItems.value) {
    // Set activeIndex
    value.value = index;

    // Ensure reverse css classes
    const isReverse = index < oldIndex;
    const slideOutCssClass = isReverse ? 'slide-out-reverse' : 'slide-out';
    const slideInCssClass = isReverse ? 'slide-in-reverse' : 'slide-in';
    if (isReverse) {
      carouselItems.value[oldIndex].classList.add('reverse');
      carouselItems.value[value.value].classList.add('reverse');
    } else {
      carouselItems.value[oldIndex].classList.remove('reverse');
      carouselItems.value[value.value].classList.remove('reverse');
    }

    // Remove active class from previous item
    if (oldIndex !== index) {
      carouselItems.value[oldIndex].classList.remove(
        'slide-in',
        'slide-in-reverse',
      );
      carouselItems.value[oldIndex].classList.add(slideOutCssClass);
      // After 0.5s transition animation, hide the previous item
      setTimeout(() => {
        carouselItems.value![oldIndex].classList.remove('active');
      }, 500);
    }

    // Add active class into active item
    carouselItems.value[value.value].classList.remove(
      'slide-out',
      'slide-out-reverse',
    );
    carouselItems.value[value.value].classList.add(slideInCssClass);
    carouselItems.value[value.value].classList.add('active');
  }
};
const init = () => {
  if (props.autoplay) {
    setAutoPlay();
  }
};

init();

/**
 * Lifecycle Hooks
 */
onMounted(() => {
  if (container.value) {
    const oldValue = value.value;
    const items = container.value.querySelectorAll('.carousel-item') as any;
    if (items.length) {
      itemCount.value = items.length;
      carouselItems.value = [...items];

      carouselItems.value.forEach((carouselItem) => {
        if (carouselItem.classList.contains('active')) {
          value.value = carouselItems.value!.indexOf(carouselItem);
        }
      });
      selectCarouselItem(value.value, oldValue);
    }
  }
});
onBeforeUnmount(() => {
  clearInterval(autoplayIntervalFn);
});
</script>

<template>
  <div
    ref="container"
    class="ds-relative ds-min-h-[6rem] ds-w-full ds-overflow-x-hidden ds-rounded-lg"
  >
    <div class="carousel-content">
      <slot> </slot>
    </div>

    <template v-if="props.navigation">
      <div
        v-if="showPrevNav"
        class="carousel-navigation--left"
        @click="prevItem"
      >
        <div
          class="ds-cursor-pointer ds-rounded-full ds-bg-primary-f/40 ds-p-2 hover:ds-bg-primary-f/70"
        >
          <svg
            class="ds-h-5 ds-w-5 ds-fill-white"
            viewBox="0 0 320 512"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"
            />
          </svg>
        </div>
      </div>
      <div
        v-if="showNextNav"
        class="carousel-navigation--right"
        @click="nextItem"
      >
        <div
          class="ds-cursor-pointer ds-rounded-full ds-bg-primary-f/40 ds-p-2 hover:ds-bg-primary-f/70"
        >
          <svg
            class="ds-h-5 ds-w-5 ds-fill-white"
            viewBox="0 0 320 512"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"
            />
          </svg>
        </div>
      </div>
    </template>

    <div v-if="props.pagination" class="carousel-pagination">
      <span
        v-for="(item, index) in itemCount"
        :key="index"
        :class="{
          'ds-bg-gradient-to-r ds-from-primary-f ds-from-primary-f-stop ds-to-primary-t':
            index === value,
        }"
        @click="goToItem(index)"
      >
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.carousel-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  max-height: 100%;
  height: 100%;
}
.carousel-navigation--left,
.carousel-navigation--right {
  padding: 0 1rem;
  height: 100%;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
}

.carousel-navigation--right {
  right: 0;
}

.carousel-pagination {
  position: absolute;
  bottom: 0.5rem;
  width: 100%;
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;

  span {
    cursor: pointer;
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 50%;
    background-color: #fff;
    box-shadow:
      0 1px 3px 0 rgba(0, 0, 0, 0.1),
      0 1px 2px 0 rgba(0, 0, 0, 0.06);
    opacity: 0.8;
  }
}
</style>

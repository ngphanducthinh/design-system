import { computed, getCurrentInstance } from 'vue';

export function useComponentId() {
  const componentInstance = getCurrentInstance();
  const componentUID = computed(() => componentInstance?.uid);

  return {
    componentUID,
  };
}

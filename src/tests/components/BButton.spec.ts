import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import BButton from '@/components/BButton.vue';

describe('BButton', () => {
  it('renders properly', () => {
    const wrapper = mount(BButton);
    expect(wrapper.exists()).toBeTruthy();
  });
});

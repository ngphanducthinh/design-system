import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import BTextField from '@/components/BTextField.vue';
import mountData from '@/tests/components/DefaultMountData';

describe('BTextField', () => {
  it('renders properly', () => {
    const wrapper = mount(BTextField, { ...mountData });
    expect(wrapper.exists()).toBeTruthy();
  });
});

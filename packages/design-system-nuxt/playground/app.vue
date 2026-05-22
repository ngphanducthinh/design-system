<script setup lang="ts">
import { ref } from 'vue';
import { z } from 'zod';

const form = useValidationForm();
const email = ref('');
const { errors, markTouched } = useValidationField(
  'email',
  email,
  z.string().email('Please enter a valid email'),
);

const onSubmit = () => {
  if (form.validateAll()) {
    alert(`Submitted: ${email.value}`);
  }
};
</script>

<template>
  <div class="b:mx-auto b:flex b:max-w-2xl b:flex-col b:gap-6 b:p-8">
    <header class="b:flex b:flex-col b:gap-2">
      <h1 class="b:text-2xl b:font-semibold">@7pmlabs/design-system in Nuxt 4</h1>
      <p class="b:text-sm b:opacity-70">
        All components below are auto-imported by the Nuxt module — no
        <code>import</code> statements for them in this file.
      </p>
    </header>

    <BAlert
      type="success"
      message="Auto-import works"
      description="If this Alert renders styled, the module wired CSS, SSR transpile, and component registration correctly."
      show-icon
    />

    <section class="b:flex b:flex-col b:gap-3">
      <h2 class="b:text-lg b:font-medium">Buttons</h2>
      <div class="b:flex b:flex-wrap b:gap-2">
        <BButton variant="solid" color="primary">Primary</BButton>
        <BButton variant="outlined" color="primary">Outlined</BButton>
        <BButton variant="text" color="primary">Text</BButton>
        <BButton variant="solid" color="failure">Danger</BButton>
      </div>
    </section>

    <section class="b:flex b:flex-col b:gap-3">
      <h2 class="b:text-lg b:font-medium">Validated input (composable auto-imported)</h2>
      <div class="b:flex b:flex-col b:gap-2">
        <BInput v-model="email" placeholder="you@example.com" @blur="markTouched()" />
        <p v-if="errors.length" class="b:text-sm" style="color: var(--color-failure)">
          {{ errors[0] }}
        </p>
        <div>
          <BButton variant="solid" color="primary" @click="onSubmit">Submit</BButton>
        </div>
      </div>
    </section>

    <section class="b:flex b:flex-col b:gap-3">
      <h2 class="b:text-lg b:font-medium">Tag &amp; Badge</h2>
      <div class="b:flex b:items-center b:gap-3">
        <BTag color="success">Success</BTag>
        <BTag color="warning">Warning</BTag>
        <BBadge :count="42">
          <BButton variant="outlined">Inbox</BButton>
        </BBadge>
      </div>
    </section>
  </div>
</template>

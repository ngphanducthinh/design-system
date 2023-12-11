<script setup lang="ts"></script>

<template>
  <div class="carousel-item">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.carousel-item {
  position: absolute;
  height: 100%;
  width: 100%;
  display: none;
  transform: translateX(100%);

  &.reverse {
    transform: translateX(-100%);
  }

  &.active {
    display: block;
  }
}

// Define transition animation 'slide'
.slide-in {
  animation: slide-in 0.5s forwards;
}
.slide-out {
  animation: slide-out 0.5s forwards;
}
@keyframes slide-in {
  100% {
    transform: translateX(0%);
  }
}
@keyframes slide-out {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-100%);
  }
}

.slide-in-reverse {
  animation: slide-in-reverse 0.5s forwards;
}
.slide-out-reverse {
  animation: slide-out-reverse 0.5s forwards;
}
@keyframes slide-in-reverse {
  100% {
    transform: translateX(0%);
  }
}
@keyframes slide-out-reverse {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>
<style lang="scss">
.carousel-item {
  img {
    min-width: 100%;
    height: 100%;
    // object-fit: cover;
  }
}
</style>

export const ensureVisiblePosition = (
  parentEl: HTMLElement,
  menuEl: HTMLElement,
  menuFixed?: boolean,
): void => {
  ensureVisibleX(parentEl, menuEl, menuFixed);
  ensureVisibleY(parentEl, menuEl, menuFixed);
  // Move menu element into body tag
  document.body.append(menuEl);
};
export const ensureVisibleX = (parentEl: HTMLElement, menuEl: HTMLElement, menuFixed?: boolean) => {
  // Viewport
  const screenWidth = window.innerWidth;

  // https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
  const scrollX = menuFixed ? 0 : window.scrollX;
  const dropdownLeftEdge = parentEl.getBoundingClientRect().left + scrollX;
  const dropdownWidth = parentEl.getBoundingClientRect().width;

  const menuLeftEdge = menuEl.getBoundingClientRect().left + scrollX;
  const menuWidth = menuEl.getBoundingClientRect().width;

  // Apply positions' value
  const isMenuRightEdgeVisible = menuLeftEdge + menuWidth <= screenWidth + scrollX;
  if (isMenuRightEdgeVisible) {
    menuEl.style.left = `${dropdownLeftEdge}px`;
  } else {
    menuEl.style.left = `${dropdownLeftEdge - menuWidth + dropdownWidth}px`;
  }
};
export const ensureVisibleY = (parentEl: HTMLElement, menuEl: HTMLElement, menuFixed?: boolean) => {
  // Viewport
  const screenHeight = window.innerHeight;

  // https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
  // Height of screen can be longer when scrolling down, so TopEdge value should be calculated like this
  const scrollY = menuFixed ? 0 : window.scrollY;
  const dropdownTopEdge = parentEl.getBoundingClientRect().top + scrollY;
  const dropdownHeight = parentEl.getBoundingClientRect().height;

  const menuTopEdge = menuEl.getBoundingClientRect().top + scrollY;
  const menuHeight = menuEl.getBoundingClientRect().height;

  // Apply positions' value
  const isMenuBottomEdgeVisible = menuTopEdge + menuHeight <= screenHeight + scrollY;
  if (isMenuBottomEdgeVisible) {
    menuEl.style.top = `${dropdownTopEdge + dropdownHeight}px`;
  } else {
    menuEl.style.top = `${dropdownTopEdge - menuHeight}px`;
  }
};
export const resetPosition = (parentEl: HTMLElement, menuEl: HTMLElement) => {
  menuEl.style.top = '';
  menuEl.style.right = '';
  menuEl.style.bottom = '';
  menuEl.style.left = '';
  // Move menu element back into dropdown tag
  parentEl.append(menuEl);
};

export const scrollToTop = () => {
  if (window) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};
export const lockScrollBody = () => {
  setTimeout(() => {
    document.body.dataset['scrollLocked'] = '';
    const scrollbarWith = getScrollbarWidth();
    if (scrollbarWith) {
      document.body.style.paddingRight = `${scrollbarWith}px`;
    }
    document.body.style.overflow = 'hidden';
  }, 100);
};
export const unlockScrollBody = () => {
  document.body.removeAttribute('data-scroll-locked');
  document.body.style.paddingRight = '';
  document.body.style.overflow = '';
};
const getScrollbarWidth = () => window.innerWidth - document.documentElement.clientWidth;

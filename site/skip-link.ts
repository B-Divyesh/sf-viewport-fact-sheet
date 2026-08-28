const skipLink = document.querySelector<HTMLAnchorElement>('.skip-link');

skipLink?.addEventListener('click', () => {
  const target = document.querySelector<HTMLElement>(skipLink.hash);
  // Browsers do not consistently focus a hash target, even when it is
  // programmatically focusable. Move focus after the native hash navigation.
  window.requestAnimationFrame(() => target?.focus({ preventScroll: true }));
});

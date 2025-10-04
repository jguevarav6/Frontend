// Small focus-trap utility: trap focus inside a root element and return an untrap function
export function trapFocus(root: HTMLElement) {
  if (!root) return () => {};
  const selector = "a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex='-1'])";
  const getFocusable = () => Array.from(root.querySelectorAll<HTMLElement>(selector));

  function onKey(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;
    const focusable = getFocusable();
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement | null;
    if (e.shiftKey) {
      if (active === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (active === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function onFocusIn(e: FocusEvent) {
    const target = e.target as Node;
    if (root.contains(target)) return;
    const focusable = getFocusable();
    if (focusable.length) focusable[0].focus();
  }

  document.addEventListener('keydown', onKey, true);
  document.addEventListener('focusin', onFocusIn, true);

  return function untrap() {
    document.removeEventListener('keydown', onKey, true);
    document.removeEventListener('focusin', onFocusIn, true);
  };
}

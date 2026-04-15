import type { NavigationFocusBehavior } from '../core/public';

function findFocusable(container: HTMLElement): HTMLElement | null {
  return container.querySelector<HTMLElement>(
    '[data-navigation-autofocus], button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
}

export interface ApplyNavigationFocusOptions {
  container: HTMLElement | null;
  behavior?: NavigationFocusBehavior;
}

export function applyNavigationFocus(
  options: ApplyNavigationFocusOptions,
): void {
  const { container, behavior = 'auto' } = options;

  if (!container || behavior === 'preserve') {
    return;
  }

  if (behavior === 'reset') {
    container.focus();
    return;
  }

  const focusable = findFocusable(container);
  (focusable ?? container).focus();
}

export function restoreNavigationFocus(container: HTMLElement | null): void {
  container?.focus();
}

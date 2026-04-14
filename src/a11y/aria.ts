import type { NavigationAriaLiveMode } from '../core/public';

export interface NavigationAriaAttributes {
  'aria-hidden'?: boolean;
  'aria-label'?: string;
  'aria-live'?: NavigationAriaLiveMode;
}

export function getNavigationViewportAriaAttributes(
  ariaLabel?: string,
  ariaLiveMode?: NavigationAriaLiveMode,
): NavigationAriaAttributes {
  return {
    'aria-label': ariaLabel,
    'aria-live': ariaLiveMode,
  };
}

export function getInactiveSceneAriaAttributes(): NavigationAriaAttributes {
  return {
    'aria-hidden': true,
  };
}

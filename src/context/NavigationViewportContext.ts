import { createContext, type Context } from 'react';

import type {
  NavigationAnchor,
  NavigationDirection,
  NavigationOrientation,
  NavigationReducedMotionPreference,
  NavigationTransitionRuntimeState,
} from '../core/public';

export interface NavigationViewportContextValue {
  anchor: NavigationAnchor;
  direction: NavigationDirection;
  orientation: NavigationOrientation;
  reducedMotion: NavigationReducedMotionPreference;
  transition: NavigationTransitionRuntimeState | null;
}

export const NavigationViewportContext: Context<NavigationViewportContextValue | null> =
  createContext<NavigationViewportContextValue | null>(null);

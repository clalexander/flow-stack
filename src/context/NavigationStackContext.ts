import { createContext, type Context } from 'react';

import type { NavigationStackController } from '../controller/NavigationStackController';
import type { NormalizedNavigationRouteRegistry } from '../routes/normalizeRouteRegistry';

export interface NavigationStackContextValue {
  controller: NavigationStackController;
  routes: NormalizedNavigationRouteRegistry;
}

export const NavigationStackContext: Context<NavigationStackContextValue | null> =
  createContext<NavigationStackContextValue | null>(null);

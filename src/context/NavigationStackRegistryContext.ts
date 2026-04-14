import { createContext, type Context } from 'react';

import type { NavigationStackController } from '../controller/NavigationStackController';
import type { NavigationStackId } from '../core/public';

export interface NavigationStackRegistry {
  get(stackId: NavigationStackId): NavigationStackController | null;
  has(stackId: NavigationStackId): boolean;
}

export const NavigationStackRegistryContext: Context<NavigationStackRegistry | null> =
  createContext<NavigationStackRegistry | null>(null);

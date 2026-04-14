import { useContext } from 'react';

import { NavigationStackContext } from '../context/NavigationStackContext';
import { NavigationStackRegistryContext } from '../context/NavigationStackRegistryContext';
import type {
  NavigationStackController,
  NavigationStackId,
} from '../core/public';

export interface UseNavigationStackResult extends NavigationStackController {}

export function useNavigationStack(
  stackId?: NavigationStackId,
): UseNavigationStackResult {
  const stackContext = useContext(NavigationStackContext);
  const registry = useContext(NavigationStackRegistryContext);

  if (!stackId && stackContext) {
    return stackContext.controller;
  }

  if (stackId && registry?.has(stackId)) {
    const controller = registry.get(stackId);
    if (controller) {
      return controller;
    }
  }

  if (stackId && stackContext?.controller.stackId === stackId) {
    return stackContext.controller;
  }

  throw new Error(
    'No navigation stack is available for the requested stackId.',
  );
}

import { render, act } from '@testing-library/react';

import { NavigationStackProvider } from '../../src/components/NavigationStackProvider';
import { NavigationStackViewport } from '../../src/components/NavigationStackViewport';
import type {
  NavigationStackState,
  NavigationStackId,
  NavigationEntryInput,
  NavigationRouteRef,
  NavigationMountStrategy,
  NavigationRouteRegistry,
} from '../../src/core/public';

export interface RenderStackOptions {
  stackId?: NavigationStackId;
  initialRoute?: NavigationRouteRef;
  initialEntries?: readonly NavigationEntryInput[];
  mountStrategy?: NavigationMountStrategy;
  state?: NavigationStackState;
  onStateChange?: (state: NavigationStackState) => void;
}

export interface RenderStackResult {
  container: HTMLElement;
  unmount: () => void;
}

export function renderStack(
  routes: NavigationRouteRegistry,
  options: RenderStackOptions = {},
): RenderStackResult {
  const stackId = options.stackId ?? 'test-stack';

  const baseProps = {
    id: stackId,
    routes,
  };

  const providerProps =
    options.state !== undefined && options.onStateChange !== undefined
      ? {
          ...baseProps,
          state: options.state,
          onStateChange: options.onStateChange,
        }
      : {
          ...baseProps,
          initialRoute: options.initialRoute,
          initialEntries: options.initialEntries,
        };

  const { container, unmount } = render(
    <NavigationStackProvider
      {...(providerProps as Parameters<typeof NavigationStackProvider>[0])}
    >
      <NavigationStackViewport
        mountStrategy={options.mountStrategy}
        renderScene={({ entry }) => (
          <div
            data-testid={`scene-${entry.routeName}`}
            data-entry-key={entry.key}
          />
        )}
      />
    </NavigationStackProvider>,
  );

  return {
    container,
    unmount,
  };
}

export { act };

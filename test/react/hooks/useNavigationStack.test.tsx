import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, it, expect } from 'vitest';

import { NavigationStackContext } from '../../../src/context/NavigationStackContext';
import { NavigationStackRegistryContext } from '../../../src/context/NavigationStackRegistryContext';
import { createNavigationStackController } from '../../../src/controller/createNavigationStackController';
import { useNavigationStack } from '../../../src/hooks/useNavigationStack';
import { simpleRegistry } from '../../fixtures/routes';

function makeController(id = 'stack-a') {
  return createNavigationStackController({
    id,
    routes: simpleRegistry,
    initialRoute: { name: 'Home' },
  });
}

describe('useNavigationStack', () => {
  it('returns the controller from the nearest context', () => {
    const controller = makeController();
    const routes = {} as never;
    const { result } = renderHook(() => useNavigationStack(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <NavigationStackContext.Provider value={{ controller, routes }}>
          {children}
        </NavigationStackContext.Provider>
      ),
    });
    expect(result.current).toBe(controller);
  });

  it('returns the correct controller when stackId matches context', () => {
    const controller = makeController('my-stack');
    const routes = {} as never;
    const { result } = renderHook(() => useNavigationStack('my-stack'), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <NavigationStackContext.Provider value={{ controller, routes }}>
          {children}
        </NavigationStackContext.Provider>
      ),
    });
    expect(result.current).toBe(controller);
  });

  it('returns the correct controller from registry by stackId', () => {
    const controller = makeController('reg-stack');
    const registry = {
      get: (id: string) => (id === 'reg-stack' ? controller : null),
      has: (id: string) => id === 'reg-stack',
    };
    const { result } = renderHook(() => useNavigationStack('reg-stack'), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <NavigationStackRegistryContext.Provider value={registry}>
          {children}
        </NavigationStackRegistryContext.Provider>
      ),
    });
    expect(result.current).toBe(controller);
  });

  it('throws when no context is available', () => {
    expect(() => renderHook(() => useNavigationStack())).toThrow();
  });

  it('throws when stackId does not match any known stack', () => {
    const controller = makeController('stack-a');
    const routes = {} as never;
    expect(() =>
      renderHook(() => useNavigationStack('stack-b'), {
        wrapper: ({ children }: { children: ReactNode }) => (
          <NavigationStackContext.Provider value={{ controller, routes }}>
            {children}
          </NavigationStackContext.Provider>
        ),
      }),
    ).toThrow();
  });
});

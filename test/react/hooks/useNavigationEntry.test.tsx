import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, it, expect } from 'vitest';

import { NavigationStackContext } from '../../../src/context/NavigationStackContext';
import { createNavigationStackController } from '../../../src/controller/createNavigationStackController';
import { useNavigationEntry } from '../../../src/hooks/useNavigationEntry';
import { simpleRegistry } from '../../fixtures/routes';

function makeController(id = 'stack') {
  return createNavigationStackController({
    id,
    routes: simpleRegistry,
    initialRoute: { name: 'Home' },
  });
}

function Wrapper({
  controller,
}: {
  controller: ReturnType<typeof makeController>;
}) {
  return function WrapperInner({
    children,
  }: {
    children: ReactNode;
  }): ReactNode {
    const routes = {} as never;
    return (
      <NavigationStackContext.Provider value={{ controller, routes }}>
        {children}
      </NavigationStackContext.Provider>
    );
  };
}

describe('useNavigationEntry', () => {
  it('returns the active entry data', () => {
    const controller = makeController();
    const { result } = renderHook(() => useNavigationEntry(), {
      wrapper: Wrapper({ controller }),
    });
    expect(result.current.routeName).toBe('Home');
    expect(result.current.index).toBe(0);
    expect(result.current.isRoot).toBe(true);
    expect(result.current.isActive).toBe(true);
  });

  it('isRoot is true at index 0', () => {
    const controller = makeController();
    const { result } = renderHook(() => useNavigationEntry(), {
      wrapper: Wrapper({ controller }),
    });
    expect(result.current.isRoot).toBe(true);
  });

  it('entryKey matches the active entry key', () => {
    const controller = makeController();
    const { result } = renderHook(() => useNavigationEntry(), {
      wrapper: Wrapper({ controller }),
    });
    expect(result.current.entryKey).toBe(controller.activeEntry!.key);
  });

  it('params reflects the active entry params', () => {
    const controller = createNavigationStackController({
      id: 'stack',
      routes: simpleRegistry,
      initialEntries: [{ name: 'Home', params: { greeting: 'hello' } }],
    });
    const { result } = renderHook(() => useNavigationEntry(), {
      wrapper: Wrapper({ controller }),
    });
    expect((result.current.params as Record<string, unknown>).greeting).toBe(
      'hello',
    );
  });

  it('isRoot becomes false after push', () => {
    const controller = makeController();
    // Capture the hook result reactively by wrapping in a stateful component
    // Use a controlled wrapper that re-renders on controller state changes
    const { result, rerender } = renderHook(() => useNavigationEntry(), {
      wrapper: ({ children }: { children: ReactNode }) => {
        const routes = {} as never;
        return (
          <NavigationStackContext.Provider value={{ controller, routes }}>
            {children}
          </NavigationStackContext.Provider>
        );
      },
    });

    act(() => {
      controller.push('Detail');
    });
    rerender();

    expect(result.current.isRoot).toBe(false);
    expect(result.current.index).toBe(1);
  });
});

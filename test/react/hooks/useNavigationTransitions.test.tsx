import { renderHook } from '@testing-library/react';
import React from 'react';
import type { ReactNode } from 'react';
import { describe, it, expect } from 'vitest';

import { NavigationStackContext } from '../../../src/context/NavigationStackContext';
import { NavigationViewportContext } from '../../../src/context/NavigationViewportContext';
import { createNavigationStackController } from '../../../src/controller/createNavigationStackController';
import { useNavigationTransitions } from '../../../src/hooks/useNavigationTransitions';
import { simpleRegistry } from '../../fixtures/routes';

function makeController() {
  return createNavigationStackController({
    id: 'stack',
    routes: simpleRegistry,
    initialRoute: { name: 'Home' },
  });
}

function ContextWrapper({
  children,
  viewportValue,
}: {
  children: ReactNode;
  viewportValue?: React.ContextType<typeof NavigationViewportContext>;
}): ReactNode {
  const controller = makeController();
  const routes = {} as never;
  return (
    <NavigationStackContext.Provider value={{ controller, routes }}>
      <NavigationViewportContext.Provider value={viewportValue ?? null}>
        {children}
      </NavigationViewportContext.Provider>
    </NavigationStackContext.Provider>
  );
}

describe('useNavigationTransitions', () => {
  it('returns null phase when no transition is active', () => {
    const { result } = renderHook(() => useNavigationTransitions(), {
      wrapper: ({ children }) => <ContextWrapper>{children}</ContextWrapper>,
    });
    expect(result.current.phase).toBeNull();
  });

  it('returns isReducedMotion false when no viewport context', () => {
    const { result } = renderHook(() => useNavigationTransitions(), {
      wrapper: ({ children }) => <ContextWrapper>{children}</ContextWrapper>,
    });
    expect(result.current.isReducedMotion).toBe(false);
  });

  it('returns anchor from viewport context', () => {
    const viewport = {
      anchor: 'right' as const,
      direction: 'forward' as const,
      orientation: 'horizontal' as const,
      reducedMotion: 'never' as const,
      transition: null,
    };
    const { result } = renderHook(() => useNavigationTransitions(), {
      wrapper: ({ children }) => (
        <ContextWrapper viewportValue={viewport}>{children}</ContextWrapper>
      ),
    });
    expect(result.current.anchor).toBe('right');
  });

  it('returns direction from viewport context when no active transition', () => {
    const viewport = {
      anchor: 'left' as const,
      direction: 'backward' as const,
      orientation: 'horizontal' as const,
      reducedMotion: 'never' as const,
      transition: null,
    };
    const { result } = renderHook(() => useNavigationTransitions(), {
      wrapper: ({ children }) => (
        <ContextWrapper viewportValue={viewport}>{children}</ContextWrapper>
      ),
    });
    expect(result.current.direction).toBe('backward');
  });

  it('returns isReducedMotion true when viewport reducedMotion is "always"', () => {
    const viewport = {
      anchor: 'left' as const,
      direction: 'forward' as const,
      orientation: 'horizontal' as const,
      reducedMotion: 'always' as const,
      transition: null,
    };
    const { result } = renderHook(() => useNavigationTransitions(), {
      wrapper: ({ children }) => (
        <ContextWrapper viewportValue={viewport}>{children}</ContextWrapper>
      ),
    });
    expect(result.current.isReducedMotion).toBe(true);
  });
});

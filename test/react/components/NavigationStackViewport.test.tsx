import { render, screen, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { NavigationStackProvider } from '../../../src/components/NavigationStackProvider';
import { NavigationStackViewport } from '../../../src/components/NavigationStackViewport';
import type { NavigationStackState } from '../../../src/core/public';
import { useNavigationStack } from '../../../src/hooks/useNavigationStack';
import { simpleRegistry } from '../../fixtures/routes';

function Stack({
  initialRoute = 'Home',
  mountStrategy = 'active-only' as const,
  ariaLabel,
}: {
  initialRoute?: string;
  mountStrategy?: 'active-only' | 'active-plus-previous' | 'keep-alive';
  ariaLabel?: string;
}): ReactNode {
  return (
    <NavigationStackProvider
      id="test"
      routes={simpleRegistry}
      initialRoute={{ name: initialRoute }}
    >
      <NavigationStackViewport
        mountStrategy={mountStrategy}
        ariaLabel={ariaLabel}
        renderScene={({ entry, isActive }) => (
          <div
            data-testid={`scene-${entry.routeName}`}
            data-active={String(isActive)}
          />
        )}
      />
    </NavigationStackProvider>
  );
}

function StackWithActions({
  mountStrategy = 'keep-alive' as const,
}: {
  mountStrategy?: 'active-only' | 'active-plus-previous' | 'keep-alive';
}): ReactNode {
  return (
    <NavigationStackProvider
      id="test"
      routes={simpleRegistry}
      initialRoute={{ name: 'Home' }}
    >
      <NavigationStackViewport
        mountStrategy={mountStrategy}
        renderScene={({ entry, isActive }) => (
          <div
            data-testid={`scene-${entry.routeName}`}
            data-active={String(isActive)}
          />
        )}
      />
      <ActionButtons />
    </NavigationStackProvider>
  );
}

function ActionButtons(): ReactNode {
  const c = useNavigationStack();
  return (
    <>
      <button data-testid="push-detail" onClick={() => c.push('Detail')} />
      <button data-testid="pop" onClick={() => c.pop()} />
    </>
  );
}

describe('NavigationStackViewport', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial render', () => {
    it('renders the initial scene', () => {
      render(<Stack />);
      expect(screen.getByTestId('scene-Home')).toBeTruthy();
    });

    it('marks the initial scene as active', () => {
      render(<Stack />);
      expect(screen.getByTestId('scene-Home').dataset.active).toBe('true');
    });

    it('does not render other scenes with active-only strategy', () => {
      render(<Stack mountStrategy="active-only" />);
      expect(() => screen.getByTestId('scene-Detail')).toThrow();
    });
  });

  describe('mount strategies', () => {
    it('keep-alive renders all entered scenes', async () => {
      render(<StackWithActions mountStrategy="keep-alive" />);

      await act(async () => {
        screen.getByTestId('push-detail').click();
      });

      expect(screen.getByTestId('scene-Home')).toBeTruthy();
      expect(screen.getByTestId('scene-Detail')).toBeTruthy();
    });

    it('active-only renders only the current scene', async () => {
      render(<StackWithActions mountStrategy="active-only" />);

      await act(async () => {
        screen.getByTestId('push-detail').click();
      });

      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      // after transition finalized Detail is active, Home should be unmounted
      expect(() => screen.getByTestId('scene-Home')).toThrow();
      expect(screen.getByTestId('scene-Detail')).toBeTruthy();
    });
  });

  describe('aria attributes', () => {
    it('applies aria-label to the viewport container', () => {
      render(<Stack ariaLabel="Main navigation" />);
      const container = screen
        .getByTestId('scene-Home')
        .closest('[aria-label]');
      expect(container?.getAttribute('aria-label')).toBe('Main navigation');
    });
  });

  describe('controlled state', () => {
    it('renders entries from an externally supplied state with keep-alive', () => {
      const externalState: NavigationStackState = {
        entries: [
          {
            key: 'k1',
            routeName: 'Home',
            params: {},
            createdAt: 0,
            state: 'inactive' as const,
          },
          {
            key: 'k2',
            routeName: 'Detail',
            params: {},
            createdAt: 1,
            state: 'active' as const,
          },
        ],
        activeIndex: 1,
        isTransitioning: false,
        lastAction: null,
        transition: null,
      };

      render(
        <NavigationStackProvider
          id="ctrl"
          routes={simpleRegistry}
          state={externalState}
          onStateChange={() => {}}
        >
          <NavigationStackViewport
            mountStrategy="keep-alive"
            renderScene={({ entry, isActive }) => (
              <div
                data-testid={`scene-${entry.routeName}`}
                data-active={String(isActive)}
              />
            )}
          />
        </NavigationStackProvider>,
      );

      expect(screen.getByTestId('scene-Home').dataset.active).toBe('false');
      expect(screen.getByTestId('scene-Detail').dataset.active).toBe('true');
    });
  });
});

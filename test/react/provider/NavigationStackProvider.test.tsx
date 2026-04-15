import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { NavigationStackProvider } from '../../../src/components/NavigationStackProvider';
import { NavigationStackViewport } from '../../../src/components/NavigationStackViewport';
import type { NavigationStackState } from '../../../src/core/public';
import { simpleRegistry } from '../../fixtures/routes';

function TestStack({
  initialRoute = 'Home',
  mountStrategy,
}: {
  initialRoute?: string;
  mountStrategy?: 'active-only' | 'active-plus-previous' | 'keep-alive';
}): ReactNode {
  return (
    <NavigationStackProvider
      id="test"
      routes={simpleRegistry}
      initialRoute={{ name: initialRoute }}
    >
      <NavigationStackViewport
        mountStrategy={mountStrategy}
        renderScene={({ entry }) => (
          <div data-testid={`scene-${entry.routeName}`} />
        )}
      />
    </NavigationStackProvider>
  );
}

describe('NavigationStackProvider (uncontrolled)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the initial scene', () => {
    render(<TestStack initialRoute="Home" />);
    expect(screen.getByTestId('scene-Home')).toBeTruthy();
  });

  it('does not render other scenes with active-only strategy', () => {
    render(<TestStack initialRoute="Home" mountStrategy="active-only" />);
    expect(() => screen.getByTestId('scene-Detail')).toThrow();
  });

  it('renders the new scene after push', () => {
    render(<TestStack initialRoute="Home" />);
    expect(screen.getByTestId('scene-Home')).toBeTruthy();
  });
});

describe('NavigationStackProvider (controlled)', () => {
  it('renders entries from the supplied state', () => {
    // Start with a state that has two entries
    const initialState = {
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
    const onStateChange = vi.fn();

    render(
      <NavigationStackProvider
        id="ctrl"
        routes={simpleRegistry}
        state={initialState}
        onStateChange={onStateChange}
      >
        <NavigationStackViewport
          mountStrategy="keep-alive"
          renderScene={({ entry }) => (
            <div data-testid={`scene-${entry.routeName}`} />
          )}
        />
      </NavigationStackProvider>,
    );

    expect(screen.getByTestId('scene-Home')).toBeTruthy();
    expect(screen.getByTestId('scene-Detail')).toBeTruthy();
  });

  it('calls onStateChange when an action is dispatched', async () => {
    const onStateChange = vi.fn();

    function ControlledStack(): ReactNode {
      const [state, setState] = useState<NavigationStackState>({
        entries: [
          {
            key: 'k1',
            routeName: 'Home',
            params: {},
            createdAt: 0,
            state: 'active' as const,
          },
        ],
        activeIndex: 0,
        isTransitioning: false,
        lastAction: null,
        transition: null,
      });

      return (
        <NavigationStackProvider
          id="ctrl"
          routes={simpleRegistry}
          state={state}
          onStateChange={(s) => {
            setState(s);
            onStateChange(s);
          }}
        >
          <NavigationStackViewport
            renderScene={({ entry }) => (
              <div data-testid={`scene-${entry.routeName}`} />
            )}
          />
        </NavigationStackProvider>
      );
    }

    render(<ControlledStack />);
    expect(onStateChange).not.toHaveBeenCalled();
  });
});

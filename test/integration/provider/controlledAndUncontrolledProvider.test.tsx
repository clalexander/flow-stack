import { render, screen, act } from '@testing-library/react';
import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { NavigationStackProvider } from '../../../src/components/NavigationStackProvider';
import { NavigationStackViewport } from '../../../src/components/NavigationStackViewport';
import type { NavigationActionContext, NavigationActiveEntryChangeContext, NavigationStackState } from '../../../src/core/public';
import { useNavigationStack } from '../../../src/hooks/useNavigationStack';
import { simpleRegistry } from '../../fixtures/routes';

/** Helper: renders a stack and exposes controller imperative methods via a global ref for tests. */
function UncontrolledStack({
  onReady,
}: {
  onReady: (controller: ReturnType<typeof useNavigationStack>) => void;
}): ReactNode {
  return (
    <NavigationStackProvider
      id="test"
      routes={simpleRegistry}
      initialRoute={{ name: 'Home' }}
    >
      <NavigationStackViewport
        mountStrategy="keep-alive"
        renderScene={({ entry }) => (
          <div data-testid={`scene-${entry.routeName}`} />
        )}
      />
      <ControllerCapture onReady={onReady} />
    </NavigationStackProvider>
  );
}

function ControllerCapture({
  onReady,
}: {
  onReady: (c: ReturnType<typeof useNavigationStack>) => void;
}): ReactNode {
  const c = useNavigationStack();
  React.useEffect(() => {
    onReady(c);
  }, [c, onReady]);
  return null;
}

describe('uncontrolled NavigationStackProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with the initial route', () => {
    let controller: ReturnType<typeof useNavigationStack> | null = null;
    render(
      <UncontrolledStack
        onReady={(c) => {
          controller = c;
        }}
      />,
    );
    expect(controller).not.toBeNull();
    expect(controller!.depth).toBe(1);
    expect(controller!.activeEntry?.routeName).toBe('Home');
  });

  it('renders the active scene', () => {
    render(<UncontrolledStack onReady={() => {}} />);
    expect(screen.getByTestId('scene-Home')).toBeTruthy();
  });

  it('updates state after a push action', async () => {
    let controller: ReturnType<typeof useNavigationStack> | null = null;
    render(
      <UncontrolledStack
        onReady={(c) => {
          controller = c;
        }}
      />,
    );

    await act(async () => {
      controller!.push('Detail');
    });

    // keep-alive shows both
    expect(screen.getByTestId('scene-Home')).toBeTruthy();
    expect(screen.getByTestId('scene-Detail')).toBeTruthy();
  });

  it('finalizes transition state after timeout', async () => {
    let controller: ReturnType<typeof useNavigationStack> | null = null;
    render(
      <UncontrolledStack
        onReady={(c) => {
          controller = c;
        }}
      />,
    );

    await act(async () => {
      controller!.push('Detail');
    });

    // Advance timers to trigger finalizeTransition
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(controller!.state.isTransitioning).toBe(false);
  });
});

describe('controlled NavigationStackProvider', () => {
  it('renders entries from externally supplied state', () => {
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

    function ControlledTest(): ReactNode {
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
          <Pusher />
        </NavigationStackProvider>
      );
    }

    function Pusher(): ReactNode {
      const c = useNavigationStack();
      React.useEffect(() => {
        c.push('Detail');
      }, []);
      return null;
    }

    await act(async () => {
      render(<ControlledTest />);
    });

    expect(onStateChange).toHaveBeenCalled();
    const nextState = onStateChange.mock.calls[0]?.[0] as NavigationStackState;
    expect(nextState.entries.length).toBeGreaterThan(1);
  });

  it('does not change internal state on action — only calls onStateChange', async () => {
    const onStateChange = vi.fn();
    const fixedState: NavigationStackState = {
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
    };

    function PushOnMount(): ReactNode {
      const c = useNavigationStack();
      React.useEffect(() => {
        c.push('Detail');
      }, []);
      return null;
    }

    await act(async () => {
      render(
        <NavigationStackProvider
          id="ctrl"
          routes={simpleRegistry}
          state={fixedState}
          onStateChange={onStateChange}
        >
          <NavigationStackViewport
            renderScene={({ entry }) => (
              <div data-testid={`scene-${entry.routeName}`} />
            )}
          />
          <PushOnMount />
        </NavigationStackProvider>,
      );
    });

    // State prop is never updated since we pass fixedState (controlled external)
    // Only one scene should be visible
    expect(screen.getAllByTestId(/scene-/).length).toBe(1);
    expect(onStateChange).toHaveBeenCalled();
  });
});

describe('NavigationStackProvider lifecycle callbacks', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls onAction after a successful push', async () => {
    const onAction = vi.fn();
    let controller: ReturnType<typeof useNavigationStack> | null = null;

    render(
      <NavigationStackProvider
        id="test"
        routes={simpleRegistry}
        initialRoute={{ name: 'Home' }}
        onAction={onAction}
      >
        <NavigationStackViewport renderScene={() => <div />} />
        <ControllerCapture
          onReady={(c) => {
            controller = c;
          }}
        />
      </NavigationStackProvider>,
    );

    await act(async () => {
      controller!.push('Detail');
    });

    expect(onAction).toHaveBeenCalledOnce();
    expect((onAction.mock.calls[0]?.[0] as NavigationActionContext).action.type).toBe('push');
  });

  it('blocks an action when onBeforeAction returns false', async () => {
    const onBeforeAction = vi.fn().mockReturnValue(false);
    const onBlockedAction = vi.fn();
    let controller: ReturnType<typeof useNavigationStack> | null = null;

    render(
      <NavigationStackProvider
        id="test"
        routes={simpleRegistry}
        initialRoute={{ name: 'Home' }}
        onBeforeAction={onBeforeAction}
        onBlockedAction={onBlockedAction}
      >
        <NavigationStackViewport renderScene={() => <div />} />
        <ControllerCapture
          onReady={(c) => {
            controller = c;
          }}
        />
      </NavigationStackProvider>,
    );

    await act(async () => {
      controller!.push('Detail');
    });

    expect(onBlockedAction).toHaveBeenCalledOnce();
    expect(controller!.depth).toBe(1);
  });

  it('blocks push when maxDepth is exceeded', async () => {
    const onBlockedAction = vi.fn();
    let controller: ReturnType<typeof useNavigationStack> | null = null;

    render(
      <NavigationStackProvider
        id="test"
        routes={simpleRegistry}
        initialRoute={{ name: 'Home' }}
        maxDepth={1}
        onBlockedAction={onBlockedAction}
      >
        <NavigationStackViewport renderScene={() => <div />} />
        <ControllerCapture
          onReady={(c) => {
            controller = c;
          }}
        />
      </NavigationStackProvider>,
    );

    await act(async () => {
      controller!.push('Detail');
    });

    expect(onBlockedAction).toHaveBeenCalled();
    expect(controller!.depth).toBe(1);
  });

  it('calls onActiveEntryChange when active entry changes', async () => {
    const onActiveEntryChange = vi.fn();
    let controller: ReturnType<typeof useNavigationStack> | null = null;

    render(
      <NavigationStackProvider
        id="test"
        routes={simpleRegistry}
        initialRoute={{ name: 'Home' }}
        onActiveEntryChange={onActiveEntryChange}
      >
        <NavigationStackViewport renderScene={() => <div />} />
        <ControllerCapture
          onReady={(c) => {
            controller = c;
          }}
        />
      </NavigationStackProvider>,
    );

    onActiveEntryChange.mockClear();

    await act(async () => {
      controller!.push('Detail');
    });

    expect(onActiveEntryChange).toHaveBeenCalled();
    const { entry } = onActiveEntryChange.mock.calls[
      onActiveEntryChange.mock.calls.length - 1
    ]?.[0] as NavigationActiveEntryChangeContext;
    expect(entry?.routeName).toBe('Detail');
  });

  it('calls onDepthChange when stack depth changes', async () => {
    const onDepthChange = vi.fn();
    let controller: ReturnType<typeof useNavigationStack> | null = null;

    render(
      <NavigationStackProvider
        id="test"
        routes={simpleRegistry}
        initialRoute={{ name: 'Home' }}
        onDepthChange={onDepthChange}
      >
        <NavigationStackViewport renderScene={() => <div />} />
        <ControllerCapture
          onReady={(c) => {
            controller = c;
          }}
        />
      </NavigationStackProvider>,
    );

    onDepthChange.mockClear();

    await act(async () => {
      controller!.push('Detail');
    });

    expect(onDepthChange).toHaveBeenCalledWith(2);
  });

  it('pop action decrements stack depth', async () => {
    let controller: ReturnType<typeof useNavigationStack> | null = null;

    render(
      <NavigationStackProvider
        id="test"
        routes={simpleRegistry}
        initialRoute={{ name: 'Home' }}
      >
        <NavigationStackViewport renderScene={() => <div />} />
        <ControllerCapture
          onReady={(c) => {
            controller = c;
          }}
        />
      </NavigationStackProvider>,
    );

    await act(async () => {
      controller!.push('Detail');
    });
    expect(controller!.depth).toBe(2);

    await act(async () => {
      controller!.pop();
    });
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(controller!.depth).toBe(1);
  });

  it('popToRoot collapses stack to a single entry', async () => {
    let controller: ReturnType<typeof useNavigationStack> | null = null;

    render(
      <NavigationStackProvider
        id="test"
        routes={simpleRegistry}
        initialRoute={{ name: 'Home' }}
      >
        <NavigationStackViewport renderScene={() => <div />} />
        <ControllerCapture
          onReady={(c) => {
            controller = c;
          }}
        />
      </NavigationStackProvider>,
    );

    await act(async () => {
      controller!.push('Detail');
    });
    await act(async () => {
      controller!.push('Settings');
    });
    expect(controller!.depth).toBe(3);

    await act(async () => {
      controller!.popToRoot();
    });
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(controller!.depth).toBe(1);
    expect(controller!.activeEntry?.routeName).toBe('Home');
  });

  it('replace swaps the active entry', async () => {
    let controller: ReturnType<typeof useNavigationStack> | null = null;

    render(
      <NavigationStackProvider
        id="test"
        routes={simpleRegistry}
        initialRoute={{ name: 'Home' }}
      >
        <NavigationStackViewport renderScene={() => <div />} />
        <ControllerCapture
          onReady={(c) => {
            controller = c;
          }}
        />
      </NavigationStackProvider>,
    );

    await act(async () => {
      controller!.replace('Detail');
    });
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(controller!.depth).toBe(1);
    expect(controller!.activeEntry?.routeName).toBe('Detail');
  });

  it('reset replaces the entire stack', async () => {
    let controller: ReturnType<typeof useNavigationStack> | null = null;

    render(
      <NavigationStackProvider
        id="test"
        routes={simpleRegistry}
        initialRoute={{ name: 'Home' }}
      >
        <NavigationStackViewport renderScene={() => <div />} />
        <ControllerCapture
          onReady={(c) => {
            controller = c;
          }}
        />
      </NavigationStackProvider>,
    );

    await act(async () => {
      controller!.reset([{ name: 'Detail' }, { name: 'Settings' }]);
    });
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(controller!.depth).toBe(2);
    expect(controller!.activeEntry?.routeName).toBe('Settings');
  });

  it('setParams merges params into the active entry', async () => {
    let controller: ReturnType<typeof useNavigationStack> | null = null;

    render(
      <NavigationStackProvider
        id="test"
        routes={simpleRegistry}
        initialRoute={{ name: 'Home' }}
      >
        <NavigationStackViewport renderScene={() => <div />} />
        <ControllerCapture
          onReady={(c) => {
            controller = c;
          }}
        />
      </NavigationStackProvider>,
    );

    await act(async () => {
      controller!.setParams({ greeting: 'hello' });
    });

    expect(
      (controller!.activeEntry?.params as Record<string, unknown>)?.greeting,
    ).toBe('hello');
  });

  it('getEntry returns the active entry by routeName matcher', async () => {
    let controller: ReturnType<typeof useNavigationStack> | null = null;

    render(
      <NavigationStackProvider
        id="test"
        routes={simpleRegistry}
        initialRoute={{ name: 'Home' }}
      >
        <NavigationStackViewport renderScene={() => <div />} />
        <ControllerCapture
          onReady={(c) => {
            controller = c;
          }}
        />
      </NavigationStackProvider>,
    );

    const entry = controller!.getEntry({ type: 'routeName', value: 'Home' });
    expect(entry?.routeName).toBe('Home');
    expect(
      controller!.getEntry({ type: 'routeName', value: 'Detail' }),
    ).toBeNull();
  });

  it('calls onTransitionStart and onTransitionEnd during a push', async () => {
    const onTransitionStart = vi.fn();
    const onTransitionEnd = vi.fn();
    let controller: ReturnType<typeof useNavigationStack> | null = null;

    render(
      <NavigationStackProvider
        id="test"
        routes={simpleRegistry}
        initialRoute={{ name: 'Home' }}
        onTransitionStart={onTransitionStart}
        onTransitionEnd={onTransitionEnd}
      >
        <NavigationStackViewport renderScene={() => <div />} />
        <ControllerCapture
          onReady={(c) => {
            controller = c;
          }}
        />
      </NavigationStackProvider>,
    );

    await act(async () => {
      controller!.push('Detail');
    });
    expect(onTransitionStart).toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    expect(onTransitionEnd).toHaveBeenCalled();
  });
});

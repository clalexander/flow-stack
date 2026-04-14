import { render, screen, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { NavigationStackProvider } from '../../src/components/NavigationStackProvider';
import { NavigationStackViewport } from '../../src/components/NavigationStackViewport';
import { useNavigationStack } from '../../src/hooks/useNavigationStack';
import { simpleRegistry } from '../fixtures/routes';

function TwoStackSetup(): ReactNode {
  return (
    <>
      <NavigationStackProvider
        id="stack-a"
        routes={simpleRegistry}
        initialRoute={{ name: 'Home' }}
      >
        <NavigationStackViewport
          renderScene={({ entry }) => (
            <div data-testid={`a-scene-${entry.routeName}`} />
          )}
        />
        <StackActions stackId="stack-a" pushRoute="Detail" testId="push-a" />
      </NavigationStackProvider>

      <NavigationStackProvider
        id="stack-b"
        routes={simpleRegistry}
        initialRoute={{ name: 'Settings' }}
      >
        <NavigationStackViewport
          renderScene={({ entry }) => (
            <div data-testid={`b-scene-${entry.routeName}`} />
          )}
        />
        <StackActions stackId="stack-b" pushRoute="Detail" testId="push-b" />
      </NavigationStackProvider>
    </>
  );
}

function StackActions({
  pushRoute,
  testId,
}: {
  stackId: string;
  pushRoute: string;
  testId: string;
}): ReactNode {
  const controller = useNavigationStack();
  return (
    <button data-testid={testId} onClick={() => controller.push(pushRoute)} />
  );
}

describe('multi-stack isolation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('each stack renders its own initial scene', () => {
    render(<TwoStackSetup />);
    expect(screen.getByTestId('a-scene-Home')).toBeTruthy();
    expect(screen.getByTestId('b-scene-Settings')).toBeTruthy();
  });

  it('pushing on stack-a does not affect stack-b', async () => {
    render(<TwoStackSetup />);

    await act(async () => {
      screen.getByTestId('push-a').click();
    });

    // stack-a should now show Detail; stack-b should still show only Settings
    expect(screen.getByTestId('a-scene-Detail')).toBeTruthy();
    expect(() => screen.getByTestId('b-scene-Detail')).toThrow();
  });

  it('viewport for stack-a does not render stack-b entries', async () => {
    render(<TwoStackSetup />);

    await act(async () => {
      screen.getByTestId('push-b').click();
    });

    // stack-b got Detail; stack-a should not
    expect(screen.getByTestId('b-scene-Detail')).toBeTruthy();
    expect(() => screen.getByTestId('a-scene-Detail')).toThrow();
  });
});

import { describe, it, expect } from 'vitest';

import { createTransitionRuntimeState } from '../../../src/transitions/createTransitionRuntimeState';
import { makeEntry } from '../../fixtures/entries';
import { slideTransitionSpec } from '../../fixtures/transitions';

const baseOptions = {
  action: { type: 'push' as const, route: 'Detail' },
  direction: 'forward' as const,
  anchor: 'left' as const,
  orientation: 'horizontal' as const,
  fromEntry: makeEntry({ routeName: 'Home' }),
  toEntry: makeEntry({ routeName: 'Detail' }),
  spec: slideTransitionSpec,
};

describe('createTransitionRuntimeState', () => {
  it('returns an id string', () => {
    const state = createTransitionRuntimeState(baseOptions);
    expect(typeof state.id).toBe('string');
    expect(state.id.length).toBeGreaterThan(0);
  });

  it('phase is "enter"', () => {
    const state = createTransitionRuntimeState(baseOptions);
    expect(state.phase).toBe('enter');
  });

  it('progress is 0', () => {
    const state = createTransitionRuntimeState(baseOptions);
    expect(state.progress).toBe(0);
  });

  it('copies direction, anchor, orientation from options', () => {
    const state = createTransitionRuntimeState(baseOptions);
    expect(state.direction).toBe('forward');
    expect(state.anchor).toBe('left');
    expect(state.orientation).toBe('horizontal');
  });

  it('copies fromEntry and toEntry', () => {
    const state = createTransitionRuntimeState(baseOptions);
    expect(state.fromEntry).toBe(baseOptions.fromEntry);
    expect(state.toEntry).toBe(baseOptions.toEntry);
  });

  it('stores the transition spec', () => {
    const state = createTransitionRuntimeState(baseOptions);
    expect(state.spec).toBe(slideTransitionSpec);
  });

  it('startedAt is a recent timestamp', () => {
    const before = Date.now();
    const state = createTransitionRuntimeState(baseOptions);
    expect(state.startedAt).toBeGreaterThanOrEqual(before);
    expect(state.startedAt).toBeLessThanOrEqual(Date.now());
  });

  it('sets actionType from the action', () => {
    const state = createTransitionRuntimeState(baseOptions);
    expect(state.actionType).toBe('push');
  });

  it('generates unique ids on repeated calls', () => {
    const a = createTransitionRuntimeState(baseOptions);
    const b = createTransitionRuntimeState(baseOptions);
    expect(a.id).not.toBe(b.id);
  });
});

import type { NavigationTransitionSpec } from '../../src/core/public';

export const slideTransitionSpec: NavigationTransitionSpec = {
  preset: 'slide-inline',
  duration: 250,
  translate: { axis: 'x', from: '100%', to: '0%' },
  reverseOnBack: true,
  clip: true,
};

export const noTransitionSpec: NavigationTransitionSpec = {
  preset: 'none',
  duration: 0,
};

export const fadeTransitionSpec: NavigationTransitionSpec = {
  preset: 'fade',
  duration: 180,
  opacity: { from: 0, to: 1 },
};

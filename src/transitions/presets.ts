import type {
  NavigationTransitionPresetName,
  NavigationTransitionSpec,
} from '../core/public';

export const navigationTransitionPresets: Readonly<
  Record<NavigationTransitionPresetName, NavigationTransitionSpec>
> = {
  'slide-inline': {
    preset: 'slide-inline',
    duration: 250,
    translate: { axis: 'x', from: '100%', to: '0%' },
    reverseOnBack: true,
    clip: true,
    opacity: undefined,
    scale: undefined,
  },
  'slide-opposite': {
    preset: 'slide-opposite',
    duration: 250,
    translate: { axis: 'x', from: '-100%', to: '0%' },
    reverseOnBack: true,
    clip: true,
    opacity: undefined,
    scale: undefined,
  },
  'slide-up': {
    preset: 'slide-up',
    duration: 250,
    translate: { axis: 'y', from: '100%', to: '0%' },
    reverseOnBack: true,
    clip: true,
    opacity: undefined,
    scale: undefined,
  },
  'slide-down': {
    preset: 'slide-down',
    duration: 250,
    translate: { axis: 'y', from: '-100%', to: '0%' },
    reverseOnBack: true,
    clip: true,
    opacity: undefined,
    scale: undefined,
  },
  fade: {
    preset: 'fade',
    duration: 180,
    opacity: { from: 0, to: 1 },
    translate: undefined,
    scale: undefined,
    reverseOnBack: undefined,
    clip: undefined,
  },
  'fade-scale': {
    preset: 'fade-scale',
    duration: 180,
    opacity: { from: 0, to: 1 },
    scale: { from: 0.98, to: 1 },
    translate: undefined,
    reverseOnBack: undefined,
    clip: undefined,
  },
  none: {
    preset: 'none',
    duration: 0,
    translate: undefined,
    opacity: undefined,
    scale: undefined,
    reverseOnBack: undefined,
    clip: undefined,
  },
};

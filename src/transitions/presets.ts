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
  },
  'slide-opposite': {
    preset: 'slide-opposite',
    duration: 250,
    translate: { axis: 'x', from: '-100%', to: '0%' },
    reverseOnBack: true,
    clip: true,
  },
  'slide-up': {
    preset: 'slide-up',
    duration: 250,
    translate: { axis: 'y', from: '100%', to: '0%' },
    reverseOnBack: true,
    clip: true,
  },
  'slide-down': {
    preset: 'slide-down',
    duration: 250,
    translate: { axis: 'y', from: '-100%', to: '0%' },
    reverseOnBack: true,
    clip: true,
  },
  fade: {
    preset: 'fade',
    duration: 180,
    opacity: { from: 0, to: 1 },
  },
  'fade-scale': {
    preset: 'fade-scale',
    duration: 180,
    opacity: { from: 0, to: 1 },
    scale: { from: 0.98, to: 1 },
  },
  crossfade: {
    preset: 'crossfade',
    duration: 180,
    opacity: { from: 0, to: 1 },
  },
  none: {
    preset: 'none',
    duration: 0,
  },
};

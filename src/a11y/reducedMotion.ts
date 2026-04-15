import type {
  NavigationReducedMotionPreference,
  NavigationTransitionSpec,
} from '../core/public';
import { navigationTransitionPresets } from '../transitions/presets';

export function resolveReducedMotionPreference(
  preference: NavigationReducedMotionPreference,
): boolean {
  if (preference === 'always') {
    return true;
  }

  if (preference === 'never') {
    return false;
  }

  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function applyReducedMotionToTransition(
  spec: NavigationTransitionSpec,
  preference: NavigationReducedMotionPreference,
): NavigationTransitionSpec {
  const shouldReduce = resolveReducedMotionPreference(preference);
  if (!shouldReduce) {
    return spec;
  }

  if (!spec.reducedMotionPreset) {
    return { ...spec, duration: 0 };
  }

  if (typeof spec.reducedMotionPreset === 'string') {
    return navigationTransitionPresets[spec.reducedMotionPreset];
  }

  return spec.reducedMotionPreset;
}

import type {
  NavigationAnchor,
  NavigationAnchorAnimationPolicy,
  NavigationDirection,
  NavigationOrientation,
} from '../core/public';

export interface ResolvedAnchorAnimation {
  direction: NavigationDirection;
  orientation: NavigationOrientation;
}

export function resolveAnchorAnimation(
  anchor: NavigationAnchor,
  policy: NavigationAnchorAnimationPolicy = 'follow-anchor',
): ResolvedAnchorAnimation {
  if (policy === 'fade-only') {
    return { direction: 'neutral', orientation: 'auto' };
  }

  if (policy === 'fixed-forward') {
    return { direction: 'forward', orientation: 'horizontal' };
  }

  if (policy === 'fixed-backward') {
    return { direction: 'backward', orientation: 'horizontal' };
  }

  if (anchor === 'top' || anchor === 'bottom') {
    return {
      direction: policy === 'invert-anchor' ? 'backward' : 'forward',
      orientation: 'vertical',
    };
  }

  if (anchor === 'center' || anchor === 'auto') {
    return {
      direction: policy === 'invert-anchor' ? 'backward' : 'forward',
      orientation: 'horizontal',
    };
  }

  return {
    direction: policy === 'invert-anchor' ? 'backward' : 'forward',
    orientation: 'horizontal',
  };
}

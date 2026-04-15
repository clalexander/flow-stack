import type {
  NavigationAction,
  NavigationEntryMatcher,
  NavigationTransitionSpec,
} from '../core/public';

export function isNavigationEntryMatcher(
  value: unknown,
): value is NavigationEntryMatcher {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const matcher = value as Partial<NavigationEntryMatcher>;
  return (
    matcher.type === 'routeName' ||
    matcher.type === 'entryKey' ||
    matcher.type === 'id' ||
    matcher.type === 'predicate'
  );
}

export function isNavigationTransitionSpec(
  value: unknown,
): value is NavigationTransitionSpec {
  return !!value && typeof value === 'object';
}

export function isNavigationAction(value: unknown): value is NavigationAction {
  return !!value && typeof value === 'object' && 'type' in value;
}

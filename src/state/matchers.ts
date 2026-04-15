import type { NavigationEntry, NavigationEntryMatcher } from '../core/public';

export function matchesNavigationEntry(
  matcher: NavigationEntryMatcher,
  entry: NavigationEntry,
  index: number,
  entries: readonly NavigationEntry[],
): boolean {
  switch (matcher.type) {
    case 'routeName':
      return entry.routeName === matcher.value;
    case 'entryKey':
      return entry.key === matcher.value;
    case 'id':
      return entry.id === matcher.value;
    case 'predicate':
      return matcher.value(entry, index, entries);
    default:
      return false;
  }
}

export function findNavigationEntry(
  entries: readonly NavigationEntry[],
  matcher: NavigationEntryMatcher,
): NavigationEntry | null {
  return (
    entries.find((entry, index) =>
      matchesNavigationEntry(matcher, entry, index, entries),
    ) ?? null
  );
}

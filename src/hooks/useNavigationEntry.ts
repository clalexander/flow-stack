import type {
  NavigationEntry,
  NavigationEntryKey,
  NavigationParams,
  NavigationRouteName,
  NavigationStackId,
} from '../core/public';

import { useNavigationStack } from './useNavigationStack';

export interface UseNavigationEntryResult<
  TParams extends NavigationParams = NavigationParams,
> {
  entry: NavigationEntry<NavigationRouteName, TParams> | null;
  routeName: NavigationRouteName | null;
  params: TParams | null;
  entryKey: NavigationEntryKey | null;
  index: number;
  isActive: boolean;
  isRoot: boolean;
}

export function useNavigationEntry<
  TParams extends NavigationParams = NavigationParams,
>(stackId?: NavigationStackId): UseNavigationEntryResult<TParams> {
  const navigation = useNavigationStack(stackId);
  const entry = navigation.activeEntry as NavigationEntry<
    NavigationRouteName,
    TParams
  > | null;
  const index = navigation.state.activeIndex;

  return {
    entry,
    routeName: entry?.routeName ?? null,
    params: entry?.params ?? null,
    entryKey: entry?.key ?? null,
    index,
    isActive: entry !== null,
    isRoot: index <= 0,
  };
}

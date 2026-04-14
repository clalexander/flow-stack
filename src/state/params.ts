import type { NavigationParams } from '../core/public';

export function mergeNavigationParams<
  TParams extends NavigationParams = NavigationParams,
>(currentParams: TParams, nextParams: Partial<TParams>): TParams {
  return {
    ...currentParams,
    ...nextParams,
  };
}

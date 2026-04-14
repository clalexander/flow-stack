import type { ReactNode } from 'react';

import type {
  NavigationRouteDefinition,
  NavigationEnterGuard,
} from '../../src/core/public';

function Stub(): ReactNode {
  return null;
}

export const simpleRegistry: NavigationRouteDefinition[] = [
  { name: 'Home', component: Stub },
  { name: 'Detail', component: Stub },
  { name: 'Settings', component: Stub },
];

export const routeWithParams: NavigationRouteDefinition<
  'Profile',
  { userId: number }
> = {
  name: 'Profile',
  component: Stub as NavigationRouteDefinition<
    'Profile',
    { userId: number }
  >['component'],
  defaultParams: { userId: 0 },
  getId: ({ userId }) => `profile-${userId}`,
};

export const guardAllow: NavigationEnterGuard = () => true;
export const guardBlock: NavigationEnterGuard = () => false;
export const guardAllowAsync: NavigationEnterGuard = () =>
  Promise.resolve(true);
export const guardBlockAsync: NavigationEnterGuard = () =>
  Promise.resolve(false);

export const routeWithGuard: NavigationRouteDefinition = {
  name: 'Protected',
  component: Stub,
  canEnter: guardAllow,
};

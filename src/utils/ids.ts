let navigationIdCounter = 0;
let navigationEntryKeyCounter = 0;

export function createNavigationId(): string {
  navigationIdCounter += 1;
  return `nav-${navigationIdCounter}`;
}

export function createNavigationEntryKey(): string {
  navigationEntryKeyCounter += 1;
  return `entry-${navigationEntryKeyCounter}`;
}

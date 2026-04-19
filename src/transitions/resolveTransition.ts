import type {
  NavigationAction,
  NavigationAnchor,
  NavigationOrientation,
  NavigationReducedMotionPreference,
  NavigationTransitionPresetName,
  NavigationTransitionResolver,
  NavigationTransitionSpec,
} from '../core/public';
import type { NavigationEntry, NavigationPresentation } from '../core/public';

import { navigationTransitionPresets } from './presets';

export interface ResolveTransitionOptions {
  action: NavigationAction;
  fromEntry: NavigationEntry | null;
  toEntry: NavigationEntry | null;
  depth: number;
  anchor: NavigationAnchor;
  orientation: NavigationOrientation;
  presentation: NavigationPresentation;
  reducedMotion: NavigationReducedMotionPreference;
  stackTransition?:
    | NavigationTransitionPresetName
    | NavigationTransitionSpec
    | NavigationTransitionResolver;
  routeTransition?:
    | NavigationTransitionPresetName
    | NavigationTransitionSpec
    | NavigationTransitionResolver;
  stackId?: string;
  lastAction?: NavigationAction | null;
}

/**
 * Timing fields on NavigationTransitionSpec.
 *
 * These control *when* and *how fast* the animation runs, but not *what* it shows.
 * They are treated separately from style fields (preset, translate, opacity, scale,
 * clip, reverseOnBack) in the priority merge so that explicit timing set at a
 * lower-priority level survives when a higher-priority level supplies only a string
 * preset (which would otherwise implicitly clobber the explicit timing).
 */
const TIMING_KEYS = [
  'duration',
  'easing',
  'enterCurve',
  'exitCurve',
  'stagger',
] as const;
type TimingKey = (typeof TIMING_KEYS)[number];

interface MaterializedTransition {
  spec: NavigationTransitionSpec;
  /**
   * The subset of TIMING_KEYS that were **explicitly** written by the consumer.
   * Always empty when the source was a string preset — implicit preset timing must
   * not override explicit timing set at a lower-priority level.
   */
  explicitTimingKeys: ReadonlySet<TimingKey>;
}

/**
 * When an object spec carries a `preset` field, merge the named preset's fields
 * underneath it so that style fields (translate, clip, etc.) are populated even
 * when the consumer only wrote `{ preset: 'slide-up', duration: 500 }`.
 * The consumer's own fields always win via the trailing spread.
 */
function expandPresetObject(
  spec: NavigationTransitionSpec,
): NavigationTransitionSpec {
  if (!spec.preset || spec.preset === 'none') {
    return spec;
  }
  return { ...navigationTransitionPresets[spec.preset], ...spec };
}

function materializeTransition(
  value:
    | ResolveTransitionOptions['routeTransition']
    | NavigationTransitionSpec
    | undefined,
  options: ResolveTransitionOptions,
): MaterializedTransition | undefined {
  let result = value;

  if (typeof result === 'function') {
    result = result({
      stackId: options.stackId ?? 'default',
      actionType: options.action.type,
      direction: options.action.options?.direction ?? 'auto',
      fromEntry: options.fromEntry,
      toEntry: options.toEntry,
      depth: options.depth,
      anchor: options.anchor,
      orientation: options.orientation,
      presentation: options.presentation,
      reducedMotion: options.reducedMotion,
      lastAction: options.lastAction ?? null,
    });
  }

  if (typeof result === 'string') {
    // String presets contribute their animation *style* only.
    // Their timing fields are implicit defaults — they must not clobber explicit
    // timing that was set at a lower-priority level.
    return {
      spec: navigationTransitionPresets[result],
      explicitTimingKeys: new Set(),
    };
  }

  if (!result) {
    return undefined;
  }

  // Plain object: all timing fields present on the object are explicit.
  return {
    spec: expandPresetObject(result),
    explicitTimingKeys: new Set(
      TIMING_KEYS.filter((k) => k in result && result[k] !== undefined),
    ),
  };
}

export function resolveTransition(
  options: ResolveTransitionOptions,
): NavigationTransitionSpec {
  const actionMaterialized = materializeTransition(
    options.action.options?.transition,
    options,
  );
  const routeMaterialized = materializeTransition(
    options.routeTransition,
    options,
  );
  const stackMaterialized = materializeTransition(
    options.stackTransition,
    options,
  );

  const fallback: NavigationTransitionSpec =
    navigationTransitionPresets[
      options.presentation === 'overlay'
        ? 'fade'
        : options.orientation === 'vertical'
          ? 'slide-up'
          : 'slide-inline'
    ];

  // ── Style merge ──────────────────────────────────────────────────────────────
  // All levels participate, including string presets. Higher-priority levels win.
  // The fallback is the base; the action transition is the highest priority.
  const styleMerged: NavigationTransitionSpec = {
    ...fallback,
    ...stackMaterialized?.spec,
    ...routeMaterialized?.spec,
    ...actionMaterialized?.spec,
  };

  // ── Timing override ──────────────────────────────────────────────────────────
  // Only timing fields that were *explicitly* written in an object spec (or returned
  // by a resolver function) participate here.  Levels are applied from lowest to
  // highest priority so that higher-priority explicit timing always wins.
  //
  // This means `duration: 4000` set at the stack level survives a route-level
  // `"slide-up"` string, because the string carries no explicit timing.
  const explicitTiming: Partial<NavigationTransitionSpec> = {};
  for (const level of [
    stackMaterialized,
    routeMaterialized,
    actionMaterialized,
  ]) {
    if (!level) continue;
    for (const key of level.explicitTimingKeys) {
      Object.assign(explicitTiming, { [key]: level.spec[key] });
    }
  }

  return { ...styleMerged, ...explicitTiming };
}

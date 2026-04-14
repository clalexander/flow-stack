import type {
  NavigationDirection,
  NavigationTransitionCurveToken,
  NavigationTransitionSpec,
} from '../core/public';

import { navigationTransitionPresets } from './presets';

export interface AnimationKeyframeResult {
  /** Deterministic CSS identifier for the @keyframes block. */
  name: string;
  /** The full @keyframes CSS text to inject into a <style> element. */
  css: string;
  /** Animation delay in milliseconds (derived from spec.stagger × sceneIndex). */
  delay: number;
}

function negateValue(value: number | string): number | string {
  if (typeof value === 'number') {
    return value === 0 ? 0 : -value;
  }
  const str = value.trim();
  if (str === '0' || str === '0%') {
    return value;
  }
  return str.startsWith('-') ? str.slice(1) : `-${str}`;
}

function slugify(value: number | string | null | undefined): string {
  if (value == null) {
    return '_';
  }
  return String(value)
    .replace(/^-/, 'n')
    .replace(/%/g, 'p')
    .replace(/\./g, 'd')
    .replace(/[^a-zA-Z0-9]/g, '_');
}

/**
 * Generates a CSS `linear()` easing string that approximates a damped harmonic spring.
 *
 * The spring is described by the standard underdamped analytical solution:
 *   x(t) = 1 - exp(-β·t) · [cos(ω_d·t) + (β/ω_d)·sin(ω_d·t)]
 *
 * The real-time axis is normalised so the spring fully settles within the animation
 * duration, regardless of what that duration is. The first and last sample points are
 * clamped to exactly 0 and 1 to prevent a fill-mode snap at either boundary.
 *
 * @param stiffness  Spring stiffness constant (higher → faster, snappier). Default 200.
 * @param damping    Damping coefficient (higher → less overshoot). Default 20.
 * @param mass       Oscillating mass (default 1 — rarely changed).
 * @param steps      Number of linear keyframe stops (default 30 ≈ 8 ms per stop at 250 ms).
 */
function buildSpringLinearEasing(
  stiffness = 200,
  damping = 20,
  mass = 1,
  steps = 30,
): string {
  const ω0 = Math.sqrt(stiffness / mass);
  const ζ = damping / (2 * Math.sqrt(stiffness * mass));

  if (ζ >= 1) {
    // Critically or over-damped — no overshoot; use a smooth ease-out instead.
    return 'ease-out';
  }

  const β = ζ * ω0; // exponential decay rate
  const ωD = ω0 * Math.sqrt(1 - ζ * ζ); // damped oscillation frequency

  // Real time at which the oscillation envelope exp(-β·t)/sqrt(1-ζ²) falls below 0.1 %.
  // This ensures every animation — regardless of its CSS duration — that uses this easing
  // will look fully settled by the time it ends.
  const settleTime = -Math.log(0.001 * Math.sqrt(1 - ζ * ζ)) / β;

  const inner: string[] = [];
  for (let i = 1; i < steps; i++) {
    const tReal = (i / steps) * settleTime;
    const value =
      1 -
      Math.exp(-β * tReal) *
        (Math.cos(ωD * tReal) + (β / ωD) * Math.sin(ωD * tReal));
    inner.push(value.toFixed(4));
  }

  // Always start at 0 and end at 1 — prevents any fill-mode snap at the boundaries.
  return `linear(0, ${inner.join(', ')}, 1)`;
}

// Pre-computed at module load; the 'spring' token always produces the same curve.
const SPRING_EASING_CSS = buildSpringLinearEasing();

/**
 * Resolves a transition curve token to a valid CSS easing function string.
 *
 * - Named CSS keywords (`'linear'`, `'ease'`, `'ease-in'`, etc.) are returned as-is.
 * - `'spring'` produces a CSS `linear()` easing derived from a damped spring simulation
 *   (~30 sample points). This avoids the snap artefact of a single cubic-bezier.
 * - Arbitrary strings (e.g. `'cubic-bezier(…)'`) are passed through untouched.
 * - Function-based easings (`(progress) => number`) cannot be expressed in CSS
 *   and fall back to `'ease'`.
 */
export function resolveEasingCSS(
  curve:
    | NavigationTransitionCurveToken
    | ((progress: number) => number)
    | undefined,
): string {
  if (!curve || typeof curve === 'function') {
    return 'ease';
  }
  if (curve === 'spring') {
    return SPRING_EASING_CSS;
  }
  return curve;
}

/**
 * Builds a deterministic CSS `@keyframes` block for a single scene's enter or exit animation.
 *
 * Animation values are derived from `spec.translate`, `spec.opacity`, and `spec.scale`.
 * When `spec.reverseOnBack` is `true` and `direction` is `'backward'`, the translate
 * direction is inverted so the previous screen re-enters from the correct side.
 *
 * The keyframe name is derived from the effective from/to values, making it deterministic
 * across renders — the same animation configuration always produces the same name so that
 * `@keyframes` CSS blocks can be deduplicated and safely injected once per transition.
 *
 * Returns `null` when no animation is needed (preset `'none'` or no animation fields defined).
 */
export function buildAnimationKeyframes(
  rawSpec: NavigationTransitionSpec,
  phase: 'enter' | 'exit',
  direction: NavigationDirection,
  sceneIndex: number,
): AnimationKeyframeResult | null {
  // Merge preset base values so e.g. { preset: 'slide-inline', duration: 500 } gets the
  // translate/opacity/scale fields from the preset when they are not explicitly overridden.
  const presetBase =
    rawSpec.preset && rawSpec.preset !== 'none'
      ? navigationTransitionPresets[rawSpec.preset]
      : undefined;
  const spec: NavigationTransitionSpec = presetBase
    ? { ...presetBase, ...rawSpec }
    : rawSpec;

  if (spec.preset === 'none') {
    return null;
  }

  const hasTranslate = !!spec.translate;
  const hasOpacity = !!spec.opacity;
  const hasScale = !!spec.scale;

  if (!hasTranslate && !hasOpacity && !hasScale) {
    return null;
  }

  // When reverseOnBack is true and we are navigating backward, the direction of the
  // translate animation is inverted so the exiting screen flies out in the original
  // entry direction and the entering (previous) screen comes back from the opposite side.
  const isReversed = !!spec.reverseOnBack && direction === 'backward';

  // Stagger delay: each scene in the transition is offset by sceneIndex × stagger ms.
  const delay = spec.stagger != null ? sceneIndex * spec.stagger : 0;

  const axis = spec.translate?.axis ?? 'x';

  // ── Compute effective from/to values per phase ─────────────────────────────────────

  let translateFrom: number | string | undefined;
  let translateTo: number | string | undefined;
  let opacityFrom: number | undefined;
  let opacityTo: number | undefined;
  let scaleFrom: number | undefined;
  let scaleTo: number | undefined;

  if (hasTranslate) {
    const rawFrom = spec.translate?.from ?? '100%';
    const rawTo = spec.translate?.to ?? '0%';

    if (phase === 'enter') {
      // Forward: enter from spec.from direction.
      // Reversed (backward): enter from the opposite side.
      translateFrom = isReversed ? negateValue(rawFrom) : rawFrom;
      translateTo = rawTo;
    } else {
      // Exit always leaves from the resting position (to) toward the direction that
      // mirrors where the entering scene came from.
      translateFrom = rawTo;
      translateTo = isReversed ? rawFrom : negateValue(rawFrom);
    }
  }

  if (hasOpacity) {
    const rawFrom = spec.opacity?.from ?? 0;
    const rawTo = spec.opacity?.to ?? 1;

    // Entering: fades in (from → to). Exiting: fades out (to → from).
    if (phase === 'enter') {
      opacityFrom = rawFrom;
      opacityTo = rawTo;
    } else {
      opacityFrom = rawTo;
      opacityTo = rawFrom;
    }
  }

  if (hasScale) {
    const rawFrom = spec.scale?.from ?? 1;
    const rawTo = spec.scale?.to ?? 1;

    // Entering: scales up (from → to). Exiting: scales down (to → from).
    if (phase === 'enter') {
      scaleFrom = rawFrom;
      scaleTo = rawTo;
    } else {
      scaleFrom = rawTo;
      scaleTo = rawFrom;
    }
  }

  // ── Build CSS transform strings ─────────────────────────────────────────────────────

  const buildTransform = (tVal?: number | string, sVal?: number): string => {
    const parts: string[] = [];
    if (tVal !== undefined) {
      parts.push(axis === 'y' ? `translateY(${tVal})` : `translateX(${tVal})`);
    }
    if (sVal !== undefined) {
      parts.push(`scale(${sVal})`);
    }
    return parts.length > 0 ? parts.join(' ') : 'none';
  };

  const fromTransform = buildTransform(translateFrom, scaleFrom);
  const toTransform = buildTransform(translateTo, scaleTo);

  // ── Generate deterministic CSS keyframe name ───────────────────────────────────────

  const nameParts = ['fs', 'kf', phase, isReversed ? 'r' : 'f'];
  if (hasTranslate) {
    nameParts.push(axis, slugify(translateFrom), slugify(translateTo));
  }
  if (hasOpacity) {
    nameParts.push('o', slugify(opacityFrom), slugify(opacityTo));
  }
  if (hasScale) {
    nameParts.push('s', slugify(scaleFrom), slugify(scaleTo));
  }
  const name = nameParts.join('-');

  // ── Assemble @keyframes CSS ─────────────────────────────────────────────────────────

  const fromProps: string[] = [];
  const toProps: string[] = [];

  if (hasTranslate || hasScale) {
    fromProps.push(`transform: ${fromTransform}`);
    toProps.push(`transform: ${toTransform}`);
  }
  if (hasOpacity) {
    fromProps.push(`opacity: ${opacityFrom}`);
    toProps.push(`opacity: ${opacityTo}`);
  }

  const css = [
    `@keyframes ${name} {`,
    `  from { ${fromProps.join('; ')}; }`,
    `  to { ${toProps.join('; ')}; }`,
    `}`,
  ].join('\n');

  return { name, css, delay };
}

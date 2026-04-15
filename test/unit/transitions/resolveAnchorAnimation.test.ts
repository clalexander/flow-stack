import { describe, it, expect } from 'vitest';

import { resolveAnchorAnimation } from '../../../src/transitions/resolveAnchorAnimation';

describe('resolveAnchorAnimation', () => {
  describe('fade-only policy', () => {
    it('always returns neutral direction and auto orientation', () => {
      for (const anchor of [
        'left',
        'right',
        'top',
        'bottom',
        'center',
        'auto',
      ] as const) {
        const result = resolveAnchorAnimation(anchor, 'fade-only');
        expect(result).toEqual({ direction: 'neutral', orientation: 'auto' });
      }
    });
  });

  describe('fixed-forward policy', () => {
    it('always returns forward direction and horizontal orientation', () => {
      const result = resolveAnchorAnimation('top', 'fixed-forward');
      expect(result).toEqual({
        direction: 'forward',
        orientation: 'horizontal',
      });
    });
  });

  describe('fixed-backward policy', () => {
    it('always returns backward direction and horizontal orientation', () => {
      const result = resolveAnchorAnimation('bottom', 'fixed-backward');
      expect(result).toEqual({
        direction: 'backward',
        orientation: 'horizontal',
      });
    });
  });

  describe('follow-anchor policy (default)', () => {
    it('left anchor → forward, horizontal', () => {
      expect(resolveAnchorAnimation('left')).toEqual({
        direction: 'forward',
        orientation: 'horizontal',
      });
    });

    it('right anchor → forward, horizontal', () => {
      expect(resolveAnchorAnimation('right')).toEqual({
        direction: 'forward',
        orientation: 'horizontal',
      });
    });

    it('top anchor → forward, vertical', () => {
      expect(resolveAnchorAnimation('top')).toEqual({
        direction: 'forward',
        orientation: 'vertical',
      });
    });

    it('bottom anchor → forward, vertical', () => {
      expect(resolveAnchorAnimation('bottom')).toEqual({
        direction: 'forward',
        orientation: 'vertical',
      });
    });

    it('center anchor → forward, horizontal', () => {
      expect(resolveAnchorAnimation('center')).toEqual({
        direction: 'forward',
        orientation: 'horizontal',
      });
    });

    it('auto anchor → forward, horizontal', () => {
      expect(resolveAnchorAnimation('auto')).toEqual({
        direction: 'forward',
        orientation: 'horizontal',
      });
    });
  });

  describe('invert-anchor policy', () => {
    it('top anchor → backward, vertical', () => {
      expect(resolveAnchorAnimation('top', 'invert-anchor')).toEqual({
        direction: 'backward',
        orientation: 'vertical',
      });
    });

    it('left anchor → backward, horizontal', () => {
      expect(resolveAnchorAnimation('left', 'invert-anchor')).toEqual({
        direction: 'backward',
        orientation: 'horizontal',
      });
    });

    it('center anchor → backward, horizontal', () => {
      expect(resolveAnchorAnimation('center', 'invert-anchor')).toEqual({
        direction: 'backward',
        orientation: 'horizontal',
      });
    });
  });
});

import { Pt } from './types';
var math = require('basic-2d-math');

export function quantizePt(unit: number, pt: Pt): Pt {
  return [quantize(unit, pt[0]), quantize(unit, pt[1])];
}

export function quantize(unit: number, value: number): number {
  if (isNaN(unit) || isNaN(unit)) {
    throw new Error(
      `Non-numbers passed to quantize. Unit: ${unit}, value: ${value}`
    );
  }

  return Math.round(value / unit) * unit;
}

export function dist(a: Pt, b: Pt) {
  return math.getVectorMagnitude(math.subtractPairs(b, a));
}

export function uniquifyPts(pts: Array<Pt>) {
  pts.sort(comparePt);
  var uniquePts: Array<Pt> = [pts[0]];
  var lastPtAdded = pts[0];
  for (var i = 1; i < pts.length; ++i) {
    let pt = pts[i];
    if (pt[0] === lastPtAdded[0] && pt[1] === lastPtAdded[1]) {
      continue;
    }
    lastPtAdded = pt;
    uniquePts.push(pt);
  }
  return uniquePts;
}

export function comparePt(a: Pt, b: Pt) {
  if (a[0] === b[0] && a[1] === b[1]) {
    return 0;
  }
  if (math.getVectorMagnitude(a) < math.getVectorMagnitude(b)) {
    return -1;
  }
  return 1;
}

export function scalePt(scale: number, pt: Pt): Pt {
  return [scale * pt[0], scale * pt[1]];
}

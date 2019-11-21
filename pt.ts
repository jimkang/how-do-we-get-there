import { Pt } from './types';
var math = require('basic-2d-math');

function quantizePt(unit, pt: Pt): Pt {
  return [quantize(unit, pt[0]), quantize(unit, pt[1])];
}

function quantize(unit, value) {
  return Math.round(value / unit) * unit;
}

function dist(a: Pt, b: Pt) {
  return math.getVectorMagnitude(math.subtractPairs(b, a));
}

function uniquifyPts(pts: Array<Pt>) {
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

function comparePt(a: Pt, b: Pt) {
  if (a[0] === b[0] && a[1] === b[1]) {
    return 0;
  }
  if (math.getVectorMagnitude(a) < math.getVectorMagnitude(b)) {
    return -1;
  }
  return 1;
}

function scalePt(scale: number, pt: Pt): Pt {
  return [scale * pt[0], scale * pt[1]];
}

module.exports = { quantizePt, dist, uniquifyPts, comparePt, scalePt };

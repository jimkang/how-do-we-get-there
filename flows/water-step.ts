var { range } = require('d3-array');
var renderPoints = require('../dom/render-points');
var math = require('basic-2d-math');
var ForkBone = require('fork-bone');
var curry = require('lodash.curry');
var flatten = require('lodash.flatten');

import { Pt } from '../types';

function waterStep({
  page,
  probable,
  showDevLayers,
  gridUnitSize,
  random,
  illusWidth,
  illusHeight
}) {
  const widthUnits = illusWidth / gridUnitSize;
  const heightUnits = illusHeight / gridUnitSize;
  // Do everything in these units, then scale back up at the end.

  var { roll, rollDie, pick, sample } = probable;
  var forkBone = ForkBone({
    random,
    numberOfDecimalsToConsider: 3
  });

  const numberOfWaterOrigins = rollDie(8);
  var waterOriginsInUnits: Array<Pt> = range(numberOfWaterOrigins).map(
    getRandomPoint
  );
  var waterPointsInUnits: Array<Pt> = [];

  if (waterOriginsInUnits.length > 1) {
    const originConnections =
      numberOfWaterOrigins * 0.3 + roll(numberOfWaterOrigins * 0.5);
    for (var i = 0; i < originConnections; ++i) {
      waterPointsInUnits = waterPointsInUnits.concat(
        connectPair(sample(waterOriginsInUnits, 2))
      );
    }
  }

  const numberOfPools = rollDie(numberOfWaterOrigins);
  waterPointsInUnits = waterPointsInUnits.concat(
    flatten(sample(waterOriginsInUnits, numberOfPools).map(poolAroundOrigin))
  );
  var waterPoints: Array<Pt> = uniquifyPts(waterPointsInUnits).map(scalePtUp);
  var waterOrigins: Array<Pt> = waterOriginsInUnits.map(scalePtUp);

  page.waterBodies = { waterOrigins, waterPoints };

  if (showDevLayers) {
    renderPoints({
      points: waterOrigins,
      className: 'water-origin',
      rootSelector: '#water-origins',
      r: 2,
      colorAccessor: 'hsl(240, 50%, 60%)'
    });
    renderPoints({
      points: waterPoints,
      className: 'water-point',
      rootSelector: '#water-points',
      r: 1,
      colorAccessor: 'hsl(240, 50%, 60%)'
    });
  }

  function connectPair([start, dest]: [Pt, Pt]): Array<Pt> {
    var pathPoints: Array<Pt> = [start];
    for (
      let lastPt = pathPoints[0];
      dist(lastPt, dest) > 2;
      lastPt = pathPoints[pathPoints.length - 1]
    ) {
      let vector = math.changeVectorMagnitude(
        math.subtractPairs(dest, lastPt),
        1
      );
      let nextVector = vector;
      if (roll(3) === 0) {
        // Go off to the side a bit.
        let forkPoints = forkBone({
          line: [lastPt, vector],
          lengthRange: [1, 1],
          angleRange: [30, 85]
        });
        nextVector = pick(forkPoints);
      }
      pathPoints.push(
        math.addPairs(lastPt, nextVector).map(curry(quantize)(1))
      );
    }
    return pathPoints;
  }

  function poolAroundOrigin(origin: Pt): Array<Pt> {
    var pool: Array<Pt> = [origin];
    const growthSteps = 2; //probable.rollDie(widthUnits/4);
    var sources: Array<Pt> = [origin];
    for (var i = 0; i < growthSteps; ++i) {
      let growthVectors = [];
      let nextSources = [];
      // Fewer growth vectors on later growth steps.
      for (let j = 0; j < 4 - i; ++j) {
        let growthVector = math.changeVectorMagnitude(
          [(probable.roll(201) - 100) / 100, (probable.roll(201) - 100) / 100],
          Math.sqrt(2)
        );
        let newLocations: Array<Pt> = sources
          .map(curry(math.addPairs)(growthVector))
          .map(curry(quantizePt)(1));
        pool = uniquifyPts(pool.concat(newLocations));
        nextSources = nextSources.concat(newLocations);
      }
      sources = nextSources;
    }

    return pool;
  }

  function scalePtUp(pt: Pt): Pt {
    return [scaleValueUp(pt[0]), scaleValueUp(pt[1])];
  }

  function scaleValueUp(value: number): number {
    return value * gridUnitSize;
  }

  function getRandomPoint(): Pt {
    const x = probable.roll(widthUnits + 1);
    const y = probable.roll(heightUnits + 1);
    return [x, y];
  }
}

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

function getForkVector(guide, angleInDegrees, toTheLeft): Pt {
  var angle = (angleInDegrees * Math.PI) / 180;
  if (!toTheLeft) {
    angle = -angle;
  }
  const cosAngle = Math.cos(angle);
  const sinAngle = Math.sin(angle);
  return [
    guide[0] * cosAngle - guide[1] * sinAngle,
    guide[1] * cosAngle + guide[0] * sinAngle
  ];
}

module.exports = waterStep;

var { range } = require('d3-array');
var renderPoints = require('../dom/render-points');
var math = require('basic-2d-math');
var ForkBone = require('fork-bone');
var curry = require('lodash.curry');
var flatten = require('lodash.flatten');
var { quantizePt, uniquifyPts, comparePt, dist, scalePt } = require('../pt');

import { Pt } from '../types';

function waterStep({
  page,
  probable,
  showDevLayers,
  gridUnitSize,
  random,
  unitsWidth,
  unitsHeight
}) {
  var { roll, rollDie, pick, sample } = probable;
  var forkBone = ForkBone({
    random,
    numberOfDecimalsToConsider: 3
  });

  const numberOfWaterOrigins = rollDie(8);
  var waterOrigins: Array<Pt> = range(numberOfWaterOrigins).map(getRandomPoint);
  var waterPoints: Array<Pt> = [];

  if (waterOrigins.length > 1) {
    const originConnections =
      numberOfWaterOrigins * 0.3 + roll(numberOfWaterOrigins * 0.5);
    for (var i = 0; i < originConnections; ++i) {
      waterPoints = waterPoints.concat(connectPair(sample(waterOrigins, 2)));
    }
  }

  const numberOfPools = rollDie(numberOfWaterOrigins);
  waterPoints = uniquifyPts(
    waterPoints.concat(
      flatten(sample(waterOrigins, numberOfPools).map(poolAroundOrigin))
    )
  );
  var waterPointsScaledUp: Array<Pt> = waterPoints.map(
    curry(scalePt)(gridUnitSize)
  );
  var waterOriginsScaledUp: Array<Pt> = waterOrigins.map(
    curry(scalePt)(gridUnitSize)
  );

  page.waterBodies = { waterOrigins, waterPoints };

  if (showDevLayers) {
    renderPoints({
      points: waterOriginsScaledUp,
      className: 'water-origin',
      rootSelector: '#water-origins',
      r: 2,
      colorAccessor: 'hsl(240, 50%, 60%)'
    });
    renderPoints({
      points: waterPointsScaledUp,
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
      // Moving in increments of 0.5 to avoid
      // situations in which quantization creates
      // big diagonal gaps in rivers.
      let vector = math.changeVectorMagnitude(
        math.subtractPairs(dest, lastPt),
        0.5
      );
      let nextVector = vector;
      if (roll(10) <= 6) {
        // Go off to the side a bit.
        let forkPoints = forkBone({
          line: [lastPt, vector],
          lengthRange: [0.5, 0.5],
          angleRange: [20, 90]
        });
        nextVector = pick(forkPoints);
      }
      pathPoints.push(quantizePt(math.addPairs(lastPt, nextVector), 1));
    }
    return pathPoints;
  }

  function poolAroundOrigin(origin: Pt): Array<Pt> {
    var pool: Array<Pt> = [origin];
    const growthSteps = 2; //probable.rollDie(unitsWidth/4);
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

  function getRandomPoint(): Pt {
    const x = probable.roll(unitsWidth + 1);
    const y = probable.roll(unitsHeight + 1);
    return [x, y];
  }
}

module.exports = waterStep;

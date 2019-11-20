var { range } = require('d3-array');
var renderPoints = require('../dom/render-points');
var math = require('basic-2d-math');
var ForkBone = require('fork-bone');
var curry = require('lodash.curry');

function waterStep({
  page,
  probable,
  getRandomPoint,
  showDevLayers,
  gridUnitSize,
  random
}) {
  var forkBone = ForkBone({
    random,
    numberOfDecimalsToConsider: 3
  });

  const numberOfWaterOrigins = probable.rollDie(8);
  var waterOrigins = range(numberOfWaterOrigins).map(getRandomPoint);
  var waterPoints = [];

  if (waterOrigins.length > 1) {
    const originConnections =
      numberOfWaterOrigins * 0.3 + probable.roll(numberOfWaterOrigins * 0.5);
    for (var i = 0; i < originConnections; ++i) {
      waterPoints = waterPoints.concat(
        connectPair(probable.sample(waterOrigins, 2))
      );
    }
  }

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

  function connectPair([start, dest]) {
    var pathPoints = [[start[0] / gridUnitSize, start[1] / gridUnitSize]];
    var scaledDest = [dest[0] / gridUnitSize, dest[1] / gridUnitSize];
    for (
      let lastPt = pathPoints[0];
      dist(lastPt, scaledDest) > 2;
      lastPt = pathPoints[pathPoints.length - 1]
    ) {
      let vector = math.changeVectorMagnitude(
        math.subtractPairs(scaledDest, lastPt),
        1
      );
      let nextVector = vector;
      if (probable.roll(3) === 0) {
        // Go off to the side a bit.
        let forkPoints = forkBone({
          line: [lastPt, vector],
          lengthRange: [1, 1],
          angleRange: [30, 85]
        });
        nextVector = probable.pick(forkPoints);
      }
      pathPoints.push(
        math.addPairs(lastPt, nextVector).map(curry(quantize)(1))
      );
    }
    return pathPoints.map(scalePtUp);
  }

  function scalePtUp(pt) {
    return pt.map(scaleValueUp);
  }

  function scaleValueUp(value) {
    return value * gridUnitSize;
  }
}

function quantize(unit, value) {
  return Math.round(value / unit) * unit;
}

function dist(a, b) {
  return math.getVectorMagnitude(math.subtractPairs(b, a));
}

module.exports = waterStep;

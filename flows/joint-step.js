var renderPoints = require('../dom/render-points');
var { scalePt } = require('../pt');
var curry = require('lodash.curry');

function jointStep({
  page,
  showDevLayers,
  unitsWidth,
  unitsHeight,
  gridUnitSize,
  probable
}) {
  page.joints = []; //range(jointCount).map(getPoint);
  //var landPoints = range(unitsWidth).map(x => range(unitsHeight).map(y => [x, y]));
  var landPoints = [];
  var wPts = page.waterBodies.waterPoints;

  for (let x = 0; x < unitsWidth; ++x) {
    for (let y = 0; y < unitsHeight; ++y) {
      let pt = [x, y];
      if (!wPts.find(waterPt => waterPt[0] === pt[0] && waterPt[1] === pt[1])) {
        landPoints.push(pt);
      }
    }
  }
  page.joints = probable
    .sample(landPoints, landPoints.length / 4)
    .concat(probable.sample(wPts, wPts.length / 10));

  if (showDevLayers) {
    renderPoints({
      points: page.joints.map(curry(scalePt)(gridUnitSize)),
      className: 'joint',
      rootSelector: '#joints',
      r: 0.5,
      colorAccessor: 'hsl(40, 50%, 50%)'
    });
  }
}

module.exports = jointStep;

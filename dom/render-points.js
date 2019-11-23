var d3 = require('d3-selection');
var accessor = require('accessor');
var { scalePt } = require('../pt');
var curry = require('lodash.curry');

function renderPoints({
  points,
  className,
  rootSelector,
  xProperty = '0',
  yProperty = '1',
  r = 1,
  labelAccessor,
  colorAccessor,
  ptAccessor = accessor('identity'),
  scale
}) {
  var scaleFn;
  if (scale) {
    scaleFn = curry(scalePt)(scale);
  }

  const pointSelector = '.' + className;
  var pointsRoot = d3.select(rootSelector);
  pointsRoot.selectAll(pointSelector).remove();
  var pointStems = pointsRoot
    .selectAll(pointSelector)
    .data(points)
    .enter()
    .append('g')
    .classed(className, true)
    .attr('transform', getTransform);

  var pointCircles = pointStems
    .append('circle')
    .attr('r', r)
    .attr('cx', 0)
    .attr('cy', 0);

  if (labelAccessor) {
    pointStems
      .append('text')
      .attr('dx', -0.5)
      .attr('dy', -1)
      .text(labelAccessor);
  }
  if (colorAccessor) {
    pointCircles.attr('fill', colorAccessor);
  }

  function getTransform(point) {
    var pt = ptAccessor(point);
    if (scaleFn) {
      pt = scaleFn(pt);
    }
    return `translate(${pt[xProperty]}, ${pt[yProperty]})`;
  }
}

module.exports = renderPoints;

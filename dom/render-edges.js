var d3 = require('d3-selection');
var curry = require('lodash.curry');

// TODO: Maybe edges should just be 2D arrays.

function scaleScalar(scale, n) {
  return scale * n;
}

function renderEdges({
  edges,
  className,
  rootSelector,
  colorAccessor,
  scale = 1.0
}) {
  var scaleFn;
  if (scale) {
    scaleFn = curry(scaleScalar)(scale);
  }
  var edgesRoot = d3.select(rootSelector);
  edgesRoot.selectAll('.' + className).remove();
  var edgeLines = edgesRoot
    .selectAll('.' + className)
    .data(edges)
    .enter()
    .append('line')
    .classed(className, true)
    .attr('x1', curry(getScaled)(scaleFn, 'x1'))
    .attr('y1', curry(getScaled)(scaleFn, 'y1'))
    .attr('x2', curry(getScaled)(scaleFn, 'x2'))
    .attr('y2', curry(getScaled)(scaleFn, 'y2'));

  if (colorAccessor) {
    edgeLines.attr('stroke', colorAccessor);
  }
}

function getScaled(scaleFn, prop, d) {
  return scaleFn(d[prop]);
}

module.exports = renderEdges;

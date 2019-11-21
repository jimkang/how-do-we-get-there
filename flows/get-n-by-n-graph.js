var math = require('basic-2d-math');

// Creates edges between every point and every other point in points.
function getNByNGraph({ points }) {
  var graph = [];
  points.map(createEdgesToOtherPoints);
  return graph;

  function createEdgesToOtherPoints(point, i) {
    for (var j = 0; j < points.length; ++j) {
      if (i !== j) {
        graph.push({
          start: i,
          dest: j,
          x1: point[0],
          y1: point[1],
          x2: points[j][0],
          y2: points[j][1],
          dist: math.getVectorMagnitude(math.subtractPairs(point, points[j]))
        });
      }
    }
  }
}

module.exports = getNByNGraph;

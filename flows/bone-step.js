var renderEdges = require('../dom/render-edges');
var curry = require('lodash.curry');
var getNByNGraph = require('./get-n-by-n-graph');
var getMST = require('./get-mst');

function boneStep({
  page,
  showDevLayers,
  gridUnitSize
  //probable
}) {
  var graph = getNByNGraph({ points: page.joints });
  //console.log(graph);
  if (showDevLayers) {
    renderEdges({
      edges: graph.map(curry(scaleGraphEdge)(gridUnitSize)),
      className: 'n-by-n-edge',
      rootSelector: '#n-by-n-graph',
      colorAccessor: 'gray'
    });
  }

  page.bones = getMST({ graph, points: page.joints });

  if (showDevLayers) {
    renderEdges({
      edges: page.bones.map(curry(scaleGraphEdge)(gridUnitSize)),
      className: 'bone',
      rootSelector: '#bones'
    });
  }
}

function scaleGraphEdge(scale, graphEdge) {
  graphEdge.x1 *= scale;
  graphEdge.y1 *= scale;
  graphEdge.x2 *= scale;
  graphEdge.y2 *= scale;
  return graphEdge;
}

module.exports = boneStep;

var jsgraphs = require('js-graph-algorithms');

function getMST({ graph, points }) {
  var g = new jsgraphs.WeightedGraph(points.length);
  graph.forEach(addEdgeToJSGraph);
  var finder = new jsgraphs.EagerPrimMST(g);
  return finder.mst.map(createEdgeObject);

  function addEdgeToJSGraph(edge) {
    g.addEdge(new jsgraphs.Edge(edge.start, edge.dest, edge.dist));
  }

  function createEdgeObject(jsGraphEdge) {
    var start = jsGraphEdge.from();
    var dest = jsGraphEdge.to();
    return {
      start,
      dest,
      x1: points[start][0],
      y1: points[start][1],
      x2: points[dest][0],
      y2: points[dest][1]
    };
  }
}

module.exports = getMST;

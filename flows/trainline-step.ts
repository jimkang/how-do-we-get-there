var curry = require('lodash.curry');
var flatten = require('lodash.flatten');
var renderPoints = require('../dom/render-points');
var accessor = require('accessor');
var { lighten, darken, makeColor } = require('../color');
var math = require('basic-2d-math');
var renderEdges = require('../dom/render-edges');

import { Node, NodeMap, TrainLine, Color } from '../types';

var colors: Array<Color> = [
  makeColor({ name: 'red', h: 4.1, s: 77.2, l: 48.2 }),
  makeColor({ name: 'green', h: 144.7, s: 100, l: 25.9 }),
  makeColor({ name: 'blue', h: 217.8, s: 100, l: 32.4 }),
  makeColor({ name: 'orange', h: 35.2, s: 100, l: 46.5 }),
  makeColor({ name: 'purple', h: 313.5, s: 53.3, l: 32.7 }),
  makeColor({ name: 'brown', h: 20.3, s: 65.4, l: 25 }),
  makeColor({ name: 'yellow', h: 49, s: 100, l: 65 }),
  makeColor({ name: 'pink', h: 336, s: 63.3, l: 69 }),
  makeColor({ name: 'silver', h: 208, s: 6.1, l: 51.6 })
];

// Add darker and lighter versions of base set.
colors = colors.concat(colors.map(lighten)).concat(colors.map(darken));

function trainLineStep({ page, showDevLayers, probable, gridUnitSize }): void {
  var nodeMap: NodeMap = page.nodes;
  var nodes: Node[] = Object.values(nodeMap);
  var trainlineMap: Record<string, TrainLine> = {};

  var endNodes: Node[] = nodes.filter(nodeIsAnEnd);
  var trainLines: Array<TrainLine> = endNodes.map(startTrainLineFromNode);

  do {
    trainLines.forEach(growAStep);
    removeObsoleteLines(trainLines);
  } while (!trainLines.every(line => line.complete));

  /*
  var junctionNodes: Array<Node> = Object.values(nodeMap).filter(
    nodeIsAJunction
  );
  if (junctionNodes.length < 1) {
    junctionNodes.push(Object.values(nodeMap)[0]);
  }

  junctionNodes.forEach(followLinksToFillLimbs);
  */

  if (showDevLayers) {
    renderPoints({
      rootSelector: '#trainline-guide-points',
      points: endNodes,
      scale: gridUnitSize,
      className: 'trainline-guide-end',
      r: 1.0,
      colorAccessor: 'hsl(10, 0%, 90%)',
      ptAccessor: accessor('pt')
    });

    let trainLineEdges = flatten(trainLines.map(getEdgesFromTrainLine));

    renderEdges({
      rootSelector: '#trainline-bones',
      edges: trainLineEdges,
      scale: gridUnitSize,
      className: 'trainline-bone',
      colorAccessor: accessor('colorString')
    });

    /*
    renderEdges({
      edges: flatten(Object.values(trainlineMap)),
      className: 'trainLine-edge',
      rootSelector: '#trainlines-bones',
      colorAccessor: accessor('color')
    });
    */
  }

  page.trainlines = trainlineMap;

  function startTrainLineFromNode(node: Node, i) {
    var color: Color = colors[i % colors.length];
    return {
      id: `${color.name}-line`,
      color,
      nodes: [node],
      complete: false,
      obsolete: false
    };
  }

  function growAStep(trainLine: TrainLine) {
    // TODO: Sometimes fork.
    var currentNode: Node = trainLine.nodes[trainLine.nodes.length - 1];
    var dests: Array<Node> = currentNode.links
      .map(curry(getDestFromLink)(nodeMap))
      .filter(curry(notInTrainline)(trainLine));
    if (dests.length < 1) {
      // TODO: Cross the water sometimes instead of ending.
      trainLine.complete = true;
      return;
    }

    dests.sort(curry(comparePossibleDests)(trainLine));
    let dest = dests[0];
    // TODO: Sometimes pick second-best.
    trainLine.nodes.push(dest);
    dest.trainLineMap[trainLine.id] = trainLine;
  }
  /*
  function followLinksToFillLimbs(junctionNode) {
    // You cannot use curry to init followLinkToFillLimb here for us in map.
    // . e.g.
    // var trainLines = junctionNode.links
    //  .map(curry(followLinkToFillLimb)([ junctionNode ]))
    // It will use the same array ([ junctionNode ]) for every call to
    // followLinkToFillLimb, making it append to arrays that start with
    // a lot of elements in 2nd, 3rd, etc. calls!
    var trainLines = [];
    for (var i = 0; i < junctionNode.links.length; ++i) {
      trainLines.push(
        wrapInLimbObject(
          followLinkToFillLimb([junctionNode], junctionNode.links[i])
        )
      );
    }
    trainLines.forEach(addToPageLimbs);

    function followLinkToFillLimb(trainLineNodes, destNodeId): void {
      var destNode = page.nodes[destNodeId];
      trainLineNodes.push(destNode);

      if (destNode.links.length === 2) {
        let nodeWeCameFromId = trainLineNodes[trainLineNodes.length - 1].id;
        if (trainLineNodes.length > 1) {
          nodeWeCameFromId = trainLineNodes[trainLineNodes.length - 2].id;
        }
        const otherNodeId = otherNodeIdFromLink(destNode, nodeWeCameFromId);
        if (pluck(trainLineNodes, 'id').indexOf(otherNodeId) === -1) {
          return followLinkToFillLimb(trainLineNodes, otherNodeId);
        }
      }
      return trainLineNodes;
    }
  }

  function wrapInLimbObject(trainLineNodes): object {
    return {
      id: [trainLineNodes[0].id, trainLineNodes[trainLineNodes.length - 1].id]
        .sort()
        .join('__'),
      nodes: trainLineNodes,
      color: `hsl(${probable.roll(360)}, 70%, 50%)`
    };
  }

  function addToPageLimbs(trainLine) {
    trainlineMap[trainLine.id] = trainLine;
  }
*/
}

//function nodeIsAJunction(node) {
// return node.links.length > 2;
//}

/*
function otherNodeIdFromLink(node, unwantedNodeId) {
  if (node.links.length !== 2) {
    throw new Error(
      `otherNodeIdFromLink passed node with ${node.links.length} links; only works if there are two.`
    );
  }
  return node.links[0] === unwantedNodeId ? node.links[1] : node.links[0];
}
*/

function nodeIsAnEnd(node) {
  return node.links.length === 1;
}

function removeObsoleteLines(trainLines: Array<TrainLine>) {
  for (var i = trainLines.length - 1; i > -1; --i) {
    if (trainLines[i].obsolete) {
      trainLines.splice(i, 1);
    }
  }
}

function getDestFromLink(nodeMap: NodeMap, destNodeId: string): Node {
  return nodeMap[destNodeId];
}

function comparePossibleDests(trainLine: TrainLine, Node, a: Node, b: Node) {
  // Prefer nodes connect to fewer lines.
  const aLinesLength = Object.keys(a.trainLineMap).length;
  const bLinesLength = Object.keys(b.trainLineMap).length;
  if (aLinesLength < bLinesLength) {
    return -1;
  }
  if (aLinesLength > bLinesLength) {
    return 1;
  }
  // Prefer nodes that keep it moving in a straight line.
  if (trainLine.nodes.length > 1) {
    let mostRecent = last(trainLine.nodes);
    let straightAheadVector = math.subtractPairs(
      mostRecent.pt - penultimate(trainLine.nodes).pt
    );
    let aVector = math.subtractPairs(a.pt, mostRecent.pt);
    let bVector = math.subtractPairs(b.pt, mostRecent.pt);
    let aCosSimToStraight = math.cosSim(straightAheadVector, aVector);
    let bCosSimToStraight = math.cosSim(straightAheadVector, bVector);
    if (aCosSimToStraight > bCosSimToStraight) {
      return -1;
    }
  }
  return 1;
}

function last(array) {
  return array[array.length - 1];
}

function penultimate(array) {
  if (array.length > 1) {
    return array[array.length - 2];
  }
}

function notInTrainline(trainLine: TrainLine, node: Node) {
  return !(trainLine.id in node.trainLineMap);
}

function getEdgesFromTrainLine(trainLine: TrainLine) {
  var edges = [];
  var nodes: Array<Node> = trainLine.nodes;
  for (var i = 1; i < nodes.length; ++i) {
    edges.push(
      getEdgeFromNodeAndPrevNode(nodes[i], nodes[i - 1], trainLine.color.string)
    );
  }
  return edges;
}

function getEdgeFromNodeAndPrevNode(
  node: Node,
  prev: Node,
  colorString: string
) {
  return {
    x1: prev.pt[0],
    y1: prev.pt[1],
    x2: node.pt[0],
    y2: node.pt[1],
    colorString
  };
}

module.exports = trainLineStep;

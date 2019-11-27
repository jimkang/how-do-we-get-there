var pluck = require('lodash.pluck');
var renderEdges = require('../dom/render-edges');
var flatten = require('lodash.flatten');
var accessor = require('accessor');

import { Node, NodeMap, Trainline } from '../types';

function trainLineStep({ page, showDevLayers, probable }): void {
  var nodeMap: NodeMap = page.nodes;
  var junctionNodes: Array<Node> = Object.values(nodeMap).filter(
    nodeIsAJunction
  );
  var trainlineMap: Record<string, Trainline> = {};
  if (junctionNodes.length < 1) {
    junctionNodes.push(Object.values(nodeMap)[0]);
  }

  junctionNodes.forEach(followLinksToFillLimbs);

  if (showDevLayers) {
    renderEdges({
      edges: flatten(Object.values(trainlineMap)),
      className: 'trainLine-edge',
      rootSelector: '#trainLines',
      colorAccessor: accessor('color')
    });
  }

  page.trainlines = trainlineMap;

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
}

function nodeIsAJunction(node) {
  return node.links.length > 2;
}

function otherNodeIdFromLink(node, unwantedNodeId) {
  if (node.links.length !== 2) {
    throw new Error(
      `otherNodeIdFromLink passed node with ${node.links.length} links; only works if there are two.`
    );
  }
  return node.links[0] === unwantedNodeId ? node.links[1] : node.links[0];
}

module.exports = trainLineStep;

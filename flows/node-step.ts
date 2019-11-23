var renderPoints = require('../dom/render-points');
var accessor = require('accessor');

import { Pt, Node, NodeMap } from '../types';

function nodeStep({ page, showDevLayers, gridUnitSize }) {
  var nodeMap: NodeMap = {};
  page.nodes = nodeMap;
  page.bones.forEach(updateNodesConnectedToBone);

  if (showDevLayers) {
    renderPoints({
      points: Object.values(page.nodes),
      scale: gridUnitSize,
      className: 'node',
      rootSelector: '#nodes',
      labelAccessor: getLinkCount,
      ptAccessor: accessor('pt')
    });
  }

  function updateNodesConnectedToBone(bone) {
    updateNode(bone.start, bone.dest);
    updateNode(bone.dest, bone.start);
  }

  function updateNode(jointIndex, destJointIndex) {
    var nodeId = getNodeIdForJointIndex(jointIndex);
    var node: Node = page.nodes[nodeId];
    if (!node) {
      let joint = page.joints[jointIndex];
      node = {
        id: nodeId,
        links: [],
        bones: [],
        pt: joint
      };
      page.nodes[nodeId] = node;
    }
    var linkedNodeId = getNodeIdForJointIndex(destJointIndex);
    if (node.links.indexOf(linkedNodeId) === -1) {
      node.links.push(linkedNodeId);
    }
  }

  function getNodeIdForJointIndex(index) {
    return page.joints[index].join('_');
  }
}

function getLinkCount(node) {
  return node.links.length;
}

module.exports = nodeStep;

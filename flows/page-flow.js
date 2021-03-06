var seedrandom = require('seedrandom');
var Probable = require('probable').createProbable;
//var math = require('basic-2d-math');
//var Enmeaten = require('enmeaten');
//var pluck = require('lodash.pluck');
//var flatten = require('lodash.flatten');
//var shape = require('d3-shape');
//var renderPaths = require('../dom/render-paths');
//var curvesFromExtremes = require('../dom/curves-from-extremes');
//var zoom = require('d3-zoom');
//var curveToPathString = require('../dom/curve-to-path-string');
//var renderBezierCurvePoints = require('../dom/render-bezier-curve-points');
var renderGuy = require('../dom/render-guy');
var renderStoryText = require('../dom/render-story-text');
var waterStep = require('./water-step');
var jointStep = require('./joint-step');
var boneStep = require('./bone-step');
var nodeStep = require('./node-step');
var trainLineStep = require('./trainline-step');

//var accessor = require('accessor');
//const layerShowChance = 40;

function PageFlow(
  {
    seed,
    //curve,
    //widthToLength = 1.5,
    //forkLengthMin = 0.2,
    showDevLayers,
    //hideProdLayers = false,
    //randomizeCutPathStyle,
    //randomizeLayersToShow = false,
    //randomizeCutPointColor,
    //randomizeReticulation,
    figure = '🐙',
    friendFigure = '🦀',
    firstPage,
    lastPage,
    illusWidth = 100,
    illusHeight = 118,
    gridUnitSize
  } /*: {
  seed: string;
  curve: string;
  widthToLength: number;
  forkLengthMin: number;
  showDevLayers: boolean;
  hideProdLayers: boolean;
  randomizeNxNLayerColor: boolean;
  randomizeCutPathStyle: boolean;
  randomizeLayersToShow: boolean;
  randomizeCutPointColor: boolean;
  randomizeJointSize: boolean;
  randomizeNodeLabels: boolean;
  randomizeReticulation: boolean;
  randomizeJointCount: boolean;
  figure: string;
  friendFigure: string;
  firstPage: boolean;
  lastPage: boolean;
  illusWidth: number;
  illusHeight: number;
  gridUnitSize: number;
}*/
) {
  var random = seedrandom(seed);
  var probable = Probable({ random });
  var stepIndex = 0;

  var steps = [
    waterStep,
    jointStep,
    boneStep,
    nodeStep,
    trainLineStep,
    //enmeatenStep,
    //meatPathStep,
    guyStep,
    textStep
  ];

  var page = {};

  return pageFlow;

  function pageFlow({ stepMode = 'continuous' }) {
    // All of the foundation steps should work in grid units.
    // It's up to the renderers to scale them up.
    var stepOpts = {
      page,
      probable,
      getRandomPoint,
      showDevLayers,
      gridUnitSize,
      random,
      unitsWidth: illusWidth / gridUnitSize,
      unitsHeight: illusHeight / gridUnitSize
    };
    if (stepMode === 'continuous') {
      steps.slice(stepIndex).forEach(step => step(stepOpts));
      stepIndex = 0;
    } else {
      let step = steps[stepIndex];
      step(stepOpts);
      stepIndex += 1;
      if (stepIndex >= steps.length) {
        stepIndex = 0;
      }
    }
  }

  function getRandomPoint() {
    const x = ~~(probable.roll(illusWidth + 1) / gridUnitSize) * gridUnitSize;
    const y = ~~(probable.roll(illusHeight + 1) / gridUnitSize) * gridUnitSize;
    return [x, y];
  }

  /*
  function enmeatenStep() {
    var enmeaten = Enmeaten({ random, numberOfDecimalsToConsider: 3 });
    page.cuts = Object.values(page.limbs).map(makeCut);

    if (showDevLayers) {
      if (!randomizeLayersToShow || probable.roll(100) <= layerShowChance) {
        renderPoints({
          points: flatten(pluck(page.cuts, 'points')),
          rootSelector: '#cut-points',
          className: 'cut-point',
          r: 0.7,
          colorAccessor: randomizeCutPointColor ? getCutPointColor() : undefined
        });
      }
    }

    // These are cuts as in "cuts of meat".
    function makeCut(limb) {
      const maxBoneLength = getMaxBoneLengthInNodes(limb.nodes);
      var forkLengthMax = maxBoneLength * widthToLength;
      if (forkLengthMax < forkLengthMin) {
        forkLengthMax = forkLengthMin;
      }
      var points = enmeaten({
        bone: limb.nodes.map(getPointFromNode),
        forkLengthRange: [forkLengthMin, forkLengthMax],
        //extraRoundness: true,
        widthInterpolator: clampWidth,
        symmetricalEnds: true,
        endAngleRange: [45, 60]
      });

      return {
        id: 'cut__' + limb.id,
        limbColor: limb.color,
        points
      };
    }
  }

  function meatPathStep() {
    var d3Reticulator;
    if (randomizeReticulation) {
      if (probable.roll(2) === 0) {
        let d3Curve = probable.pickFromArray([
          'curveBasisClosed',
          'curveCatmullRomClosed',
          'curveStep'
        ]);

        d3Reticulator = shape.line().curve(shape[d3Curve]);
      }
      // else, just use the bezier curve stuff.
    } else if (curve) {
      d3Reticulator = shape.line().curve(shape[curve]);
    }
    page.diagnosticBezierCurves = [];

    page.cuts.forEach(addPathToCut);

    if (showDevLayers) {
      let strokeWidthAccessor;
      let strokeDashArrayAccessor;

      if (randomizeCutPathStyle) {
        strokeWidthAccessor = getCutPathStrokeWidth;
        strokeDashArrayAccessor = getCutPathDashArray;
      }

      if (!randomizeLayersToShow || probable.roll(100) <= layerShowChance) {
        renderPaths({
          pathContainers: page.cuts,
          rootSelector: '#cut-paths',
          className: 'cut-path',
          colorAccessor: accessor('limbColor'),
          strokeWidthAccessor,
          strokeDashArrayAccessor
        });
      }
    }

    if (!hideProdLayers) {
      let tunnelColor = getTunnelColor();
      if (!randomizeLayersToShow || probable.roll(100) <= layerShowChance) {
        renderPaths({
          pathContainers: page.cuts,
          rootSelector: '#tunnel-fills',
          className: 'tunnel-fill',
          fillAccessor: tunnelColor
        });
      }
    }

    if (showDevLayers) {
      if (!randomizeLayersToShow || probable.roll(100) <= layerShowChance) {
        renderBezierCurvePoints({
          rootSelector: '#bezier-points',
          curves: flatten(pluck(page.diagnosticBezierCurves, 'curves'))
        });
      }
    }

    function addPathToCut(cut) {
      if (d3Reticulator) {
        cut.path = d3Reticulator(cut.points);
      } else {
        let bezierCurves = curvesFromExtremes(zoom.zoomIdentity, cut.points);
        console.log('bezierCurves', bezierCurves);
        cut.path = `M ${bezierCurves.start.x},${bezierCurves.start.y}`;
        cut.path += bezierCurves.curves.map(curveToPathString).join('\n');
        page.diagnosticBezierCurves = page.diagnosticBezierCurves.concat(
          bezierCurves
        );
      }
    }
  }
*/

  function guyStep() {
    var homeBone = probable.pickFromArray(page.bones);
    var guyLocation = getLocationOnBone(homeBone);
    if (lastPage) {
      guyLocation = [40, 60];
    } else if (firstPage) {
      guyLocation = [50, 50];
    }
    renderGuy({
      x: guyLocation[0],
      y: guyLocation[1],
      rotation: lastPage || firstPage ? 0 : probable.roll(360),
      figure,
      rootSelector: '#searcher',
      className: firstPage || lastPage ? 'embiggened' : ''
    });

    var friendBone;
    if (!firstPage && page.bones.length > 1) {
      let friendLocation;
      if (lastPage) {
        friendLocation = [60, 60];
      } else {
        do {
          friendBone = probable.pickFromArray(page.bones);
        } while (friendBone.id !== homeBone.id);
        friendLocation = getLocationOnBone(friendBone);
      }
      renderGuy({
        x: friendLocation[0],
        y: friendLocation[1],
        rotation: lastPage || firstPage ? 0 : probable.roll(360),
        figure: friendFigure,
        rootSelector: '#lost-friend',
        className: firstPage || lastPage ? 'embiggened' : ''
      });
    }
  }

  function textStep() {
    var text;
    if (firstPage) {
      text =
        'Hello. My friend is lost. Lost in the depths of strange space! But! I will find them.';
    } else if (lastPage) {
      text =
        '<p>"Aha! There you are!"</p><p>"And there you are! Space is a small world."</p><p>"Space is not a world."</p><p>"If you say so! Well, let\'s eat a dinner.</p>';
    } else {
      text = probable.pickFromArray([
        'Where is my friend?',
        `Could they be ${probable.pickFromArray(['here', 'there'])}?`,
        'Maybe I should back up?',
        'HELLO! ANY FRIENDS OUT HERE?',
        `${probable.pickFromArray([
          'Wow',
          'Whoa',
          'OMG'
        ])} ${probable.pickFromArray([
          'check that out',
          'look at that',
          'lookit'
        ])}!`,
        "Maybe they're behind that thing.",
        'Do you see them?',
        `I feel ${probable.pickFromArray([
          'lost',
          'scared',
          'depressed',
          'overwhelmed'
        ])}.`,
        'Was I already here?',
        'What is this quadrant?',
        'So weird!',
        "I've gotta keep on searching!",
        "I've gotta do my very best!",
        'This is kinda fun.',
        `Space is ${probable.pickFromArray([
          'vast',
          'amazing',
          'beautiful',
          'unfathomable'
        ])}.`,
        `There are a lot of ${probable.pickFromArray([
          'weird',
          'strange',
          'mysterious'
        ])} ${probable.pickFromArray([
          'developments',
          'systems',
          'forces'
        ])} out here.`,
        'I wonder if my friend is hungry, too?'
      ]);
    }

    renderStoryText({ text });
  }
  /*
  function getTunnelColor() {
    if (probable.roll(4) === 0) {
      return 'hsla(0, 0%, 0%, 0.8)';
    } else {
      // Avoid yellows.
      return `hsla(${(180 + probable.roll(200)) % 360}, 80%, 50%, 0.2)`;
    }
  }

  function getNxNColor() {
    if (probable.roll(4) === 0) {
      return 'hsl(220, 40%, 50%)';
    } else {
      return `hsl(${probable.roll(360)}, 40%, 50%)`;
    }
  }

  function getCutPathStrokeWidth() {
    return 0.1 * probable.rollDie(10);
  }

  function getCutPathDashArray() {
    return `${0.1 * probable.rollDie(10)} ${0.1 * probable.rollDie(10)}`;
  }

  function getCutPointColor() {
    return `hsl(${probable.roll(360)}, 40%, 30%)`;
  }

  function getJointSize() {
    return (probable.rollDie(5) + probable.rollDie(6)) * 0.1;
  }

  function getStarColor() {
    if (probable.roll(4) === 0) {
      return 'white';
    } else {
      return `hsl(${probable.roll(360)}, 60%, ${40 + probable.roll(20)}%)`;
    }
  }

  function getRandomLabel() {
    if (probable.roll(4) === 0) {
      return String.fromCharCode(97 + probable.roll(11500));
    } else if (probable.roll(4) === 0) {
      return probable.roll(100);
    } else {
      return probable.roll(10);
    }
  }
  */

  function getLocationOnBone(bone) {
    var boneXRange = bone.x2 - bone.y2;
    var boneSlope = (bone.y2 - bone.y1) / boneXRange;
    var xDelta = probable.roll(boneXRange * 1000) / 1000;
    return [bone.y2 + xDelta, bone.y1 + xDelta * boneSlope];
  }
}

/*
function getPointFromNode(node) {
  return [node[0], node[1]];
}

function getMaxBoneLengthInNodes(nodes) {
  var maxLength = 0;
  for (var i = 0; i < nodes.length - 1; ++i) {
    let length = math.getVectorMagnitude(
      math.subtractPairs(nodes[i + 1], nodes[i])
    );
    if (length > maxLength) {
      maxLength = length;
    }
  }
  return maxLength;
}
*/
// If width is really close to endToEndDistance, it will cut it down a lot.
// If it's really far, then it won't affect it much.
//function clampWidth({ width, endToEndDistance }) {
// return Math.max(width * (1.0 - width / endToEndDistance) * 0.6, 0);
//}

module.exports = PageFlow;

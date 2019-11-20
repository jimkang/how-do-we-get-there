var handleError = require('handle-error-web');
var wireControls = require('./dom/wire-controls');
var PageFlow = require('./flows/page-flow');
var RouteState = require('route-state');

var routeState = RouteState({
  followRoute,
  windowObject: window,
  propsToCoerceToBool: [
    'showDevLayers',
    'randomizeNxNLayerColor',
    'randomizeCutPathStyle',
    'randomizeLayersToShow',
    'randomizeCutPointColor',
    'randomizeJointSize',
    'randomizeNodeLabels',
    'randomizeReticulation',
    'randomizeJointCount',
    'lastPage',
    'firstPage'
  ]
});

(function go() {
  window.onerror = reportTopLevelError;
  window.Typekit.load();
  routeState.routeFromHash();
})();

// Example URL: http://localhost:9966/#seed=fifty-one.2&showDevLayers=yes&randomizeNxNLayerColor=yes&randomizeCutPathStyle=yes&randomizeLayersToShow=no&randomizeCutPointColor=yes&randomizeJointSize=yes&randomizeNodeLabels=yes&randomizeReticulation=yes&randomizeJointCount=yes&lastPage=no&firstPage=no
function followRoute({
  stepMode,
  seed,
  curve,
  widthToLength,
  forkLengthMin,
  showDevLayers,
  hideProdLayers,
  jointCount,
  randomizeNxNLayerColor,
  randomizeCutPathStyle,
  randomizeLayersToShow,
  randomizeCutPointColor,
  randomizeJointSize,
  randomizeNodeLabels,
  randomizeReticulation,
  hideUI,
  figure,
  friendFigure,
  randomizeJointCount,
  firstPage,
  lastPage,
  gridUnitSize = 5
}) {
  if (!seed) {
    seed = new Date().toISOString();
    routeState.addToRoute({ seed });
    return;
  }

  var pageFlow = PageFlow({
    seed,
    curve,
    widthToLength: numberizeIfThere(widthToLength),
    forkLengthMin: numberizeIfThere(forkLengthMin),
    showDevLayers,
    hideProdLayers,
    jointCount,
    randomizeNxNLayerColor,
    randomizeCutPathStyle,
    randomizeLayersToShow: randomizeLayersToShow === 'yes',
    randomizeCutPointColor,
    randomizeJointSize,
    randomizeNodeLabels,
    randomizeReticulation,
    figure,
    friendFigure,
    randomizeJointCount,
    firstPage,
    lastPage,
    gridUnitSize: +gridUnitSize
  });
  wireControls({ pageFlow, clearSeed, hideUI: hideUI === 'yes' });
  pageFlow({ stepMode });
}

function clearSeed() {
  routeState.addToRoute({ seed: '' });
}

function reportTopLevelError(msg, url, lineNo, columnNo, error) {
  handleError(error);
}

function numberizeIfThere(v) {
  return isNaN(v) ? undefined : +v;
}

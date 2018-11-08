/*

  clustergrammer-gl version 0.6.7

 */

var run_viz = require('./draws/run_viz');
var build_control_panel = require('./control_panel/build_control_panel');
var build_dendrogram_sliders = require('./dendrogram/build_dendrogram_sliders')
var pako = require('pako');

function clustergrammer_gl(args){

  console.log('################################');
  console.log('clustergrammer-gl version 0.6.7');
  console.log('################################');

  // decompress if necessary
  // https://stackoverflow.com/questions/8936984/uint8array-to-string-in-javascript
  var network;
  if (typeof (args.network) === 'string'){

    // Decode base64 (convert ascii to binary)
    var comp_net = JSON.parse(args.network).compressed;

    strData     = atob(comp_net);

    // Convert binary string to character-number array
    var charData    = strData.split('').map(function(x){return x.charCodeAt(0);});

    // Turn number array into byte-array
    var binData     = new Uint8Array(charData);

    // Pako magic
    var data        = pako.inflate(binData);

    var strData = new TextDecoder().decode(data)

    var uncomp_net = JSON.parse(strData)

    network = uncomp_net;
    // console.log('decompressed')
  } else {
    network = args.network;
    // console.log('no need to decompress')
  }

  var container = args.container;

  // make control panel first so it appears above canvas
  d3.select(container)
    .append('div')
    .attr('class', 'control-container')
    .style('cursor', 'default');

  d3.select(container)
    .append('div')
    .attr('class', 'canvas-container')
    .style('position', 'absolute')
    .style('cursor', 'default');

  var canvas_container = d3.select(container).select('.canvas-container')[0][0];


  var inst_height = args.viz_height;
  var inst_width  = args.viz_width;

  d3.select(canvas_container)
    .style('height',inst_height + 'px')
    .style('width',inst_width+'px');

  var regl = require('regl')({
    extensions: ['angle_instanced_arrays'],
    container: canvas_container,
    // pixelRatio: window.devicePixelRatio/10
  });

  var params = run_viz(regl, network);

  var cgm = {};

  cgm.params = params;

  cgm.params.viz_height = inst_height;
  cgm.params.viz_width = inst_width;

  // id of container
  cgm.params.root = '#' + args.container.id;
  cgm.params.canvas_root = cgm.params.root + ' .canvas-container';
  cgm.params.container = args.container;
  cgm.params.canvas_container = canvas_container;

  build_dendrogram_sliders(regl, cgm);

  build_control_panel(regl, cgm);

  return cgm;

}

// necessary for exporting function
module.exports = clustergrammer_gl;
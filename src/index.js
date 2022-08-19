import manual_update_to_cats from "./cats/manualUpdateToCats";
import update_all_cats from "./cats/updateAllCats";
import build_control_panel from "./controlPanel/buildControlPanel";
import download_matrix from "./download/downloadMatrix";
import download_metadata from "./download/downloadMetadata";
import draw_webgl_layers from "./draws/drawWebglLayers";
import destroy_viz from "./initializeViz/destroyViz";
import initialize_containers from "./initializeViz/initializeContainers";
import viz_from_network from "./initializeViz/vizFromNetwork";
import genOrderedLabels from "./params/genLabelPar";
import initialize_params from "./params/initializeParams";
import initialize_regl from "./params/initializeRegl";
import recluster from "./recluster/recluster";
import initialize_tooltip from "./tooltip/initializeD3Tip";
import zoom_rules_high_mat from "./zoom/zoomRulesHighMat";

function adjust_opacity(cgm, opacity_scale) {
  const params = cgm.params;
  params.matrix.opacity_scale = opacity_scale;
  cgm.make_matrix_args(cgm);
  draw_webgl_layers(cgm.regl, params);
}

function clustergrammer_gl(args, external_model = null) {
  let cgm = {};
  // check if container is defined
  if (args.container !== null) {
    cgm.args = args;
    // always do these
    cgm.initialize_params = initialize_params;
    cgm.initialize_regl = initialize_regl;
    cgm.initialize_containers = initialize_containers;
    cgm.initialize_tooltip = initialize_tooltip;
    // maybe do these
    if (!args.showControlPanel) {
      cgm.build_control_panel = (cgm) => cgm;
    } else {
      cgm.build_control_panel = build_control_panel;
    }
    cgm.destroy_viz = () => destroy_viz(cgm);
    cgm.viz_from_network = viz_from_network;
    cgm.zoom_rules_high_mat = zoom_rules_high_mat;
    cgm.gen_ordered_labels = genOrderedLabels;
    if (typeof args.widget_callback !== "undefined") {
      cgm.widget_callback = args.widget_callback;
    }
    // initialize network
    cgm.network = args.network;
    // going to work on passing in filtered network in place of full network
    // as a quick crop method
    cgm = cgm.viz_from_network(cgm, external_model);
    // copy the cgm object to the external widget model
    if (external_model !== null) {
      external_model.cgm = cgm;
    }
    cgm.recluster = recluster;
    cgm.manual_update_to_cats = manual_update_to_cats;
    cgm.update_all_cats = update_all_cats;
    cgm.download_matrix = download_matrix;
    cgm.download_metadata = download_metadata;

    cgm.adjust_opacity = () => adjust_opacity(cgm);
    return cgm;
  }
}
export default clustergrammer_gl;

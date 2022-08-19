// TODO: fix
/* eslint-disable no-invalid-this */

import * as d3 from "d3";
import draw_webgl_layers from "../draws/drawWebglLayers";
import custom_round from "../utils/customRound";

export default (function build_opacity_slider(cgm) {
  const params = cgm.params;
  const slider_length = 100;
  const rect_height = slider_length + 20;
  const rect_width = 20;
  const round_level = -1;
  const drag = d3
    .drag()
    .on("drag", dragging)
    .on("end", function () {
      params.is_opacity_drag = false;
      change_opacity(params.opacity_slider_value);
    });
  const slider_group = d3
    .select(params.root + " .control_svg")
    .append("g")
    .classed("opacity_slider_group", true)
    .attr("transform", function () {
      const inst_translation =
        "translate(" + rect_width / 2 + ", " + rect_height / 10 + ")";
      return inst_translation;
    })
    .attr("transform", "translate(435, 110), rotate(-90)");
  slider_group
    .append("rect")
    .classed("opacity_slider_background", true)
    .attr("height", rect_height + "px")
    .attr("width", rect_width + "px")
    .attr("fill", "red")
    .attr("transform", function () {
      const translate_string = "translate(-10, -5)";
      return translate_string;
    })
    .attr("opacity", 0);
  slider_group
    .append("line")
    .attr("stroke-width", slider_length / 7 + "px")
    .attr("stroke", "black")
    .attr("stroke-linecap", "round")
    .attr("opacity", 0.0)
    .attr("y1", 0)
    .attr("y2", function () {
      return slider_length - 2;
    })
    .on("click", click_opacity_slider);
  const offset_triangle = -slider_length / 40;
  slider_group
    .append("path")
    .attr("fill", "black")
    .attr("transform", "translate(" + offset_triangle + ", 0)")
    .attr("d", function () {
      // up triangle
      const start_x = 0;
      const start_y = 0;
      const mid_x = 0;
      const mid_y = slider_length;
      const final_x = slider_length / 10;
      const final_y = 0;
      const output_string =
        "M" +
        start_x +
        "," +
        start_y +
        " L" +
        mid_x +
        ", " +
        mid_y +
        " L" +
        final_x +
        "," +
        final_y +
        " Z";
      return output_string;
    })
    .attr("opacity", 0.35)
    .on("click", click_opacity_slider);
  const default_opacity = 0.35;
  const high_opacity = 0.6;
  slider_group
    .append("circle")
    .classed("opacity_group_circle", true)
    .attr("r", slider_length * 0.08)
    .attr("transform", function () {
      return "translate(0, " + slider_length / 2 + ")";
    })
    .attr("fill", "blue")
    .attr("opacity", default_opacity)
    .on("mouseover", function () {
      d3.select(this).attr("opacity", high_opacity);
    })
    .on("mouseout", function () {
      d3.select(this).attr("opacity", default_opacity);
    })
    .call(drag);
  const text_color = "#47515b";
  const button_dim = {};
  button_dim.height = 32;
  button_dim.width = 63;
  button_dim.buffer = 12;
  button_dim.x_trans = button_dim.width + button_dim.buffer;
  button_dim.fs = 11;
  // add opacity level text
  // /////////////////////////////
  slider_group
    .append("text")
    .text("opacity".toUpperCase())
    .attr("font-family", '"Helvetica Neue", Helvetica, Arial, sans-serif')
    .attr("font-weight", 400)
    .attr("font-size", button_dim.fs)
    .attr("text-anchor", "middle")
    .attr("stroke", text_color)
    .attr("alignment-baseline", "middle")
    .attr("letter-spacing", "2px")
    .attr("cursor", "default")
    .attr("transform", "translate(10, 140), rotate(90)");
  params.dendro.default_opacity_scale = 1.0;
  slider_group
    .append("text")
    .classed("opacity_level_text", true)
    .text("1.0")
    .attr("transform", "translate(-5, 140) rotate(90)")
    .attr("font-family", '"Helvetica Neue", Helvetica, Arial, sans-serif')
    .attr("font-weight", 400)
    .attr("font-size", 11)
    .attr("text-anchor", "right")
    .attr("stroke", text_color)
    .attr("alignment-baseline", "middle")
    .attr("letter-spacing", "2px")
    .attr("cursor", "default");
  function dragging() {
    params.is_opacity_drag = true;
    let slider_pos = d3.event.y;
    if (slider_pos < 0) {
      slider_pos = 0;
    }
    if (slider_pos > slider_length) {
      slider_pos = slider_length;
    }
    if (this.nextSibling) {
      this.parentNode.appendChild(this);
    }
    slider_pos = custom_round(slider_pos, round_level);
    const slider_value = get_slider_value(slider_pos);
    d3.select(this).attr("transform", "translate(0, " + slider_pos + ")");
    params.opacity_slider_value = slider_value;
  }
  function click_opacity_slider() {
    const clicked_line_position = d3.mouse(this);
    const rel_pos = custom_round(clicked_line_position[1], round_level);
    d3.select(params.root + " ." + "opacity_group_circle").attr(
      "transform",
      "translate(0, " + rel_pos + ")"
    );
    const slider_value = get_slider_value(rel_pos);
    params.opacity_slider_value = slider_value;
    change_opacity(slider_value);
  }
  // convert from position along slider to a value that will be used to set
  // the group level
  function get_slider_value(slider_position) {
    // get to -2 and 2 range
    const inst_x = (slider_position / 50 - 1) * 2;
    // take inverse log2 to get opacity scale
    const inst_y = Math.pow(2, inst_x);
    return inst_y;
  }
  function change_opacity(slider_value) {
    slider_value = custom_round(slider_value, 2);
    params.matrix.opacity_scale = slider_value;
    cgm.make_matrix_args(cgm);
    draw_webgl_layers(cgm.regl, params);
    d3.select(params.root + " .opacity_level_text").text(slider_value);
  }
});


if (typeof OpenCV == "undefined" || !OpenCV) {
  OpenCV = {};
}


OpenCV.MorphologyBuilder = {
  _type: 'erode',
  _kernelSize: 3,
  _shape: 0,

  toJSON: function MB_toJSON(name) {
    return JSON.stringify({
      id: name,
      type: this._type,
      kernel: this._kernelSize,
      shape: this._shape
    });
  },

  buildUI: function MB_buildUI($target) {
    var self = this;

    // Morphology type radio buttons.
    let $type = $('<div>')
    .attr('id', 'morphology_type')
    .appendTo($target)
    .html('\
      <input type="radio" id="mor1" name="MORPH_TYPE" value="erode" checked="checked"><label for="mor1">Erode</label> \
      <input type="radio" id="mor2" name="MORPH_TYPE" value="dilate"><label for="mor2">Dilate</label>')
    .css('margin-top', '10px')
    ;

    $('#morphology_type input[type=radio]')
    .change(function() {
      self._type = this.value;
      OpenCV.MainCommandDispatcher.draw();
    })
    ;

    $type.buttonset();

    // Shape radio buttons.
    let $shape = $('<div>')
    .attr('id', 'shape_type')
    .appendTo($target)
    .html('\
      <input type="radio" id="shape1" name="SHAPE_TYPE" value="0" checked="checked"><label for="shape1">Rect</label> \
      <input type="radio" id="shape2" name="SHAPE_TYPE" value="1"><label for="shape2">Cross</label>\
      <input type="radio" id="shape3" name="SHAPE_TYPE" value="2"><label for="shape3">Ellipse</label>')
    .css('margin-top', '10px')
    ;

    $('#shape_type input[type=radio]')
    .change(function() {
      self._shape = parseInt(this.value);
      OpenCV.MainCommandDispatcher.draw();
    })
    ;

    $shape.buttonset();

    // Kernel size selection.
    var kernelSizeCaption = $('<p>')
    .text('Kernel Size: ' + this._kernelSize)
    .attr('class', "ui-widget")
    .appendTo($target)
    ;
    $('<div>')
    .appendTo($target)
    .slider({
      value: this._kernelSize,
      min: 1,
      max: 21,
      step: 2,
      animation: true,
      slide: function(evt, ui) {
        self._kernelSize = ui.value;
        kernelSizeCaption.text('Kernel size: ' + self._kernelSize);
        OpenCV.MainCommandDispatcher.draw();
      }
    });
  }
};

OpenCV.MorphologyPanel = new OpenCV.ModulePanel('Morphology', 'Morphology', OpenCV.MorphologyBuilder);
OpenCV.PipelineBuilder.register(OpenCV.MorphologyPanel);

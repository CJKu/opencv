if (typeof OpenCV == "undefined" || !OpenCV) {
  OpenCV = {};
}

// By moving OpenCV call to worker thread, ieeally, we do not need to link opencv.js 
// library in main thread. Unfortunately, we still need some constant definition
// exported from opencv.js. Cheap solution is to re-define those constant manually. 
OpenCV.ThresholdType = {
  THRESH_BINARY: 0, 
  THRESH_BINARY_INV: 1, 
  THRESH_TRUNC: 2, 
  THRESH_TOZERO: 3, 
  THRESH_TOZERO_INV: 4, 
  THRESH_MASK: 7,
  THRESH_OTSU: 8, 
  THRESH_TRIANGLE: 16
}; 

OpenCV.ThresholdBuilder = {
  _threshold: 100,
  _thresholdMax: 210,
  _thresholdType: OpenCV.ThresholdType.THRESH_BINARY,

  toJSON: function TB_toJSON(name) {
    return JSON.stringify({
      id: name,
      type: this._thresholdType,
      threshold: this._threshold,
      thresholdMax: this._thresholdMax
    });
  },

  buildUI: function TB_buildUI($target) {
    var self = this;

    // Threshold type radio buttons.
    let $type = $('<div>')
    .attr('id', 'threshold_type')
    .appendTo($target)
    .html('\
      <input type="radio" id="radio1" name="THRESH_TYPE" value="THRESH_BINARY" checked="checked">\
      <label for="radio1">Binary</label>\
      <input type="radio" id="radio3" name="THRESH_TYPE" value="THRESH_TRUNC">\
      <label for="radio3">Truncate</label>\
      <input type="radio" id="radio4" name="THRESH_TYPE" value="THRESH_TOZERO">\
      <label for="radio4">ToZero</label>\
      ')
    .css('margin-top', '10px')
    ;
    // Tempoary remove INV types since it's just not work.
    //  <input type="radio" id="radio2" name="THRESH_TYPE" value="THRESH_BINARY_INV">\
    //  <label for="radio2">THRESH_BINARY_INV</label> \
    //  <input type="radio" id="radio5" name="THRESH_TYPE" value="THRESH_TOZERO_INV">\
    //  <label for="radio5">THRESH_TOZERO_INV</label> \
    $('#threshold_type input[type=radio]')
    .change(function() {
      self._thresholdType = OpenCV.ThresholdType[this.value];
      OpenCV.MainCommandDispatcher.draw();
    })
    ;

    // Threshold label and slider.
    var tresholdCaption = $('<p>')
    .text('Threshold: ' + this._threshold)
    .attr('class', "ui-widget")
    .appendTo($target)
    ;
    $('<div>')
    .appendTo($target)
    .slider({
      value: this._threshold,
      min: 0,
      max: 255,
      step: 1,
      animation: true,
      slide: function(evt, ui) {
        self._threshold = ui.value;
        tresholdCaption.text('Threshold :' + self._threshold);
        OpenCV.MainCommandDispatcher.draw();
      }
    });

    // Threshold max lable and slider.
    var tresholdMaxCaption = $('<p>')
    .text('Threshold Max: ' + this._thresholdMax)
    .attr('class', "ui-widget")
    .appendTo($target)
    ;
    $('<div>')
    .appendTo($target)
    .slider({
      value: this._thresholdMax,
      min: 0,
      max: 255,
      step: 1,
      animation: true,
      slide: function(evt, ui) {
        self._thresholdMax = ui.value;
        tresholdMaxCaption.text('Threshold Max: ' + self._thresholdMax);
        OpenCV.MainCommandDispatcher.draw();
      }
    });

    $type.buttonset();
  }
};

OpenCV.ThresholdPanel = new OpenCV.ModulePanel('Threshold', 'Threshold', OpenCV.ThresholdBuilder);
OpenCV.PipelineBuilder.register(OpenCV.ThresholdPanel);

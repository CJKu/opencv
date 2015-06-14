if (typeof OpenCV == "undefined" || !OpenCV) {
  OpenCV = {};
}

OpenCV.FilterBuilder = {
  _blurType: "blur",
  _kernelSize: 3,

  toJSON: function(name) {
    return JSON.stringify({
    	id: name,
    	type: this._blurType,
    	kernel: this._kernelSize
    });
  },

  buildUI: function($target) {
    var self = this;

    // Filter algorithm selection widget.
    let $type = $('<div>')
    .attr('id', 'blur_type')
    .appendTo($target)
    .html('<input type="radio" id="bt_radio1" name="THRESH_TYPE" value="blur" checked="checked"><label for="bt_radio1">Blur</label> \
      <input type="radio" id="bt_radio2" name="THRESH_TYPE" value="GaussianBlur"><label for="bt_radio2">GaussianBlur</label> \
      <input type="radio" id="bt_radio3" name="THRESH_TYPE" value="medianBlur"><label for="bt_radio3">MedianBlur</label> \
      ')
    .css('margin-top', '10px')
    ;

    // Blur type selection widget.
    $('#blur_type input[type=radio]')
    .change(function() {
      self._blurType = this.value;
      OpenCV.MainCommandDispatcher.draw();
    })
    ;

    $type.buttonset();

    // Kernel size selection and label widget.
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
      max: 11,
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

OpenCV.FilterPanel = new OpenCV.ModulePanel('Filter', 'Filter', OpenCV.FilterBuilder);
OpenCV.PipelineBuilder.register(OpenCV.FilterPanel);
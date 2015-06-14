if (typeof OpenCV == "undefined" || !OpenCV) {
  OpenCV = {};
}


OpenCV.HistogramBuilder = {
  _$histCanvas: null,

  buildUI: function HB_buildUI($target) {
    this._$histCanvas = $('<canvas>')
    .appendTo($target)
    .width($target.width())
    .height($target.height() - 40)
    .attr('id', 'histogram')
    .attr('width', $target.width())
    .attr('height', $target.height() - 40)
    ;
  },

  draw: function HB_draw(message) {
    // Draw histogram
    // XXX:
    // It's too bad that we can submit draw call in worker thread.
    // Canvas proxy need!
    let canvasWidth = this._$histCanvas.width();
    let canvasHeight = this._$histCanvas.height();
    let view = message.histogramImageData.data;
    let length = message.histogramImageData.width * message.histogramImageData.height;
    let max = 0;
    for (let i = 0; i < length; i++) {
      if (view[i] > max)
        max = view[i];
    }

    let yratio = canvasHeight / max; 
    let xratio = canvasWidth / message.histogramBins;
    let ctx = this._$histCanvas[0].getContext('2d');
    ctx.save();

    // clear
    ctx.clearRect( 0, 0, canvasWidth, canvasHeight);

    // draw 
    ctx.scale(1, -1);
    ctx.translate(0, -canvasHeight);
    ctx.fillStyle= "#0000FF"; // I am blue....
    for (let i = 0; i < length; i++) {
      // "- 1" to introduce a gap between two bars.
      ctx.fillRect(i * xratio, 0, xratio - 1, view[i] * yratio);
    }

    ctx.restore();
  }
};

OpenCV.HistogramPanel = new OpenCV.ModulePanel('Histogram', 'Histogram', OpenCV.HistogramBuilder);
OpenCV.PipelineBuilder.register(OpenCV.HistogramPanel);
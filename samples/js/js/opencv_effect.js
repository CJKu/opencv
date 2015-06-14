
if (typeof OpenCV == "undefined" || !OpenCV) {
  OpenCV = {};
}

OpenCV.Effect = function() {

};

OpenCV.Effect.prototype = {
  constructor: OpenCV.Effect,

  init: function CVE_init(targetDiv) {
    this._targetDiv = targetDiv;
  },

  apply: function CVE_apply(sourceImageData) {

  },
};
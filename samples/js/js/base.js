if (typeof OpenCV == "undefined" || !OpenCV) {
  OpenCV = {};
}

OpenCV.CodeSnippets = {
  init: function CS_init() {
    var $s = $('#code_snippet').detach();
    var $snippets = $s.children();

    this['Filter'] = $snippets[0];
    this['Histogram'] = $snippets[1];
    this['Threshold'] = $snippets[2];
    this['Morphology'] = $snippets[3];
  },
};

OpenCV.ModulePanel = function(title, name, builder) {
  this._$pane = null;
  this._$rightPane = null;
  this._$canvas = null;
  this._ctx = null;
  this._name = name;
  this._title = title;
  this._builder = builder;
};

OpenCV.ModulePanel.prototype = {
  constructor: OpenCV.ModulePanel,
  attach: function M_attach($target) {
    this._$pane = $("<div>")
        .attr('class', 'image_pane')
        .appendTo($target);

    var $leftPane = $("<div>")
      .attr('class', 'left_pane')
      .appendTo(this._$pane);

   this._$canvas = $("<canvas>")
        .appendTo($leftPane);

    // this._ctx is where you put generated image.  
    this._ctx = this._$canvas[0].getContext('2d');

    // Right pane. Module parameters.
    this._$rightPane = $("<div>")
      .attr('class', 'right_pane')
      .appendTo(this._$pane);
    $('<p>')
      .attr('class', "ui-widget")
      .text(this.title)
      .css('font-weight', 'bold')
      .appendTo(this._$rightPane)
      ;

    // perf indicator
    $('<p>')
    	.attr('class', 'perf_indicator')
      .appendTo(this._$rightPane)
      ;

    // code snippet
    let $snippet = $(OpenCV.CodeSnippets[this.name]);
    if ($snippet.length) {
      $("<div>")
        .text('code ...')
        .button()
        .appendTo($target)
        .click(function( event ) {
          $snippet.toggle('slow');
        });

      $snippet.appendTo($target);
    }

    if (!!this._builder && !!this._builder.buildUI) {
      this._builder.buildUI(this._$rightPane);
    }
  },

  get title() {
  	return this._title;
  },

  get name() {
  	return this._name;
  },

  draw: function M_draw(message) {
  	if (!!message.imageData) {
    	this._$canvas.attr('width', message.imageData.width);
    	this._$canvas.attr('height', message.imageData.height);
  	
    	this._ctx.putImageData(message.imageData, 0, 0);
    }
    if (!!message.duration) {
    	this._$rightPane.find('.perf_indicator')
    	  .text('Elapsed time: ' + message.duration + " ms")
    		;
    }
    if (!!this._builder && this._builder.draw) {
      return this._builder.draw(message);
    }
  },

  toJSON: function M_toJSON() {
    if (!!this._builder && this._builder.toJSON) {
      return this._builder.toJSON(this._name);
    }

    return JSON.stringify({ id: this.name,});
  }
};

//  Image data generator.
OpenCV.ImageLoader = {
  _canvas: null,
  _ctx: null,

  load: function(blob) {
    /*this._lazyInit();

    let $image = $('#baboon_img');
    this._canvas.width = $image[0].width;
    this._canvas.height = $image[0].height;

    this._ctx.drawImage($image[0], 0, 0);
    return new Promise(function(resolve, reject) {
        resolve();
      });*/
    this._lazyInit();
    var self = this;
    var reader = new FileReader();
    var promise = new Promise(function(resolve, reject) {
      reader.onload = function(e)  {
        var dataURL = reader.result;
        //var dataURL = reader.result.split(',')[1];
        //dataURL = atob(dataURL);
        //var aaa = btoa(decodeURIComponent(escape(dataURL)));

        try {
          self
            ._drawImage(dataURL)
            //._drawImage("data:image/png;base64," + aaa)
            .then(function() { 
              resolve();
            });
        } catch(e) {
          alert("TBD: something wrong. Error message.");
          reject();
        }
      };
        
      reader.readAsDataURL(blob);
    });

    return promise;
  },

  createImageData: function SI_getImageData() {
    if (this._ctx === undefined) {
      return null;
    }

    return this._ctx.getImageData(0, 0, this._canvas.width, this._canvas.height);
  },

  _drawImage: function SI_load(dataURL) {
    var $image = $("<img>");
    $image.appendTo("body");

    $image.attr('display', 'none');
    $image.attr('id', 'draw_target');
    $image.attr('src', dataURL);

    var self = this;
    return new Promise(function(resolve, reject) {
      $image[0].onload = function() {
        self._canvas.width = this.width;
        self._canvas.height = this.height;

        self._ctx.drawImage(this, 0, 0);
        $('#draw_target').remove();
        resolve();
      }
    });
  },

  _lazyInit: function SI_lazyInit() {
    if (null === this._canvas) {
      this._canvas = $("<canvas>")[0];
      this._ctx = this._canvas.getContext("2d");
    }
  }
};

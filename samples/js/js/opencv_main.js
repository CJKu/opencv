if (typeof OpenCV == "undefined" || !OpenCV) {
  OpenCV = {};
}

OpenCV.PipelineBuilder = {
  _moduleList: [],
  _selectedList: [],
  _sourceDrawer: null,

  register: function ML_register(module) {
    this._moduleList.push(module);
  },

  get modules() {
    return this._moduleList;
  },

  build: function ML_build() {
    $('#pane_holder').empty(); 
    
    SourceBuilder = {
      _$target: null,

      buildUI: function($target) {
        this._$target = $target;

        $('<p>')
        .attr('id', 'image_width')
        .attr('class', "ui-widget")
        .appendTo($target)
        ;
      },
      draw: function(message) {
        this._$target.find('#image_width')
        .text('Width: ' + message.imageData.width + '; Height: ' + message.imageData.height); 
        ; 
      }
    };
    // this._sourceDrawer is in charge of drawing source image in the page. 
    this._sourceDrawer = new OpenCV.ModulePanel("Source Image", "Source Image", SourceBuilder);
    

    this._sourceDrawer.attach($('#pane_holder'));

    this._selectedList.forEach(function(item) {
      item.attach($('#pane_holder'));
      }); 
  },

  init: function MS_init() {
    this._appendCombo();
  },

  _appendCombo: function MS_appendCombo() {
    var all = OpenCV.PipelineBuilder._moduleList;
    var selected = OpenCV.PipelineBuilder._selectedList;

    var $div = $("#module_selection");
    var $select = $("<select>")
      .appendTo($div)
      ;

    // Add a blink un-selectable option.
    //   <option selected disabled hidden value=''></option>
    $("<option>")
      .attr('selected', '')
      .attr('disabled', '')
      .attr('hidden', '')
      .attr('value', '')
      .appendTo($select)
      ;

    // Append modules which are not selectet yet.
    all.forEach(function (m) {
      if (-1 == selected.indexOf(m)) {
        $("<option>")
          .attr('value', m.name)
          .text(m.title)
          .appendTo($select)
          ;
        }
    })

    var self = this;
    $select
      .change(function() {
        $(this).find("option:selected").each(function(o) {
          var panel = $(this).attr('value') + 'Panel';
          selected.push(OpenCV[panel]);
          if (selected.length < all.length)
            self._appendCombo();
        });
      })
      ;
  }
};

OpenCV.MainCommandDispatcher = {
  _worker: null,

  init: function MCD_init() {
    this._worker = new Worker('js/opencv_worker.js');
    this._worker.onmessage = this.receiveMessage;
  },

  receiveMessage: function MCD_receiveMessage(e) {
    var aMessage = e.data;

    for (let key in aMessage) {
      if (aMessage.hasOwnProperty(key)) {

        OpenCV.PipelineBuilder._moduleList.every( (m) => {
          if (m.name === key) {
            m.draw(aMessage[key]);
            return false;
          }
          // Keep searching.    
          return true;
        })
      }
    }
  },

  setSourceImage: function ML_setSourceImage(imageData) {
    OpenCV.PipelineBuilder._sourceDrawer.draw({
      imageData: imageData
    });

    this._worker.postMessage({
      buffer: imageData.data.buffer,
      size: [imageData.width, imageData.height]
    }, [imageData.data.buffer]);
  },

  draw: function ML_draw(sendBuffer) {
    this._worker.postMessage({
      settings: JSON.stringify(OpenCV.PipelineBuilder._selectedList),
    });
  }
};

//OpenCV.Module.
$(function() {
  OpenCV.CodeSnippets.init();  
  OpenCV.MainCommandDispatcher.init();

  OpenCV.PipelineBuilder.init();

  $("#load_button")
    .button()
    .on("click", function(event) {
      $("#load_file_input").click(); 
    })
    ;

  $("#start_button")
    .button()
    .on("click", function(event) {
          OpenCV.PipelineBuilder.build();
          let imageData = OpenCV.ImageLoader.createImageData();
          OpenCV.MainCommandDispatcher.setSourceImage(imageData);
          OpenCV.MainCommandDispatcher.draw();
      // TBD
    })
    .button('disable')
    ;

  $("#load_file_input")
    .change(function(evt) {
      var file = evt.target.files[0];
      OpenCV.ImageLoader
        .load(file)
        .then(function() {
          $('#loaded_file').text(file.name);
          $("#start_button").button('enable');
        })
        ;
    })
    ;
});

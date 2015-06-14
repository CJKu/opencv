
QUnit.test("test_imgProc", function(assert) {
  // C++
  //   void calcHist(const Mat*, int, const int*, InputArray, OutputArray,
  //                 int, const int*, const float**, bool, bool)
  // Embind
  //   void calcHist(const Mat*, int, const int*, Mat &, Mat &,
  //                 int, uintptr_t, uintptr_t, bool, bool)
  {
    let histSize = 255;
    let source = Module.Mat.zeros(20, 20, Module.CV_8UC1);

    let hist = new Module.Mat();
    let mask = new Module.Mat();
    let binSize = Module._malloc(4);
    let binView = new Int32Array(Module.HEAP8.buffer, binSize);
    // Or, let binView = Module.HEAP32.subarray(binSize >> 2);
    binView[0] = 10;
    // TBD
    // float **: change this parameter to vector?
    Module.calcHist(source, 1, 0, mask, hist, 1, binSize, 0, true, false);

    // hist should contains a N X 1 arrary.
    let size = hist.size();
    assert.equal(size.size(), 2);
    assert.equal(size.get(0), 10);
    assert.equal(size.get(1), 1);

    // Do we need to verify data in histogram?
    let dataView = Module.HEAPU8.subarray(hist.data);

    // Free resource
    mask.delete();
    hist.delete();
    source.delete();
  }

  // C++
  //   void cvtColor(InputArray, OutputArray, int, int)
  // Embind
  //   void cvtColor(Mat &, Mat &, int, int);
  {
    let source = new Module.Mat(10, 10, Module.CV_8UC3);
    let dest = new Module.Mat();

    Module.cvtColor(source, dest, Module.CV_BGR2GRAY, 0);
    assert.equal(dest.channels(), 1);

    Module.cvtColor(source, dest, Module.CV_BGR2BGRA, 0);
    assert.equal(dest.channels(), 4);

    dest.delete();
    source.delete();
  }
  // C++
  //   void equalizeHist(InputArray, OutputArray);
  // Embind
  //   void equalizeHist(Mat &, Mat &);
  {
    let source = new Module.Mat(10, 10, Module.CV_8UC1);
    let dest = new Module.Mat();

    Module.equalizeHist(source, dest);

    // eualizeHist changes the content of a image, but does not alter meta data
    // of it.
    assert.equal(source.channels(), dest.channels());
    assert.equal(source.type(), dest.type());
    assert.equal(source.size().size(), dest.size().size());
    // Varifiy content>

    dest.delete();
    source.delete();
  }
});

QUnit.test("test_segmentation", function(assert) {
  const THRESHOLD = 127.0;
  const THRESHOLD_MAX = 210.0;

  // C++
  //   double threshold(InputArray, OutputArray, double, double, int)
  // Embind
  //   double threshold(Mat&, Mat&, double, double, int)
  {
    let source = new Module.Mat(1, 5, Module.CV_8UC1);
    let sourceView = Module.HEAPU8.subarray(source.data);
    sourceView[0] = 0;   // < threshold
    sourceView[1] = 100; // < threshold
    sourceView[2] = 200; // > threshold

    let dest = new Module.Mat();

    Module.threshold(source, dest, THRESHOLD, THRESHOLD_MAX, Module.THRESH_BINARY);

    let destView = Module.HEAPU8.subarray(dest.data);
    assert.equal(destView[0], 0);
    assert.equal(destView[1], 0);
    assert.equal(destView[2], THRESHOLD_MAX);
  }

  // C++
  //   void adaptiveThreshold(InputArray, OutputArray, double, int, int, int, double);
  // Embind
  //   void adaptiveThreshold(Mat &, Mat &, double, int, int, int, double);
  {
    let source = Module.Mat.zeros(1, 5, Module.CV_8UC1);
    let sourceView = Module.HEAPU8.subarray(source.data);
    sourceView[0] = 50;
    sourceView[1] = 150;
    sourceView[2] = 200;

    let dest = new Module.Mat();
    let C = 0;
    const block_size = 3;
    Module.adaptiveThreshold(source, dest, THRESHOLD_MAX,
        Module.CV_ADAPTIVE_THRESH_MEAN_C,
        Module.THRESH_BINARY, block_size, C);

    let destView = Module.HEAPU8.subarray(dest.data);
    assert.equal(destView[0], 0);
    assert.equal(destView[1], THRESHOLD_MAX);
    assert.equal(destView[2], THRESHOLD_MAX);
  }
});

QUnit.test("test_filter", function(assert) {
  // C++
  //   void blur(InputArray, OutputArray, Size ksize, Point, int);
  // Embind
  //   void blur(Mat &, Mat &, Size ksize, Point, int);
  {
      let mat1 = Module.Mat.ones(5, 5, Module.CV_8UC3);
      let mat2 = new Module.Mat();

      Module.blur(mat1, mat2, [3, 3], [-1, -1], Module.BORDER_DEFAULT);

      // Verify result.
      let view = Module.HEAPU8.subarray(mat2.data);
      let size = mat2.size();
      assert.equal(mat2.channels(), 3);
      assert.equal(size.get(0), 5);
      assert.equal(size.get(1), 5);
  }
  // C++
  //  void GaussianBlur(InputArray, OutputArray, Size, double, double, int);
  // Embind
  //  void GaussianBlur(Mat &, Mat&, Size, double, double, int);
  {
      let mat1 = Module.Mat.ones(7, 7, Module.CV_8UC1);
      let mat2 = new Module.Mat();

      Module.GaussianBlur(mat1, mat2, [3, 3], 0, 0, Module.BORDER_DEFAULT);

      // Verify result.
      let view = Module.HEAPU8.subarray(mat2.data);
      let size = mat2.size();
      assert.equal(mat2.channels(), 1);
      assert.equal(size.get(0), 7);
      assert.equal(size.get(1), 7);
  }
  
  // C++
  //   void medianBlur(InputArray, OutputArray, int);
  // Embind
  //   void medianBlur(Mat &, Mat &, int);
  {
      let mat1 = Module.Mat.ones(9, 9, Module.CV_8UC3);
      let mat2 = new Module.Mat();

      Module.medianBlur(mat1, mat2, 3);

      // Verify result.
      let view = Module.HEAPU8.subarray(mat2.data);
      let size = mat2.size();
      assert.equal(mat2.channels(), 3);
      assert.equal(size.get(0), 9);
      assert.equal(size.get(1), 9);
  }

  // C++
  //   void bilateralFilter(InputArray, OutputArray, int, double, double, int borderType);
  // Embind
  //   void bilateralFilter(Mat &, Mat &, int, double, double, int borderType);
  {
      let mat1 = Module.Mat.ones(11, 11, Module.CV_8UC3);
      let mat2 = new Module.Mat();

      Module.bilateralFilter(mat1, mat2, 3, 6, 1.5, Module.BORDER_DEFAULT);

      // Verify result.
      let view = Module.HEAPU8.subarray(mat2.data);
      let size = mat2.size();
      assert.equal(mat2.channels(), 3);
      assert.equal(size.get(0), 11);
      assert.equal(size.get(1), 11);

  }
});
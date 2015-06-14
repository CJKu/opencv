// Test all classes defined in mat.hpp
//
QUnit.test("test_mat_creation", function(assert) {
  // Mat constructors.
  // Mat::Mat(int rows, int cols, int type)
  {
    let mat = new Module.Mat(10, 20, Module.CV_8UC3);

    assert.equal(mat.type(), Module.CV_8UC3);
    assert.equal(mat.depth(), Module.CV_8U);
    assert.equal(mat.channels(), 3);
    assert.ok(mat.empty() === false);

    let size = mat.size();
    assert.ok(size.size() === 2);
    assert.equal(size.get(0), 10);
    assert.equal(size.get(1), 20);

    mat.delete();
  }

  // Mat::Mat(const Mat &)
  {
    //  : Copy from another Mat
    let mat1 = new Module.Mat(10, 20, Module.CV_8UC3);
    let mat2 = new Module.Mat(mat1);

    assert.equal(mat2.type(), mat1.type());
    assert.equal(mat2.depth(), mat1.depth());
    assert.equal(mat2.channels(), mat1.channels());
    assert.equal(mat2.empty(), mat1.empty());

    let size1 = mat1.size();
    let size2 = mat2.size();
    assert.ok(size1.size() === size2.size());
    assert.ok(size1.get(0) === size2.get(0));
    assert.ok(size1.get(1) === size2.get(1));

    mat1.delete();
    mat2.delete();
  }

  // Mat::Mat(Size size, int type, void *data, size_t step=AUTO_STEP)
  {
    // 10 * 10 and one channel
    let data = Module._malloc(10 * 10 * 1);
    let mat = new Module.Mat([10, 10], Module.CV_8UC1, data, Module.AUTO_STEP);

    assert.equal(mat.type(), Module.CV_8UC1);
    assert.equal(mat.depth(), Module.CV_8U);
    assert.equal(mat.channels(), 1);
    assert.ok(mat.empty() === false);

    let size = mat.size();
    assert.ok(size.size() === 2);
    assert.ok(size.get(0) === 10);
    assert.ok(size.get(1) === 10);

    mat.delete();
  }

  //  Mat::create(int, int, int)
  {
    let mat = new Module.Mat();
    mat.create(10, 5, Module.CV_8UC3);
    let size = mat.size();

    assert.ok(mat.type() === Module.CV_8UC3);
    assert.ok(size.get(0) === 10);
    assert.ok(size.get(1) === 5);
    assert.ok(mat.channels() === 3);

    mat.delete();
  }
  //  Mat::create(Size, int)
  {
    let mat = new Module.Mat();
    mat.create([10, 5], Module.CV_8UC4);
    let size = mat.size();

    assert.ok(mat.type() === Module.CV_8UC4);
    assert.ok(size.get(0) === 10);
    assert.ok(size.get(1) === 5);
    assert.ok(mat.channels() === 4);

    mat.delete();
  }
});

QUnit.skip("test_mat_matrix_expression", function(assert) {
  // Matrix operations: A and B are Matrix. S is scalar
  //  A + B
  //  A * C
  //  and so on....
  // We can't customize operator at javascript side.
  // How about replace "+" by add function, "-" by sub and so on.
});

QUnit.test("test_mat_ptr", function(assert) {
  const RValue = 3;
  const GValue = 7;
  const BValue = 197;

  // Module.CV_8UC1 + Mat::ptr(int).
  {
    let mat = new Module.Mat(10, 10, Module.CV_8UC1);
    let view = Module.HEAPU8.subarray(mat.data);

    // Alter matrix[2, 1].
    let step = 10;
    view[2 * step + 1] = RValue;

    // Access matrix[2, 1].
    view = Module.HEAPU8.subarray(mat.ptr(2));

    assert.equal(view[1], RValue);
  }

  // Module.CV_8UC3 + Mat::ptr(int).
  {
    let mat = new Module.Mat(10, 10, Module.CV_8UC3);
    let view = Module.HEAPU8.subarray(mat.data);

    // Alter matrix[2, 1].
    let step = 3 * 10;
    view[2 * step + 3] = RValue;
    view[2 * step + 3 + 1] = GValue;
    view[2 * step + 3 + 2] = BValue;

    // Access matrix[2, 1].
    view = Module.HEAPU8.subarray(mat.ptr(2));

    assert.equal(view[3], RValue);
    assert.equal(view[3 + 1], GValue);
    assert.equal(view[3 + 2], BValue);
  }

  // Module.CV_8UC3 + Mat::ptr(int, int).
  {
    let mat = new Module.Mat(10, 10, Module.CV_8UC3);
    let view = Module.HEAPU8.subarray(mat.data);

    // Alter matrix[2, 1].
    let step = 3 * 10;
    view[2 * step + 3] = RValue;
    view[2 * step + 3 + 1] = GValue;
    view[2 * step + 3 + 2] = BValue;

    // Access matrix[2, 1].
    view = Module.HEAPU8.subarray(mat.ptr(2, 1));

    assert.equal(view[0], RValue);
    assert.equal(view[1], GValue);
    assert.equal(view[2], BValue);
  }
});

QUnit.test("test_mat_zeros", function(assert) {
  // Mat::zeros(int, int, int)
  {
    let mat = Module.Mat.zeros(10, 10, Module.CV_8UC1);
    let view = Module.HEAPU8.subarray(mat.data);

    // TBD
    // Figurr out why array.prototype is undefined. Since that's undifined, I can't
    // use any array member function, such as every/forEach.
    //assert.ok(view.every(function(x) { return x === 0; }));

    var total = 0;
    for (let i = 0; i < 100; i++) {
      total += view[i];
    }

    assert.ok(total === 0);

    mat.delete();
  }

  // Mat::zeros(Size, int)
  {
    let mat = Module.Mat.zeros([10, 10], Module.CV_8UC1);
    let view = Module.HEAPU8.subarray(mat.data);

    var total = 0;
    for (let i = 0; i < 100; i++) {
      total += view[i];
    }

    assert.ok(total === 0);

    mat.delete();
  }
});

QUnit.test("test_mat_ones", function(assert) {
  // Mat::ones(int, int, int)
  {
    var mat = Module.Mat.ones(10, 10, Module.CV_8UC1);
    var view = Module.HEAPU8.subarray(mat.data);

    var total = 0;
    for (let i = 0; i < 100; i++) {
      total += view[i];
    }

    assert.ok(total === 100);
  }
  // Mat::ones(Size, int)
  {
    var mat = Module.Mat.ones([10, 10], Module.CV_8UC1);
    var view = Module.HEAPU8.subarray(mat.data);

    var total = 0;
    for (let i = 0; i < 100; i++) {
      total += view[i];
    }

    assert.ok(total === 100);
  }
});

QUnit.test("test_mat_eye", function(assert) {
  // Mat::eye(int, int, int)
  {
    var mat = Module.Mat.eye(10, 10, Module.CV_8UC1);
    var view = Module.HEAPU8.subarray(mat.data);

    var total = 0;
    for (let i = 0; i < 100; i++) {
      total += view[i];
    }

    assert.ok(total === 10);
  }

  // Mat::eye(Size, int)
  {
    var mat = Module.Mat.eye([10, 10], Module.CV_8UC1);
    var view = Module.HEAPU8.subarray(mat.data);

    var total = 0;
    for (let i = 0; i < 100; i++) {
      total += view[i];
    }

    assert.ok(total === 10);
  }
});

QUnit.test("test_mat_miscs", function(assert) {
  // Mat::col(int)
  {
    let mat = Module.Mat.ones(5, 5, Module.CV_8UC2);
    let col = mat.col(1);
    let view = Module.HEAPU8.subarray(col.data);
    assert.equal(view[0], 1);
    assert.equal(view[4], 1);

    col.delete();
    mat.delete();
  }

  // Mat::row(int)
  {
    let mat = Module.Mat.zeros(5, 5, Module.CV_8UC2);
    let row = mat.row(1);
    let view = Module.HEAPU8.subarray(row.data);
    assert.equal(view[0], 0);
    assert.equal(view[4], 0);

    row.delete();
    mat.delete();
  }

  // Mat::convertTo(Mat, int, double, double)
  {
    let mat = Module.Mat.ones(5, 5, Module.CV_8UC3);
    let grayMat = Module.Mat.zeros(5, 5, Module.CV_8UC1);

    mat.convertTo(grayMat, Module.CV_8U, 2, 1);
    // dest = 2 * source(x, y) + 1.
    let view = Module.HEAPU8.subarray(grayMat.data);
    assert.equal(view[0], (1 * 2) + 1);

    grayMat.delete();
    mat.delete();
  }

  // C++
  //   void split(InputArray, OutputArrayOfArrays)
  // Embind
  //   void split(VecotrMat, VectorMat)
  {
    const R =7;
    const G =13;
    const B =29;

    let mat = Module.Mat.ones(5, 5, Module.CV_8UC3);
    let view = Module.HEAPU8.subarray(mat.data);
    view[0] = R;
    view[1] = G;
    view[2] = B;

    let bgr_planes = new Module.VectorMat();
    Module.split(mat, bgr_planes);
    assert.equal(bgr_planes.size(), 3);

    let rMat = bgr_planes.get(0);
    view = Module.HEAPU8.subarray(rMat.data);
    assert.equal(view[0], R);

    let gMat = bgr_planes.get(1);
    view = Module.HEAPU8.subarray(gMat.data);
    assert.equal(view[0], G);

    let bMat = bgr_planes.get(2);
    view = Module.HEAPU8.subarray(bMat.data);
    assert.equal(view[0], B);

    mat.delete();
    rMat.delete();
    gMat.delete();
    bMat.delete();
  }

  // C++
  //   size_t Mat::elemSize() const
  {
    let mat = Module.Mat.ones(5, 5, Module.CV_8UC3);
    assert.equal(mat.elemSize(), 3);
    assert.equal(mat.elemSize1(), 1);

    let mat2 = Module.Mat.zeros(5, 5, Module.CV_8UC1);
    assert.equal(mat2.elemSize(), 1);
    assert.equal(mat2.elemSize1(), 1);

    let mat3 = Module.Mat.eye(5, 5, Module.CV_16UC3);
    assert.equal(mat3.elemSize(), 2 * 3);
    assert.equal(mat3.elemSize1(), 2);

    mat.delete();
    mat2.delete();
    mat3.delete();
  }
});

// Mat::zeros

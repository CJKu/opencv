QUnit.test("test_scalar", function(assert) {
	let s1 = new Module.Scalar(1, 2, 3, 4);
	let conj = s1.conj();

	assert.equal(conj.v0, s1.v0);
	assert.equal(conj.v1, -s1.v1);
	assert.equal(conj.v2, -s1.v2);
	assert.equal(conj.v3, -s1.v3);
	assert.equal(conj.isReal(), false);

	let s2 = new Module.Scalar();
	assert.equal(s2.isReal(), true);

	let s3 = new Module.Scalar(2, 0, -1, 0.5);
	let mul = s1.mul(s3, 2);
	assert.equal(mul.v0, s1.v0 * s3.v0 * 2);
	assert.equal(mul.v1, s1.v1 * s3.v1 * 2);
	assert.equal(mul.v2, s1.v2 * s3.v2 * 2);
	assert.equal(mul.v3, s1.v3 * s3.v3 * 2);


	s1.delete();
	s2.delete();
	s3.delete();
	conj.delete();
	mul.delete();
});

QUnit.test("test_core", function(assert) {
  // C++
  //  void addWeighted(InputArray, double, InputArray, double, double, OutputArray, int dtype = -1);
  // Embind
  //  void addWeighted(Mat&, double, Mat&, double, double, Mat&, int dtype = -1);
  {
	let mat1 = Module.Mat.zeros(2, 2, Module.CV_8UC1);
	let view1 = Module.HEAPU8.subarray(mat1.data);
	view1[0] = 2;
	view1[1] = 4;
	view1[2] = 6;
	view1[3] = 8;

	let mat2 = Module.Mat.zeros(2, 2, Module.CV_8UC1);
	let view2 = Module.HEAPU8.subarray(mat2.data);
	view1[0] = 22;
	view1[1] = 44;
	view1[2] = 66;
	view1[3] = 88;

    const alpha = 0.5;
    const beta = 0.5;
    const gamma = 1;
    // destView[0] = view1[0] * alpha + view2[0] * beta + gamma;
    let destMat = new Module.Mat(); 
	Module.addWeighted(mat1, alpha, mat2, beta, gamma, destMat, -1);
	let destView = Module.HEAPU8.subarray(destMat.data);

	for (let i = 0; i < 4; i++) {
	  assert.equal(destView[i], view1[i] * alpha + view2[i] * beta + gamma);
    }

	mat1.delete();
	mat2.delete();
	destMat.delete();
  }
});
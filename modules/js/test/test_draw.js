
QUnit.test("test_line", function(assert) {
  // Mat::Mat(int rows, int cols, int type);
  var mat = new Module.Mat(10, 10, Module.CV_8UC3);
  Module.line(mat, [0, 0], [9, 9], [0, 255, 0), 3);
});

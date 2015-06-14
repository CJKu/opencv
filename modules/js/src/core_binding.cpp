#include <emscripten/bind.h>
#include "opencv2/core.hpp"
#include "common.hpp"

using namespace emscripten;

static std::vector<int> Mat_getSize(const cv::Mat &mat)
{
  std::vector<int> size;
  for (int i = 0; i < mat.dims; i++) {
    size.push_back(mat.size[i]);
  }

  return size;
}

EMSCRIPTEN_BINDINGS(stl_wrappers) {
  register_vector<int>("VectorInt");
  register_vector<cv::Mat>("VectorMat");
}

EMSCRIPTEN_BINDINGS(ocv_matrix) {
  value_array<cv::Size>("Size")
  .element(&cv::Size::height)
  .element(&cv::Size::width)
  ;

  value_array<cv::Point>("Point")
  .element(&cv::Point::x)
  .element(&cv::Point::y)
  ;

  using BindScalarVal = EmbindWrapper<CORE_INDEX + 0, decltype(&cv::Matx<double, 4, 1>::val)>;
  BindScalarVal::bind(&cv::Scalar::val);
  class_<cv::Scalar>("Scalar")
  .constructor<>()
  .constructor<double>()
  .constructor<double, double, double, double>()
  .class_function("all", &cv::Scalar::all)
  .function("mul", &cv::Scalar::mul)    
  .function("conj", &cv::Scalar::conj)
  .function("isReal", &cv::Scalar::isReal)
  .property("v0", BindScalarVal::get<0>, BindScalarVal::set<0>)
  .property("v1", BindScalarVal::get<1>, BindScalarVal::set<1>)
  .property("v2", BindScalarVal::get<2>, BindScalarVal::set<2>)
  .property("v3", BindScalarVal::get<3>, BindScalarVal::set<3>)
  ;

#define BIND_FUNCTION(N, name, binded) \
  typedef EmbindWrapper<N, cv::MatExpr (*)(int, int, int)> name##_miii; \
  name##_miii::bind(&binded);

  BIND_FUNCTION(CORE_INDEX + 1, zeros, cv::Mat::zeros);
  BIND_FUNCTION(CORE_INDEX + 2, eye, cv::Mat::eye);
  BIND_FUNCTION(CORE_INDEX + 3, ones, cv::Mat::ones);
#undef BIND_FUNCTION

#define BIND_FUNCTION(N, name, binded) \
  typedef EmbindWrapper<N, cv::MatExpr (*)(cv::Size, int)> name##_msi; \
  name##_msi::bind(&binded);

  BIND_FUNCTION(CORE_INDEX + 4, zeros, cv::Mat::zeros);
  BIND_FUNCTION(CORE_INDEX + 5, eye, cv::Mat::eye);
  BIND_FUNCTION(CORE_INDEX + 6, ones, cv::Mat::ones);
#undef BIND_FUNCTION

  // TBD: export cv::MatExpr (*)(int, const int *, int) is mixup with
  // cv::MatExpr (*)(int, int, int)> for some unknown reason. Skip exporting
  // these API before I figure it out.
  /*
  #define BIND_FUNCTION(N, name, binded) \
  typedef EmbindWrapper<N, cv::MatExpr (*)(int, const int *, int)> name##_miipi; \
  name##_miipi::bind(&binded);

  BIND_FUNCTION(6, zeros, cv::Mat::zeros);
  BIND_FUNCTION(7, ones, cv::Mat::ones);
  BIND_FUNCTION(12, aaaa, aaaa);
  #undef BIND_FUNCTION
  */

  using BindMatPtrVPI = EmbindWrapper<CORE_INDEX + 8, void *(cv::Mat::*)(int)>;
  BindMatPtrVPI::bind(&cv::Mat::ptr);
  using BindMatPtrVPII = EmbindWrapper<CORE_INDEX + 9, void *(cv::Mat::*)(int, int)>;
  BindMatPtrVPII::bind(&cv::Mat::ptr);

  using BindConvertTo = EmbindWrapper<CORE_INDEX + 10, decltype(&cv::Mat::convertTo)>;
  BindConvertTo::bind(&cv::Mat::convertTo);
  // TBD:
  //   All manually bind call is a blocker of automated code generation.
  //   Find a rule to get rid of it!.
  using BindMatCreate = EmbindWrapper<CORE_INDEX + 11, cv::Mat *(*)(cv::Size, int, void*, size_t)>;
  BindMatCreate::bind([] (cv::Size size, int type, void *data, size_t step) {
    return new cv::Mat(size, type, data, step);
  });

  using BindMatData = EmbindWrapper<CORE_INDEX + 12, decltype(&cv::Mat::data)>;
  BindMatData::bind(&cv::Mat::data);

  class_<cv::Mat>("Mat")
    // Constructor && external creators.
  .constructor<>()
  .constructor<int, int, int>()
  .constructor<const cv::Mat&>()
  .constructor(&BindMatCreate::call)
    // Mat properties
  .function("type", &cv::Mat::type)
  .function("depth", &cv::Mat::depth)
  .function("channels", &cv::Mat::channels)
  .function("empty", &cv::Mat::empty)
  .function("size", &Mat_getSize)
    // data access
  .function("row", &cv::Mat::row)
  .function("col", &cv::Mat::row)
  .property("data", &BindMatData::get, &BindMatData::set)
    // We support Mat::ptr, but do not support Mat::at.
    // A user can use typed array to access element data with correct type.
  .function("ptr", &BindMatPtrVPI::call)
  .function("ptr", &BindMatPtrVPII::call)
  .function("create", select_overload<void (int, int, int)>(&cv::Mat::create))
  .function("create", select_overload<void (cv::Size, int)>(&cv::Mat::create))
    // Since we can't overwrite + operator at js side, we should return a matrix
    // instance, not MatExpr one, in exported eyes/ones/zeros
  .class_function("zeros", &zeros_miii::call)
  .class_function("ones", &ones_miii::call)
  .class_function("eye", &eye_miii::call)
  .class_function("zeros", &zeros_msi::call)
  .class_function("ones", &ones_msi::call)
  .class_function("eye", &eye_msi::call)
    // Misc
  .function("convertTo", &BindConvertTo::call)
  .function("elemSize", &cv::Mat::elemSize)
  .function("elemSize1", &cv::Mat::elemSize1)
  ;

  // Misc API.
  // void split(const Mat& src, Mat* mvbegin);
  // void split(InputArray m, OutputArrayOfArrays mv)
  using BindSplit = EmbindWrapper<CORE_INDEX + 20, void (*)(cv::Mat &, std::vector<cv::Mat> &)>;
  BindSplit::bind([] (cv::Mat &m, std::vector<cv::Mat> &mv) { cv::split(m, mv); });
  function("split", &BindSplit::call);

  // void addWeighted(InputArray, double, InputArray, double, double, OutputArray, int)
  using BindAddWeighted = EmbindWrapper<CORE_INDEX + 21, decltype(&cv::addWeighted)>;
  BindAddWeighted::bind(&cv::addWeighted);
  function("addWeighted", &BindAddWeighted::call);

  // CV_EXPORTS_W void transform(InputArray src, OutputArray dst, InputArray m );
  // CV_EXPORTS_W void perspectiveTransform(InputArray src, OutputArray dst, InputArray m );
  // CV_EXPORTS_W void normalize(InputArray, InputOutputArray, double, double,
  //   int, int, InputArray mask = noArray());
  // XXX: how to handl noArray(matrix.cpp)
  //using BindNormalize = EmbindWrapper<CORE_INDEX + 22, void (*)(cv::InputArray, cv::InputOutputArray, double, double, int, int)>;
  //BindNormalize::bind([] (cv::InputArray p1, cv::InputOutputArray p2, double p3, double p4, int p5, int p6) {
  //  cv::normalize(p1, p2, p3, p4, p5, p6); 
  //});
  //function("normalize", &BindNormalize::call);

  // CV_EXPORTS void normalize(const SparseMat&, SparseMat&, double, int);

  // constants.
  constant("CV_8UC1", CV_8UC1);
  constant("CV_8UC2", CV_8UC2);
  constant("CV_8UC3", CV_8UC3);
  constant("CV_8UC4", CV_8UC4);
  constant("CV_8SC1", CV_8SC1);
  constant("CV_8SC2", CV_8SC2);
  constant("CV_8SC3", CV_8SC3);
  constant("CV_8SC4", CV_8SC4);
  constant("CV_16UC1", CV_16UC1);
  constant("CV_16UC2", CV_16UC2);
  constant("CV_16UC3", CV_16UC3);
  constant("CV_16UC4", CV_16UC4);
  constant("CV_16SC1", CV_16SC1);
  constant("CV_16SC2", CV_16SC2);
  constant("CV_16SC3", CV_16SC3);
  constant("CV_16SC4", CV_16SC4);
  constant("CV_32SC1", CV_32SC1);
  constant("CV_32SC1", CV_32SC1);
  constant("CV_32SC2", CV_32SC2);
  constant("CV_32SC3", CV_32SC3);
  constant("CV_32SC4", CV_32SC4);
  constant("CV_32FC1", CV_32FC1);
  constant("CV_32FC2", CV_32FC2);
  constant("CV_32FC3", CV_32FC3);
  constant("CV_32FC4", CV_32FC4);
  constant("CV_64FC1", CV_64FC1);
  constant("CV_64FC2", CV_64FC2);
  constant("CV_64FC3", CV_64FC3);
  constant("CV_64FC4", CV_64FC4);
  constant("CV_8U", CV_8U);
  constant("CV_8S", CV_8S);
  constant("CV_16U", CV_16U);
  constant("CV_16S", CV_16S);
  constant("CV_32S", CV_32S);
  constant("CV_32F", CV_32F);
  constant("CV_64F", CV_64F);
  constant("AUTO_STEP", size_t(cv::Mat::AUTO_STEP));
  // XXX
  // A programmer may declare a parameter as integer type, instead of an enumeration
  // type. In C++, it's not a problem since we have implicit conversion.
  constant("BORDER_CONSTANT", +cv::BorderTypes::BORDER_CONSTANT);
  constant("BORDER_REPLICATE", +cv::BorderTypes::BORDER_REPLICATE);
  constant("BORDER_REFLECT", +cv::BorderTypes::BORDER_REFLECT);
  constant("BORDER_WRAP", +cv::BorderTypes::BORDER_WRAP);
  constant("BORDER_REFLECT_101", +cv::BorderTypes::BORDER_REFLECT_101);
  constant("BORDER_TRANSPARENT", +cv::BorderTypes::BORDER_TRANSPARENT);
  constant("BORDER_REFLECT101", +cv::BorderTypes::BORDER_REFLECT101);
  constant("BORDER_DEFAULT", +cv::BorderTypes::BORDER_DEFAULT);
  constant("BORDER_ISOLATED", +cv::BorderTypes::BORDER_ISOLATED);

  constant("NORM_INF", +cv::NormTypes::NORM_INF);
  constant("NORM_L1", +cv::NormTypes::NORM_L1);
  constant("NORM_L2", +cv::NormTypes::NORM_L2);
  constant("NORM_L2SQR", +cv::NormTypes::NORM_L2SQR);
  constant("NORM_HAMMING", +cv::NormTypes::NORM_HAMMING);
  constant("NORM_HAMMING2", +cv::NormTypes::NORM_HAMMING2);
  constant("NORM_TYPE_MASK", +cv::NormTypes::NORM_TYPE_MASK);
  constant("NORM_RELATIVE", +cv::NormTypes::NORM_RELATIVE);
  constant("NORM_MINMAX", +cv::NormTypes::NORM_MINMAX);
}
    /*
       Mat rowRange(int startrow, int endrow) const;
       Mat rowRange(const Range& r) const;
       Mat colRange(int startcol, int endcol) const;
       Mat colRange(const Range& r) const;
       static Mat diag(const Mat& d);
       Mat diag(int d=0) const;

       Mat clone() const;
       void copyTo( OutputArray m ) const;
       void copyTo( OutputArray m, InputArray mask ) const;
       void assignTo( Mat& m, int type=-1 ) const;
       Mat& operator = (const Scalar& s);
       Mat& setTo(InputArray value, InputArray mask=noArray());
       Mat reshape(int cn, int rows=0) const;
       Mat reshape(int cn, int newndims, const int* newsz) const;
       MatExpr t() const;
       MatExpr inv(int method=DECOMP_LU) const;
       MatExpr mul(InputArray m, double scale=1) const;
       Mat cross(InputArray m) const;
       double dot(InputArray m) const;
       void deallocate();
       void copySize(const Mat& m);
       void reserve(size_t sz);
       void resize(size_t sz);
       void resize(size_t sz, const Scalar& s);
       void push_back_(const void* elem);
       template<typename _Tp> void push_back(const _Tp& elem);
       template<typename _Tp> void push_back(const Mat_<_Tp>& elem);
       void push_back(const Mat& m);
       void pop_back(size_t nelems=1);
       void locateROI( Size& wholeSize, Point& ofs ) const;
       Mat& adjustROI( int dtop, int dbottom, int dleft, int dright );
       Mat operator()( Range rowRange, Range colRange ) const;
       Mat operator()( const Rect& roi ) const;
       Mat operator()( const Range* ranges ) const;
       template<typename _Tp> operator std::vector<_Tp>() const;
       template<typename _Tp, int n> operator Vec<_Tp, n>() const;
       template<typename _Tp, int m, int n> operator Matx<_Tp, m, n>() const;
       bool isContinuous() const;
       bool isSubmatrix() const;
       size_t elemSize() const;
       size_t elemSize1() const;
       size_t step1(int i=0) const;
       size_t total() const;
       int checkVector(int elemChannels, int depth=-1, bool requireContinuous=true) const;
       template<typename _Tp, typename Functor> void forEach(const Functor& operation);
       */
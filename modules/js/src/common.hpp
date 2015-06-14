#ifndef __JS_COMMON_HPP__
#define __JS_COMMON_HPP__

#ifndef __cplusplus
#  error common.hpp header must be compiled as C++
#endif

#include "opencv2/core/mat.hpp"
#include <functional>
#include <type_traits>

template <typename T>
struct ConversionTrait {
  typedef T Type;
};

// XXX:
// Embind doesn't support pointers to primitive types.
// https://github.com/kripken/emscripten/issues/612#issuecomment-18428394
template <typename T>
struct ConversionTrait<T *> {
  template <typename U, bool> struct Internal { typedef U *Type; };
  template <typename U> struct Internal<U, true>  { typedef uintptr_t Type; };

  typedef typename std::remove_cv<T>::type V;
  typedef typename Internal<T, std::is_fundamental<V>::value>::Type Type;
};
template <typename T>
struct ConversionTrait<T **> {
  template <typename U, bool> struct Internal { typedef U **Type; };
  template <typename U> struct Internal<U, true>  { typedef uintptr_t Type; };

  typedef typename std::remove_cv<T>::type V;
  typedef typename Internal<T, std::is_fundamental<V>::value>::Type Type;
};

// javascript does not allow overwrite arithmatic operators. Export MatExpr
// to js side is meaningless.
template <>
struct ConversionTrait<cv::MatExpr> {
  typedef cv::Mat Type;
};

template <>
struct ConversionTrait<cv::InputArray> {
  typedef cv::Mat & Type;
};

template <>
struct ConversionTrait<cv::OutputArray> {
  typedef cv::Mat & Type;
};

// Primary EmbindWrapper template.
template <int N, typename T, template <typename> class Trait = ConversionTrait>
struct EmbindWrapper;

// zero template parameter.
// Partial tempalte for member data getter/setter.
template <int N, template <typename> class Trait, typename C, typename R>
struct EmbindWrapper<N, R (C::*), Trait> {
  using DataSig = R (C::*);

  static void bind(DataSig f) { mF = f; }
  static typename Trait<R>::Type
  get(const C &obj)
  {
    return typename Trait<R>::Type((obj.*mF));
  }
  static void
  set(C &obj,
    typename Trait<R>::Type r)
  {
    obj.*mF = R(r);
  }

  static DataSig mF;
};

  template <int N, template <typename> class Trait, typename C, typename R>
typename EmbindWrapper<N, R (C::*), Trait>::DataSig
EmbindWrapper<N, R (C::*), Trait>::mF = nullptr;

// Partial template for array member data getter/setter.
template <int N, template <typename> class Trait, typename C, typename R, int ARRAY_SIZE>
struct EmbindWrapper<N, R (C::*)[ARRAY_SIZE], Trait> {
  using DataSig = R (C::*)[ARRAY_SIZE];

  static void bind(DataSig f) { mF = f; }
  template <int INDEX>
  static typename Trait<R>::Type
  get(const C &obj)
  {
    static_assert(INDEX < ARRAY_SIZE, "INDEX out or range.");
    return typename Trait<R>::Type((obj.*mF)[INDEX]);
  }

  template <int INDEX>
  static void
  set(C &obj,
    typename Trait<R>::Type r)
  {
    static_assert(INDEX < ARRAY_SIZE, "INDEX out of range.");
    (obj.*mF)[INDEX] = R(r);
  }

  static DataSig mF;
};

template <int N, template <typename> class Trait, typename C, typename R, int ARRAY_SIZE>
typename EmbindWrapper<N, R (C::*)[ARRAY_SIZE], Trait>::DataSig
EmbindWrapper<N, R (C::*)[ARRAY_SIZE], Trait>::mF = nullptr;

// one template parameter.
template <int N, template <typename> class Trait, typename C, typename R, typename P0>
struct EmbindWrapper<N, R (C::*)(P0), Trait> {
  using FunctionSig = R (C::*)(P0);

  static void bind(FunctionSig f) { mF = f; }
  static typename Trait<R>::Type
  call(C &obj,
    typename Trait<P0>::Type p0)
  {
    return typename Trait<R>::Type((obj.*mF)(P0(p0)));
  }

  static FunctionSig mF;
};

template <int N, template <typename> class Trait, typename C, typename R, typename P0>
typename EmbindWrapper<N, R (C::*)(P0), Trait>::FunctionSig
EmbindWrapper<N, R (C::*)(P0), Trait>::mF = nullptr;

template <int N, template <typename> class Trait, typename R, typename P0>
struct EmbindWrapper<N, R (*)(P0), Trait> {
  using FunctionSig = R (*)(P0);

  static void bind(FunctionSig f) { mF = f; }
  static typename Trait<R>::Type
  call(typename Trait<P0>::Type p0)
  {
    return typename Trait<R>::Type(mF(P0(p0)));
  }

  static FunctionSig mF;
};

template <int N, template <typename> class Trait, typename R, typename P0>
typename EmbindWrapper<N, R (*)(P0), Trait>::FunctionSig
EmbindWrapper<N, R (*)(P0), Trait>::mF = nullptr;

// two tempalte parameters.
template <int N, template <typename> class Trait, typename C, typename R, typename P0, typename P1>
struct EmbindWrapper<N, R (C::*)(P0, P1), Trait> {
  using FunctionSig = R (C::*)(P0, P1);

  static void bind(FunctionSig f) { mF = f; }
  static typename Trait<R>::Type
  call(C &obj,
    typename Trait<P0>::Type p0,
    typename Trait<P1>::Type p1)
  {
    return  typename Trait<R>::Type((obj.*mF)(P0(p0), P1(p1)));
  }

  static FunctionSig mF;
};

template <int N, template <typename> class Trait, typename C, typename R, typename P0, typename P1>
typename EmbindWrapper<N, R (C::*)(P0, P1), Trait>::FunctionSig
EmbindWrapper<N, R (C::*)(P0, P1), Trait>::mF = nullptr;

template <int N, template <typename> class Trait, typename R, typename P0, typename P1>
struct EmbindWrapper<N, R (*)(P0, P1), Trait> {
  using FunctionSig = R (*)(P0, P1);

  static void bind(FunctionSig f) { mF = f; }
  static typename Trait<R>::Type
  call(typename Trait<P0>::Type p0,
    typename Trait<P1>::Type p1)
  {
    return typename Trait<R>::Type(mF(P0(p0), P1(p1)));
  }

  static FunctionSig mF;
};

template <int N, template <typename> class Trait, typename R, typename P0, typename P1>
typename EmbindWrapper<N, R (*)(P0, P1), Trait>::FunctionSig
EmbindWrapper<N, R (*)(P0, P1), Trait>::mF = nullptr;

// three template parameters.
template <int N, template <typename> class Trait, typename R, typename P0, typename P1, typename P2>
struct EmbindWrapper<N, R (*)(P0, P1, P2), Trait> {
  using FunctionSig = R (*)(P0, P1, P2);

  static void bind(FunctionSig f) { mF = f; }
  static typename Trait<R>::Type
  call(typename Trait<P0>::Type p0,
    typename Trait<P1>::Type p1,
    typename Trait<P2>::Type p2)
  {
    return  typename Trait<R>::Type(mF(P0(p0), P1(p1), P2(p2)));
  }

  static FunctionSig mF;
};

template <int N, template <typename> class Trait, typename R, typename P0, typename P1, typename P2>
typename EmbindWrapper<N, R (*)(P0, P1, P2), Trait>::FunctionSig
EmbindWrapper<N, R (*)(P0, P1, P2), Trait>::mF = nullptr;

// 4 template parameters.
template <int N, template <typename> class Trait, typename R, typename P0, typename P1, typename P2, typename P3>
struct EmbindWrapper<N, R (*)(P0, P1, P2, P3), Trait> {
  using FunctionSig = R (*)(P0, P1, P2, P3);

  static void bind(FunctionSig f) { mF = f; }
  static typename Trait<R>::Type
  call(typename Trait<P0>::Type p0,
    typename Trait<P1>::Type p1,
    typename Trait<P2>::Type p2,
    typename Trait<P3>::Type p3)
  {
    return  typename Trait<R>::Type(mF(P0(p0), P1(p1), P2(p2), P3(p3)));
  }

  static FunctionSig mF;
};

template <int N, template <typename> class Trait, typename R, typename P0, typename P1, typename P2, typename P3>
typename EmbindWrapper<N, R (*)(P0, P1, P2, P3), Trait>::FunctionSig
EmbindWrapper<N, R (*)(P0, P1, P2, P3), Trait>::mF = nullptr;

template <int N, template <typename> class Trait, typename C, typename R, typename P0, typename P1, typename P2, typename P3>
struct EmbindWrapper<N, R (C::*)(P0, P1, P2, P3), Trait> {
  using FunctionSig = R (C::*)(P0, P1, P2, P3);

  static void bind(FunctionSig f) { mF = f; }
  static typename Trait<R>::Type
  call(C &obj,
    typename Trait<P0>::Type p0,
    typename Trait<P1>::Type p1,
    typename Trait<P2>::Type p2,
    typename Trait<P3>::Type p3)
  {
    return  typename Trait<R>::Type((obj.*mF)(P0(p0), P1(p1), P2(p2), P3(p3)));
  }

  static FunctionSig mF;
};

template <int N, template <typename> class Trait, typename C, typename R, typename P0, typename P1, typename P2, typename P3>
typename EmbindWrapper<N, R (C::*)(P0, P1, P2, P3), Trait>::FunctionSig
EmbindWrapper<N, R (C::*)(P0, P1, P2, P3), Trait>::mF = nullptr;

template <int N, template <typename> class Trait, typename C, typename R, typename P0, typename P1, typename P2, typename P3>
struct EmbindWrapper<N, R (C::*)(P0, P1, P2, P3) const, Trait> {
  using FunctionSig = R (C::*)(P0, P1, P2, P3) const;

  static void bind(FunctionSig f) { mF = f; }
  static typename Trait<R>::Type
  call(C &obj,
    typename Trait<P0>::Type p0,
    typename Trait<P1>::Type p1,
    typename Trait<P2>::Type p2,
    typename Trait<P3>::Type p3)
  {
    return  typename Trait<R>::Type((obj.*mF)(P0(p0), P1(p1), P2(p2), P3(p3)));
  }

  static FunctionSig mF;
};

template <int N, template <typename> class Trait, typename C, typename R, typename P0, typename P1, typename P2, typename P3>
typename EmbindWrapper<N, R (C::*)(P0, P1, P2, P3) const, Trait>::FunctionSig
EmbindWrapper<N, R (C::*)(P0, P1, P2, P3) const, Trait>::mF = nullptr;

// 5 template parameters.
template <int N, template <typename> class Trait, typename R, typename P0, typename P1, typename P2, typename P3, typename P4>
struct EmbindWrapper<N, R (*)(P0, P1, P2, P3, P4), Trait> {
  using FunctionSig = R (*)(P0, P1, P2, P3, P4);

  static void bind(FunctionSig f) { mF = f; }
  static typename Trait<R>::Type
  call(typename Trait<P0>::Type p0,
    typename Trait<P1>::Type p1,
    typename Trait<P2>::Type p2,
    typename Trait<P3>::Type p3,
    typename Trait<P4>::Type p4)
  {
    return  typename Trait<R>::Type(mF(P0(p0), P1(p1), P2(p2), P3(p3), P4(p4)));
  }

  static FunctionSig mF;
};

template <int N, template <typename> class Trait, typename R, typename P0, typename P1, typename P2, typename P3, typename P4>
typename EmbindWrapper<N, R (*)(P0, P1, P2, P3, P4), Trait>::FunctionSig
EmbindWrapper<N, R (*)(P0, P1, P2, P3, P4), Trait>::mF = nullptr;

// 6 params
template <int N, template <typename> class Trait, typename R, typename P0, typename P1, typename P2, typename P3, typename P4, typename P5>
struct EmbindWrapper<N, R (*)(P0, P1, P2, P3, P4, P5), Trait> {
  using FunctionSig = R (*)(P0, P1, P2, P3, P4, P5);

  static void bind(FunctionSig f) { mF = f; }
  static typename Trait<R>::Type
  call(typename Trait<P0>::Type p0,
    typename Trait<P1>::Type p1,
    typename Trait<P2>::Type p2,
    typename Trait<P3>::Type p3,
    typename Trait<P4>::Type p4,
    typename Trait<P5>::Type p5)
  {
    return  typename Trait<R>::Type(mF(P0(p0), P1(p1), P2(p2), P3(p3), P4(p4), P5(p5)));
  }

  static FunctionSig mF;
};

template <int N, template <typename> class Trait, typename R, typename P0, typename P1, typename P2, typename P3, typename P4, typename P5>
typename EmbindWrapper<N, R (*)(P0, P1, P2, P3, P4, P5), Trait>::FunctionSig
EmbindWrapper<N, R (*)(P0, P1, P2, P3, P4, P5), Trait>::mF = nullptr;

// 7 template parameters.
template <int N, template <typename> class Trait, typename R, typename P0, typename P1, typename P2, typename P3, typename P4, typename P5, typename P6>
struct EmbindWrapper<N, R (*)(P0, P1, P2, P3, P4, P5, P6), Trait> {
  using FunctionSig = R (*)(P0, P1, P2, P3, P4, P5, P6);

  static void bind(FunctionSig f) { mF = f; }
  static typename Trait<R>::Type
  call(typename Trait<P0>::Type p0,
    typename Trait<P1>::Type p1,
    typename Trait<P2>::Type p2,
    typename Trait<P3>::Type p3,
    typename Trait<P4>::Type p4,
    typename Trait<P5>::Type p5,
    typename Trait<P6>::Type p6)
  {
    return  typename Trait<R>::Type(mF(P0(p0), P1(p1), P2(p2), P3(p3), P4(p4), P5(p5), P6(p6)));
  }

  static FunctionSig mF;
};

template <int N, template <typename> class Trait, typename R, typename P0, typename P1, typename P2, typename P3, typename P4, typename P5, typename P6>
typename EmbindWrapper<N, R (*)(P0, P1, P2, P3, P4, P5, P6), Trait>::FunctionSig
EmbindWrapper<N, R (*)(P0, P1, P2, P3, P4, P5, P6), Trait>::mF = nullptr;

// 8 params
template <int N, template <typename> class Trait, typename R, typename P0, typename P1, typename P2, typename P3, typename P4, typename P5, typename P6, typename P7>
struct EmbindWrapper<N, R (*)(P0, P1, P2, P3, P4, P5, P6, P7), Trait> {
  using FunctionSig = R (*)(P0, P1, P2, P3, P4, P5, P6, P7);

  static void bind(FunctionSig f) { mF = f; }
  static typename Trait<R>::Type
  call(typename Trait<P0>::Type p0,
    typename Trait<P1>::Type p1,
    typename Trait<P2>::Type p2,
    typename Trait<P3>::Type p3,
    typename Trait<P4>::Type p4,
    typename Trait<P5>::Type p5,
    typename Trait<P6>::Type p6,
    typename Trait<P6>::Type p7)
  {
    return  typename Trait<R>::Type(mF(P0(p0), P1(p1), P2(p2), P3(p3), P4(p4), P5(p5), P6(p6), P7(p7)));
  }

  static FunctionSig mF;
};

template <int N, template <typename> class Trait, typename R, typename P0, typename P1, typename P2, typename P3, typename P4, typename P5, typename P6, typename P7>
typename EmbindWrapper<N, R (*)(P0, P1, P2, P3, P4, P5, P6, P7), Trait>::FunctionSig
EmbindWrapper<N, R (*)(P0, P1, P2, P3, P4, P5, P6, P7), Trait>::mF = nullptr;

// 10 template parameters.
template <int N, template <typename> class Trait, typename R, typename P0, typename P1, typename P2, typename P3, typename P4, typename P5, typename P6, typename P7, typename P8, typename P9>
struct EmbindWrapper<N, R (*)(P0, P1, P2, P3, P4, P5, P6, P7, P8, P9), Trait> {
  using FunctionSig = R (*)(P0, P1, P2, P3, P4, P5, P6, P7, P8, P9);

  static void bind(FunctionSig f) { mF = f; }
  static typename Trait<R>::Type
  call(typename Trait<P0>::Type p0,
    typename Trait<P1>::Type p1,
    typename Trait<P2>::Type p2,
    typename Trait<P3>::Type p3,
    typename Trait<P4>::Type p4,
    typename Trait<P5>::Type p5,
    typename Trait<P6>::Type p6,
    typename Trait<P7>::Type p7,
    typename Trait<P8>::Type p8,
    typename Trait<P9>::Type p9)
  {
    return  typename Trait<R>::Type(mF(P0(p0), P1(p1), P2(p2), P3(p3), P4(p4), P5(p5), P6(p6), P7(p7), P8(p8), P9(p9)));
  }

  static FunctionSig mF;
};

template <int N, template <typename> class Trait, typename R, typename P0, typename P1, typename P2, typename P3, typename P4, typename P5, typename P6, typename P7, typename P8, typename P9>
typename EmbindWrapper<N, R (*)(P0, P1, P2, P3, P4, P5, P6, P7, P8, P9), Trait>::FunctionSig
EmbindWrapper<N, R (*)(P0, P1, P2, P3, P4, P5, P6, P7, P8, P9), Trait>::mF = nullptr;

const int CORE_INDEX = 0;
const int IMGPROC_INDEX = 100;

#endif

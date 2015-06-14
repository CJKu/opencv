add_definitions(-D__OPENCV_BUILD=1)

if(NOT OPENCV_MODULES_PATH)
  set(OPENCV_MODULES_PATH "${CMAKE_CURRENT_SOURCE_DIR}")
endif()

# Include emscripten headers.
include_directories(BEFORE "${OpenCV_SOURCE_DIR}/3rdparty/include/emscripten")

ocv_glob_modules(${OPENCV_MODULES_PATH} EXTRA ${OPENCV_EXTRA_MODULES_PATH})

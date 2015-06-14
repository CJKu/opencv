# Disable js module without emscripten supporting.
if(NOT DEFINED ENV{EMSCRIPTEN_TOOLS})
  ocv_module_disable(js)
endif()

set(the_description "Javascript bindings")
set(ENSCRIPTEN_INCLUDE_PATH "${OpenCV_SOURCE_DIR}/3rdparty/include/emscripten")

# c++11 is require for compiling embinding code, such as binder.h.
set(CMAKE_CXX_FLAGS  "${CMAKE_CXX_FLAGS} -std=c++11")

# dependency white list.
set(candidate_deps "")
list(APPEND candidate_deps "opencv_core")
list(APPEND candidate_deps "opencv_imgproc")
ocv_add_module(js BINDINGS ${candidate_deps})

ocv_glob_module_sources()
ocv_module_include_directories(${the_module} ${ENSCRIPTEN_INCLUDE_PATH})
ocv_create_module()

# Build javascript library after opencv_js constructed.
set(my_output ${LIBRARY_OUTPUT_PATH}/opencv.js)
set(my_sources ${LIBRARY_OUTPUT_PATH}/libopencv_core.so)
set(my_sources ${my_sources} ${LIBRARY_OUTPUT_PATH}/libopencv_imgproc.so)
set(my_sources ${my_sources} ${LIBRARY_OUTPUT_PATH}/libopencv_js.so)
add_custom_command(
    TARGET ${the_module} POST_BUILD
    COMMAND echo "* js library building... Be patient, it may take more than 30 seconds."
    COMMAND emcc ${my_sources} -s DISABLE_EXCEPTION_CATCHING=0 --bind --llvm-lto 1 --closure 1 -s PRECISE_F32=1 -s FORCE_ALIGNED_MEMORY=1 -s TOTAL_MEMORY=318767104 -o ${my_output}
)

# I still have no idea on how testing work in build process.
# Temporary cp all qunit test case and opencv.js to an isolated folder.
add_custom_command(
    TARGET ${the_module} POST_BUILD
    COMMAND echo "Copy js test cases and opencv.js into ./js_test"
    COMMAND mkdir -p ${CMAKE_BINARY_DIR}/js_test
    COMMAND cp -R ${OpenCV_SOURCE_DIR}/modules/js/test/* ${CMAKE_BINARY_DIR}/js_test
    COMMAND cp ${LIBRARY_OUTPUT_PATH}/opencv.* ${CMAKE_BINARY_DIR}/js_test
)

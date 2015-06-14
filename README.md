# OpenCV with Emscripten
In this branch, we are going to combine opencv with emscripten to enable opencv's rich features in javascript's world.

We are going to

1. Export Mat by Embinding. (Working)
2. Export the first layer modules by Embinding.

## Setup Emscripten
[Emscripten installation guide from Emscripten.org](http://kripken.github.io/emscripten-site/docs/getting_started/downloads.html)

Version 1.29 and above is recommended for better performance.

## Compile

<pre>
At the root folder of opencv source code.
$ mkdir jsobj
$ cd jsobj
$ emcmake cmake ..
$ emmake make
</pre>

You will find opencv.js in ${jsobj}/lib folder. By Including this js library in HTML or require it in js, you can start using opencv.

## Run
You may use opencv.js in firefox/ chrome or node.js.

In node.js
<pre>
$ node
> var Module = require('./opencv.js');
> var mat = new Module.Mat(10, 10, Module.CV_8UC3)
> mat.channels()
3
</pre>

## Test
JS test suite is put in module/js/test. There are many tests in test suite, and those tests are good reference of how to using opencv module by javascript.

## Sample
I am constructing a js app, in sample/js folder, which demostrate the usage of image-proc module. 

## Next step
1. Automatic binding code generator. I don't want to manually generate bind code for each function that we want to export onto javascript. 
2. Matrix operation.(MatExpr)

"use strict";

var gl;
var image;
var texCoords = [
  vec2(0.0,  0.0),
  vec2(1.0,  0.0),
  vec2(0.0,  1.0),
  vec2(0.0,  1.0),
  vec2(1.0,  0.0),
  vec2(1.0,  1.0)
];

var kernels = {
  original: [
       0, 0, 0,
       0, 1, 0,
       0, 0, 0],
  edgeDetection1: [
       0, -1,  0,
      -1,  4, -1,
       0, -1,  0],
  edgeDetection2: [
      -1, -1, -1,
      -1,  8, -1,
      -1, -1, -1],
  sharpen1: [
       0, -1,  0,
      -1,  5, -1,
       0, -1,  0],
  sharpen2: [
      -1, -1, -1,
      -1,  9, -1,
      -1, -1, -1],
  blur: [
       0.0625, 0.125, 0.0625,
       0.1250, 0.250, 0.1250,
       0.0625, 0.125, 0.0625],
  roberts: [
       0,  0, 0,
       1, -1, 0,
       0,  0, 0],
  embos1: [
      -2, -1, 0,
      -1,  1, 1,
       0,  1, 2],
  embos2: [
       2,  1,  0,
       1,  1, -1,
       0, -1, -2]
};

var filter = kernels["original"];
var fKernel;


window.onload = function load() {
  image = new Image();
  image.src="img.png";
  image.onload = function() {
    init();
  };
};

function init() {
  var canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) { alert("WebGL isn't available"); }

  gl.viewport( 0, 0, canvas.width, canvas.height );
  gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

  var program = initShaders( gl, "vertex-shader", "fragment-shader" );
  gl.useProgram( program );

  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  setRectangle(0, 0, image.width, image.height);
  var vPosition = gl.getAttribLocation( program, "vPosition" );
  gl.enableVertexAttribArray( vPosition );
  gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );

  var texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW);
  var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
  gl.enableVertexAttribArray( vTexCoord );
  gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );

  // Create a texture.
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
 
  // Set the parameters so we can render any size image.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
 
  // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  var vTexSize = gl.getUniformLocation(program, "vTexSize");
  gl.uniform2f(vTexSize, canvas.width, canvas.height);

  fKernel = gl.getUniformLocation(program, "fKernel");

  document.getElementById("filters").onchange = function (event) { 
    console.log(event.target.value);
    filter = kernels[event.target.value];
    render();
  };


  render();
}

function setRectangle(x, y, width, height) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  var points = [
    vec2(x1, y1),
    vec2(x2, y1),
    vec2(x1, y2),
    vec2(x1, y2),
    vec2(x2, y1),
    vec2(x2, y2)
  ];
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
}

function render() {
  gl.clear( gl.COLOR_BUFFER_BIT );
  gl.uniform1fv(fKernel, filter);
  gl.drawArrays( gl.TRIANGLES, 0, 6 );
}

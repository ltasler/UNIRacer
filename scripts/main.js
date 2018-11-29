// Global variable definition
var gl;
var shaderProgram;

// Buffers
var pyramidVertexPositionBuffer;
var pyramidVertexColorBuffer;
var cubeVertexPositionBuffer;
var cubeVertexColorBuffer;
var cubeVertexIndexBuffer;

// Model-view and projection matrix and model-view matrix stack
var mvMatrixStack = [];
var mvMatrix = mat4.create();
var pMatrix = mat4.create();

// Variables for storing curent rotation of pyramid and cube
var rotationPyramid = 0;
var rotationCube = 0;

// Helper variable for animation
var lastTime = 0;

var currentlyPressedKeys = {};

// Ze Car
var car = new Car();

//
// Matrix utility functions
//
// mvPush   ... push current matrix on matrix stack
// mvPop    ... pop top matrix from stack
// degToRad ... convert degrees to radians
//
function mvPushMatrix() {
	var copy = mat4.create();
	mat4.set(mvMatrix, copy);
	mvMatrixStack.push(copy);
}

function mvPopMatrix() {
	if (mvMatrixStack.length == 0) {
		throw 'Invalid popMatrix!';
	}
	mvMatrix = mvMatrixStack.pop();
}

function degToRad(degrees) {
	return degrees * Math.PI / 180;
}

//
// setMatrixUniforms
//
// Set the uniform values in shaders for model-view and projection matrix.
//
function setMatrixUniforms() {
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we have
// two objecta -- a simple cube and pyramidß.
//
function initBuffers() {
	// PYRAMID
	// Create a buffer for the pyramid's vertices.
	pyramidVertexPositionBuffer = gl.createBuffer();

	// Select the pyramidVertexPositionBuffer as the one to apply vertex
	// operations to from here out.
	gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);
	var vertices = [
		// Front face
		0.0, 1.0, 0.0,
		-1.0, -1.0, 1.0,
		1.0, -1.0, 1.0,
		// Right face
		0.0, 1.0, 0.0,
		1.0, -1.0, 1.0,
		1.0, -1.0, -1.0,
		// Back face
		0.0, 1.0, 0.0,
		1.0, -1.0, -1.0,
		-1.0, -1.0, -1.0,
		// Left face
		0.0, 1.0, 0.0,
		-1.0, -1.0, -1.0,
		-1.0, -1.0, 1.0
	];

	// Pass the list of vertices into WebGL to build the shape. We
	// do this by creating a Float32Array from the JavaScript array,
	// then use it to fill the current vertex buffer.
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	pyramidVertexPositionBuffer.itemSize = 3;
	pyramidVertexPositionBuffer.numItems = 12;

	// Now set up the colors for the vertices
	pyramidVertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer);
	var colors = [
		// Front face
		1.0, 0.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 1.0,
		// Right face
		1.0, 0.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		// Back face
		1.0, 0.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 1.0,
		// Left face
		1.0, 0.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 1.0,
		0.0, 1.0, 0.0, 1.0
	];

	// Pass the colors into WebGL
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	pyramidVertexColorBuffer.itemSize = 4;
	pyramidVertexColorBuffer.numItems = 3;

	// CUBE
	// Create a buffer for the cube's vertices.
	cubeVertexPositionBuffer = gl.createBuffer();

	// Select the cubeVertexPositionBuffer as the one to apply vertex
	// operations to from here out.
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);

	// Now create an array of vertices for the cube.
	vertices = [
		// Front face
		-1.0, -1.0, 1.0,
		1.0, -1.0, 1.0,
		1.0, 1.0, 1.0,
		-1.0, 1.0, 1.0,

		// Back face
		-1.0, -1.0, -1.0,
		-1.0, 1.0, -1.0,
		1.0, 1.0, -1.0,
		1.0, -1.0, -1.0,

		// Top face
		-1.0, 1.0, -1.0,
		-1.0, 1.0, 1.0,
		1.0, 1.0, 1.0,
		1.0, 1.0, -1.0,

		// Bottom face
		-1.0, -1.0, -1.0,
		1.0, -1.0, -1.0,
		1.0, -1.0, 1.0,
		-1.0, -1.0, 1.0,

		// Right face
		1.0, -1.0, -1.0,
		1.0, 1.0, -1.0,
		1.0, 1.0, 1.0,
		1.0, -1.0, 1.0,

		// Left face
		-1.0, -1.0, -1.0,
		-1.0, -1.0, 1.0,
		-1.0, 1.0, 1.0,
		-1.0, 1.0, -1.0
	];

	// Now pass the list of vertices into WebGL to build the shape. We
	// do this by creating a Float32Array from the JavaScript array,
	// then use it to fill the current vertex buffer.
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	cubeVertexPositionBuffer.itemSize = 3;
	cubeVertexPositionBuffer.numItems = 24;

	// Now set up the colors for the vertices. We'll use solid colors
	// for each face.
	cubeVertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
	colors = [
		[1.0, 0.0, 0.0, 1.0], // Front face
		[1.0, 1.0, 0.0, 1.0], // Back face
		[0.0, 1.0, 0.0, 1.0], // Top face
		[1.0, 0.5, 0.5, 1.0], // Bottom face
		[1.0, 0.0, 1.0, 1.0], // Right face
		[0.0, 0.0, 1.0, 1.0]  // Left face
	];

	// Convert the array of colors into a table for all the vertices.
	var unpackedColors = [];
	for (var i in colors) {
		var color = colors[i];

		// Repeat each color four times for the four vertices of the face
		for (var j = 0; j < 4; j++) {
			unpackedColors = unpackedColors.concat(color);
		}
	}

	// Pass the colors into WebGL
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedColors), gl.STATIC_DRAW);
	cubeVertexColorBuffer.itemSize = 4;
	cubeVertexColorBuffer.numItems = 24;

	// Build the element array buffer; this specifies the indices
	// into the vertex array for each face's vertices.
	cubeVertexIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);

	// This array defines each face as two triangles, using the
	// indices into the vertex array to specify each triangle's
	// position.
	var cubeVertexIndices = [
		0, 1, 2, 0, 2, 3,    // Front face
		4, 5, 6, 4, 6, 7,    // Back face
		8, 9, 10, 8, 10, 11,  // Top face
		12, 13, 14, 12, 14, 15, // Bottom face
		16, 17, 18, 16, 18, 19, // Right face
		20, 21, 22, 20, 22, 23  // Left face
	];

	// Now send the element array to GL
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
	cubeVertexIndexBuffer.itemSize = 1;
	cubeVertexIndexBuffer.numItems = 36;
}

//
// drawScene
//
// Draw the scene.
//
function drawScene() {
	// set the rendering environment to full canvas size
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	// Clear the canvas before we start drawing on it.
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Establish the perspective with which we want to view the
	// scene. Our field of view is 45 degrees, with a width/height
	// ratio and we only want to see objects between 0.1 units
	// and 100 units away from the camera.
	mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

	// Set the drawing position to the "identity" point, which is
	// the center of the scene.
	mat4.identity(mvMatrix);

	// PYRAMID:

	// Now move the drawing position a bit to where we want to start
	// drawing the pyramid.
	mat4.translate(mvMatrix, [-1.5, 0.0, -7.0]);

	// Save the current matrix, then rotate before we draw.
	mvPushMatrix();
	mat4.rotate(mvMatrix, degToRad(rotationPyramid), [0, 1, 0]);

	// Draw the pyramid by binding the array buffer to the cube's vertices
	// array, setting attributes, and pushing it to GL.
	gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, pyramidVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// Set the colors attribute for the vertices.
	gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, pyramidVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// Draw the pyramid.
	setMatrixUniforms();
	gl.drawArrays(gl.TRIANGLES, 0, pyramidVertexPositionBuffer.numItems);

	// Restore the original matrix
	mvPopMatrix();


	// CUBE:

	// Now move the drawing position a bit to where we want to start
	// drawing the cube.
	mvPushMatrix();
	mvMatrix = car.getMvMatrix();

	// Draw the cube by binding the array buffer to the cube's vertices
	// array, setting attributes, and pushing it to GL.
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// Set the colors attribute for the vertices.
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, cubeVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);

	// Draw the cube.
	setMatrixUniforms();
	gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

	// Restore the original matrix
	mvPopMatrix();
}


function update() {
	var timeNow = new Date().getTime();
	if (lastTime !== 0) {
		var elapsed = (timeNow - lastTime) / 1000.0;

		//legacy stuff
		rotationPyramid += (90 * elapsed);

		if (currentlyPressedKeys[87] || currentlyPressedKeys[38])  // W || ArrowUp
			car.accelerate(elapsed);
		if (currentlyPressedKeys[83] || currentlyPressedKeys[40])  // S || ArrowDown
			car.brake(elapsed);
		if (currentlyPressedKeys[65] || currentlyPressedKeys[37])  // A || LeftArrow
			car.rotate(-1, elapsed);
		if (currentlyPressedKeys[68] || currentlyPressedKeys[39])  // D || RightArrow
			car.rotate(1, elapsed);
		car.update(elapsed);

	}
	lastTime = timeNow;
}


//
// start
//
// Called when the canvas is created to get the ball rolling.
//
function main() {
	var canvas = document.getElementById('glcanvas');

	gl = initGL(canvas);      // Initialize the GL context

	// Only continue if WebGL is available and working
	if (gl) {
		gl.clearColor(0.0, 0.0, 0.0, 1.0);                      // Set clear color to black, fully opaque
		gl.clearDepth(1.0);                                     // Clear everything
		gl.enable(gl.DEPTH_TEST);                               // Enable depth testing
		gl.depthFunc(gl.LEQUAL);                                // Near things obscure far things

		// Initialize the shaders; this is where all the lighting for the
		// vertices and so forth is established.
		shaderProgram = initShaders();

		// Here's where we call the routine that builds all the objects
		// we'll be drawing.
		initBuffers();

		// Bind keyboard handling functions to document handlers
		document.onkeydown = function (event) {
			currentlyPressedKeys[event.keyCode] = true;
		};
		document.onkeyup = function(event) {
			currentlyPressedKeys[event.keyCode] = false;
		};

		// Set up to draw the scene periodically.
		setInterval(function () {
			//requestAnimationFrame(animate);
			update();
			drawScene();
		}, 15);
	}
}
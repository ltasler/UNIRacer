// Global variable definition
var gl;
var shaderProgram;

// Model-view and projection matrix and model-view matrix stack
var mvMatrixStack = [];
var mvMatrix = mat4.create();
var pMatrix = mat4.create();

// Helper variable for animation
var lastTime = 0;

var currentlyPressedKeys = {};

// Ze Car
var car = new Car();

// List of meshes and buffers
var meshes = {};
var loadedMeshes = 0;

// Number of all assets
const NUM_ASSETS = 1;

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

function loadAsset(path) {
	var request = new XMLHttpRequest();
	request.open('GET', path);
	request.onreadystatechange = function () {
		if (request.readyState === 4) {
			mesh = new OBJ.Mesh(request.response);
			OBJ.initMeshBuffers(gl, mesh);
			loadedMeshes++;
		}
	};
	request.send();
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

	// CUBE:

	// Now move the drawing position a bit to where we want to start
	// drawing the cube.
	mvPushMatrix();
	mat4.identity(mvMatrix);
	mat4.translate(mvMatrix, [0, 0, -10]);

	gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, mesh.vertexBuffer.itemSize,
		gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
	setMatrixUniforms();
	gl.drawElements(gl.TRIANGLES, mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

	// Restore the original matrix
	mvPopMatrix();
}


function update() {
	var timeNow = new Date().getTime();
	if (lastTime !== 0) {
		var elapsed = (timeNow - lastTime) / 1000.0;

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

var mesh;
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

		loadAsset(ASSETS_PATH + '/' + LOWPOLY_CART.model_path);

		// Bind keyboard handling functions to document handlers
		document.onkeydown = function (event) {
			currentlyPressedKeys[event.keyCode] = true;
		};
		document.onkeyup = function (event) {
			currentlyPressedKeys[event.keyCode] = false;
		};
		// Set up to draw the scene periodically.
		setInterval(function () {
			if (NUM_ASSETS <= loadedMeshes) {
				update();
				drawScene();
			}
		}, 15);
	}
}
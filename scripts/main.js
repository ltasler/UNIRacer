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
const NUM_ASSETS = 2;

const CAMERA_OFFSET = [0, -2.5, -10];
const CAMERA_ROTATION_X = 30;

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


//
// setMatrixUniforms
//
// Set the uniform values in shaders for model-view and projection matrix.
//
function setMatrixUniforms() {
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

function loadAsset(asset) {
	var request = new XMLHttpRequest();
	request.open('GET', getAssetPath(asset));
	request.onreadystatechange = function () {
		if (request.readyState === 4) {
			meshes[asset.name] = new OBJ.Mesh(request.response);
			OBJ.initMeshBuffers(gl, meshes[asset.name]);
			loadedMeshes++;
		}
	};
	request.send();
}

//<editor-fold> Drawing the scene
//
// drawScene
//
// Draw the scene.
//
function drawScene() {
	setPerspective();

	mat4.identity(mvMatrix);
	mat4.translate(mvMatrix, CAMERA_OFFSET);
	mat4.rotateX(mvMatrix, degToRad(CAMERA_ROTATION_X);

	// lowpoly Kart rendering
	mvPushMatrix();
	var m = meshes[LOWPOLY_CART.name];
	renderObject(m.vertexBuffer, m.indexBuffer);
	mvPopMatrix();

	var carMvMatrixInv = car.getInverseMvMatrix();

	mvPushMatrix();
	m = meshes[PLANE.name];
	mat4.translate(mvMatrix, [0, -1.5, 0]);
	mat4.multiply(mvMatrix, carMvMatrixInv);
	renderObject(m.vertexBuffer, m.indexBuffer);
	mvPopMatrix();
}

function renderObject(vertexBuffer, indexBuffer) {
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, vertexBuffer.itemSize,
		gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	setMatrixUniforms();
	gl.drawElements(gl.TRIANGLES, indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

function setPerspective() {
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
}

//</editor-fold>


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

		loadAsset(LOWPOLY_CART);
		loadAsset(PLANE);

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
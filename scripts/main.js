// Global variable definition
var gl;
var shaderProgram;

// Model-view and projection matrix
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
var models = {};

const CAMERA_OFFSET = [0, -2.5, -10];

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

	var normalMatrix = mat3.create();
	//mat3.normalFromMat4(normalMatrix, mvMatrix); TODO: Check it out, novo verzijo glMatrix
	mat3.identity(normalMatrix);
	gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
}

function initBuffers() {
	var layout = new OBJ.Layout(
		OBJ.Layout.POSITION,
		OBJ.Layout.NORMAL,
		OBJ.Layout.DIFFUSE,
		OBJ.Layout.UV,
		OBJ.Layout.SPECULAR,
		OBJ.Layout.SPECULAR_EXPONENT
	);

	// initialize the mesh's buffers
	for (var mesh in meshes) {
		// Create the vertex buffer for this mesh
		var vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		var vertexData = meshes[mesh].makeBufferData(layout);
		gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
		vertexBuffer.numItems = vertexData.numItems;
		vertexBuffer.layout = layout;
		meshes[mesh].vertexBuffer = vertexBuffer;

		// Create the index buffer for this mesh
		var indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
		var indexData = meshes[mesh].makeIndexBufferData();
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData, gl.STATIC_DRAW);
		indexBuffer.numItems = indexData.numItems;
		meshes[mesh].indexBuffer = indexBuffer;

		// this loops through the mesh names and creates new
		// model objects and setting their mesh to the current mesh
		models[mesh] = {};
		models[mesh].mesh = meshes[mesh];
	}
}

//<editor-fold> Drawing the scene
function createMvMatrix(translateMatrix, rotationMatrix, scaleMatrix) {
	if (!translateMatrix) {
		translateMatrix = mat4.create();
		mat4.identity(translateMatrix);
	}
	if (!rotationMatrix) {
		rotationMatrix = mat4.create();
		mat4.identity(rotationMatrix);
	}
	if (!scaleMatrix) {
		scaleMatrix = mat4.create();
		mat4.identity(scaleMatrix);
	}

	var mvMatrix = mat4.create();
	mat4.identity(mvMatrix);

	mat4.multiply(mvMatrix, translateMatrix);
	mat4.multiply(mvMatrix, rotationMatrix);
	mat4.multiply(mvMatrix, scaleMatrix);

	return mvMatrix;
}

function createInverseMvMatrix(translateMatrix, rotationMatrix) {
	var a = createMvMatrix(translateMatrix, rotationMatrix);
	mat4.inverse(a);
	return a;
}

function createScaleMatrix(x) {
	x = [x, x, x, x]; //Yaradi tega kako dela mat
	var a = mat4.create();
	mat4.identity(a);
	mat4.scale(a, x);
	return a;
}

//
// drawScene
//
// Draw the scene.
//
function drawScene() {
	setPerspective();

	mat4.identity(mvMatrix);
	mat4.translate(mvMatrix, CAMERA_OFFSET);

	var carTranslateMatrix = car.getTranslateMatrix([0, 0, 0]);
	var carRotationMatrix = car.getRotationMatrix();

	var invCarTranslateMatrix = mat4.create(carTranslateMatrix);
	mat4.inverse(invCarTranslateMatrix);
	var invCarRotationMatrix = mat4.create(carRotationMatrix);
	mat4.inverse(invCarRotationMatrix);

	// lowpoly Kart rendering
	mvPushMatrix();
	//mat4.multiply(mvMatrix, createMvMatrix(carTranslateMatrix, carRotationMatrix, createScaleMatrix(1)));
	var m = models[LOWPOLY_CART.name];
	renderObject(m);
	mvPopMatrix();


	mat4.translate(mvMatrix, [0, -0.55, 0]);
	//drawing the track
	mvPushMatrix();
	//Ker racanumao y inveryim moramo it glih kontra.. prvo rotiramo potem transliramo
	var s = createScaleMatrix(30);
	mat4.multiply(mvMatrix, createMvMatrix(invCarRotationMatrix, invCarTranslateMatrix, s));
	m = models[TRACK.name];
	renderObject(m);
	mvPopMatrix();

	mvPushMatrix();
	var s = createScaleMatrix(35);
	mat4.translate(mvMatrix, [0.0, -0.1, 0.0]);
	mat4.multiply(mvMatrix, createMvMatrix(invCarRotationMatrix, invCarTranslateMatrix, s));
	m = models[BILLBOARD.name];
	renderObject(m);
	mvPopMatrix();
}

function renderObject(model) {
	gl.bindBuffer(gl.ARRAY_BUFFER, model.mesh.vertexBuffer);
	shaderProgram.applyAttributePointers(model);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.mesh.indexBuffer);
	setMatrixUniforms();
	gl.drawElements(gl.TRIANGLES, model.mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
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

		var p = OBJ.downloadModels([LOWPOLY_CART, TRACK, BILLBOARD, TREES]);

		p.then(function (m) {
			meshes = m;
			initBuffers();
			// Set up to draw the scene periodically.
			setInterval(function () {
				update();
				drawScene();

			}, 15);
		});

		// Bind keyboard handling functions to document handlers
		document.onkeydown = function (event) {
			currentlyPressedKeys[event.keyCode] = true;
		};
		document.onkeyup = function (event) {
			currentlyPressedKeys[event.keyCode] = false;
		};
	}
}
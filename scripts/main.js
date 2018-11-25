var canvas;
var gl;

//
// initGL
//
// Initialize WebGL, returning the GL context or null if
// WebGL isn't available or could not be initialized.
//
function initGL() {
	var gl = null;
	try {
		// Try to grab the standard context. If it fails, fallback to experimental.
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	} catch(e) {}

	// If we don't have a GL context, give up now
	if (!gl) {
		alert("Unable to initialize WebGL. Your browser may not support it.");
	}
	return gl;
}

//
// getShader
//
// Loads a shader program by scouring the current document,
// looking for a script with the specified ID.
//
function getShader(gl, id) {
	var shaderScript = document.getElementById(id);

	// Didn't find an element with the specified ID; abort.
	if (!shaderScript) {
		return null;
	}

	// Walk through the source element's children, building the
	// shader source string.
	var shaderSource = "";
	var currentChild = shaderScript.firstChild;
	while (currentChild) {
		if (currentChild.nodeType == 3) {
			shaderSource += currentChild.textContent;
		}
		currentChild = currentChild.nextSibling;
	}

	// Now figure out what type of shader script we have,
	// based on its MIME type.
	var shader;
	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;  // Unknown shader type
	}

	// Send the source to the shader object
	gl.shaderSource(shader, shaderSource);

	// Compile the shader program
	gl.compileShader(shader);

	// See if it compiled successfully
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}

function initShaders() {
	var fragmentShader = getShader(gl, "shader-fs");
	var vertexShader = getShader(gl, "shader-vs");

	// Create the shader program
	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	// start using shading program for rendering
	gl.useProgram(shaderProgram);

	// store location of aVertexPosition variable defined in shader
	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");

	// turn on vertex position attribute at specified position
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	// store location of aTextureCoord variable defined in shader
	shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");

	// turn on vertex texture coordinates attribute at specified position
	gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

	// store location of uPMatrix variable defined in shader - projection matrix
	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	// store location of uMVMatrix variable defined in shader - model-view matrix
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");

	// store location of uSampler variable defined in shader
	shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
}

function init() {
	canvas = document.getElementById('glcanvas');
	gl = initGL();

	// Ni nam useplo initializirati webgl - ne nadaljuj
	if(!gl)
		return false;

	gl.clearColor(0.0, 0.0, 0.0, 1.0);                      // Set clear color to black, fully opaque
	gl.clearDepth(1.0);                                     // Clear everything
	gl.enable(gl.DEPTH_TEST);                               // Enable depth testing
	gl.depthFunc(gl.LEQUAL);                                // Near things obscure far things
	gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

	//TODO: Javit da se igra nalaga

	initShaders();
	//initBuffers();
	//
	return true;
}


function createScene() {
	//TODO: initialize scene here (what was left from initgl)
}

function gameLoop() {
		//TODO: Main Game loop, handle all game logic here
}

function main() {
	if(init()) {
		createScene();
		gameLoop();
	}
	else {
		console.log('Failed To initialize WebGl.');
	}
}
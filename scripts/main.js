// Globals!
var canvas;
var gl;
var world;

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

	// If creating the shader program failed, alert
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Unable to initialize the shader program.");
	}

	// start using shading program for rendering
	gl.useProgram(shaderProgram);

	// store location of aVertexPosition variable defined in shader
	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");

	// turn on vertex position attribute at specified position
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	// store location of aVertexNormal variable defined in shader
	shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");

	// store location of aTextureCoord variable defined in shader
	gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

	// store location of uPMatrix variable defined in shader - projection matrix
	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	// store location of uMVMatrix variable defined in shader - model-view matrix
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	// store location of uSampler variable defined in shader
	shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
}


function handleLoadTexture(texture) {
	gl.bindTexture(gl.UNPACK_FLIP_Y_WEBGL, texture);

	// Third texture usus Linear interpolation approximation with nearest Mipmap selection
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.generateMipmap(gl.TEXTURE_2D);

	gl.bindTexture(gl.TEXTURE_2D, null);
}
/**
 * Loads a obj text and returns json of vertices usable byGL
 * It also loads all textures associated with obj, if any
 * @param obj
 */
function handleLoadModel(obj, texture_paths) {
	// first load from obj file
	var lines = obj.split('\n');
	var vertices = [];
	var tex_vertices = [];
	var vertex_normal = [];
	var triangles = {
		v: [],
		vt: [],
		vn: []
	};
	for (var i in lines) {
		var line = lines[i].split(' ');
		if(line[0].indexOf('v') === 0)
			vertices.push([line[1], line[2], line[3]]);
		else if (line[0].indexOf('vt') === 0)
			tex_vertices.push([line[1], line[2]]);
		else if (line[0].indexOf('vn') === 0)
			vertex_normal.push([line[1], line[2], line[3]]);
		else if (line[0].indexOf('f') === 0) {
			var v1 = line[1].split('/');
			var v2 = line[2].split('/');
			var v3 = line[3].split('/');
			triangles.v.push(
				v1[0],
				v2[0],
				v3[0]
			);
			if (v1.length > 1 && v1[1] !== '')
				triangles.vt.push(
					v1[1],
					v2[1],
					v3[1]
				);
			if (v1.length > 2 && v1[2] !== '')
			triangles.vn.push(
				v1[2],
				v2[2],
				v3[2]
			);
		}
	}

	// Naložimo še vse teksture
	var textures = [];
	for (var i in texture_paths) {
		var tp = texture_paths[i];
		var t = gl.createTexture();
		t.image = new Image();
		t.image.onload = function () {
			handleLoadTexture(t);
		}
		gl.image.src = ASSETS_PATH + '/' + tp;
		textures.push(t);
	}

	var model = {
		vertices: vertices,
		normals: vertex_normal,
		textures_uv: tex_vertices,
		triangles: triangles,
		textures: textures
	};
	return model
}

function loadModel(asset, callback) {
	var request = new XMLHttpRequest();
	request.open('GET', ASSETS_PATH + '/' + asset.model);
	request.onreadystatechange = function () {
		if (request.readyState === 4) {
			callback(handleLoadModel(request.response), asset.textures);
		}
	};
	request.send();
}

/**
 *  Tu naložimo vse modele s pripadajočimi teksturami
 */
function initModels() {
	loadModel(WORLD, function(m) {
		world = m;
		addToBuffer()
	});
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

	//TODO: Javit da se igra nalaga

	initShaders();
	initModels();

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
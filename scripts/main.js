// Globals!
var canvas;
var gl;


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


/**
 *  Tu naložimo vse modele s pripadajočimi teksturami
 */
function initModels() {
	loadModel(WORLD, gl.STATIC_DRAW);
	loadModel(CUBE, gl.STATIC_DRAW);
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

	//TODO: Tukaj naredi vso potrebno inicializcijo
	initModels();

	return true;
}


//draw frame here
function draw() {

}

function gameLoop() {

}

function main() {
	if(init()) {
		gameLoop()
	}
	else {
		console.log('Failed To initialize WebGl.');
	}
}

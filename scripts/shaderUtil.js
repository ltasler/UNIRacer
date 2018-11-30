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

//
// initShaders
//
// Initialize the shaders, so WebGL knows how to light our scene.
//
function initShaders() {
	var fragmentShader = getShader(gl, "shader-fs");
	var vertexShader = getShader(gl, "shader-vs");

	var shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Could not initialise shaders");
	}
	gl.useProgram(shaderProgram);

	const attrs = {
		aVertexPosition: OBJ.Layout.POSITION.key,
		aVertexNormal: OBJ.Layout.NORMAL.key,
		aTextureCoord: OBJ.Layout.UV.key,
		aDiffuse: OBJ.Layout.DIFFUSE.key,
		aSpecular: OBJ.Layout.SPECULAR.key,
		aSpecularExponent: OBJ.Layout.SPECULAR_EXPONENT.key
	};

	shaderProgram.attrIndices = {};
	for (const attrName in attrs) {
		if (!attrs.hasOwnProperty(attrName)) {
			continue;
		}
		shaderProgram.attrIndices[attrName] = gl.getAttribLocation(shaderProgram, attrName);
		if (shaderProgram.attrIndices[attrName] != -1) {
			gl.enableVertexAttribArray(shaderProgram.attrIndices[attrName]);
		} else {
			console.warn(
				'Shader attribute "' +
				attrName +
				'" not found in shader. Is it undeclared or unused in the shader code?'
			);
		}
	}

	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");

	shaderProgram.applyAttributePointers = function(model) {
		const layout = model.mesh.vertexBuffer.layout;
		for (const attrName in attrs) {
			if (!attrs.hasOwnProperty(attrName) || shaderProgram.attrIndices[attrName] == -1) {
				continue;
			}
			const layoutKey = attrs[attrName];
			if (shaderProgram.attrIndices[attrName] != -1) {
				const attr = layout[layoutKey];
				gl.vertexAttribPointer(
					shaderProgram.attrIndices[attrName],
					attr.size,
					gl[attr.type],
					attr.normalized,
					attr.stride,
					attr.offset
				);
			}
		}
	};
	return shaderProgram;
}

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
		if (line[0].indexOf('vt') === 0)
			tex_vertices.push(line[1], line[2]);
		else if (line[0].indexOf('vn') === 0)
			vertex_normal.push(line[1], line[2], line[3]);
		else if(line[0].indexOf('v') === 0) {
			vertices.push(line[1], line[1], line[1]);
		}
		else if (line[0].indexOf('f') === 0) {
			var v1 = line[1].split('/');
			var v2 = line[2].split('/');
			var v3 = line[3].split('/');
			var v4 = line[4].split('/');
			triangles.v.push(
				v1[0],
				v2[0],
				v3[0]
			);
			triangles.v.push(
				v1[0],
				v3[0],
				v4[0]
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

	// // Naložimo še vse teksture
	// var textures = [];
	// for (var i in texture_paths) {
	// 	var tp = texture_paths[i];
	// 	var t = gl.createTexture();
	// 	t.image = new Image();
	// 	t.image.onload = function () {
	// 		handleLoadTexture(t);
	// 	}
	// 	gl.image.src = ASSETS_PATH + '/' + tp;
	// 	textures.push(t);
	//}

	var model = {
		vertices: vertices,
		normals: vertex_normal,
		textures_uv: tex_vertices,
		triangles: triangles,
	};
	return model
}

/**
 * Loads given model
 * @param asset asset constant from assetList
 * @param draw_hint eh. gl.STATIC_DRAW
 * @param callback optional callback, that is called when loading is done. Useful for knowing when
 *                 app is done loading
 */
function loadModel(asset, draw_hint, callback) {
	var request = new XMLHttpRequest();
	request.open('GET', ASSETS_PATH + '/' + asset.model_path);
	request.onreadystatechange = function () {
		if (request.readyState === 4) {
			var model = handleLoadModel(request.response, asset.textures)
			asset.model = model;
			// In dodaj v buffer
			//asset.buffers = createBuffer(model, draw_hint);
			if(callback)
				callback();
		}
	};
	request.send();
}

// function createBuffer(model, draw_hint) {
// 	// Buffer za pozicije vertexov
// 	var buffer = gl.createBuffer();
// 	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
// 	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), draw_hint)
// 	buffer.itemSize = 3;
// 	buffer.numItems = model.vertices.length / 3;
//
// 	// Buffer za indexe obrazov
// 	var vertexIndexBuffer = gl.createBuffer();
// 	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
// 	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.triangles.v), draw_hint);
// 	vertexIndexBuffer.itemSize = 1;
// 	vertexIndexBuffer.numItems = model.triangles.v.length;
//
// 	return {
// 		vertexPositionBuffer: buffer,
// 		vertexIndexBuffer: vertexIndexBuffer
// 	};
// }

//
// V tem dokumentu se nahajaja seznam vseh modelov, s pripadajocimi teksturama.
// constante se nahajajo v json formatu. Primer
// const PRIMER = {
// model: 'pot do modela',
// textures: [
//  pot1, pot2, ...
// ]
// }

const ASSETS_PATH = 'assets';


var WORLD = {
	model_path: ASSETS_PATH + 'NewTrack/FullTrack.obj',
	material: ASSETS_PATH + 'NewTrack/FullTrack.mtl',
	name: 'World'
};

var CUBE = {
	model_path: 'cube.obj',
	material_path: 'cube.mtl',
	name: 'Cube'
};

var PLANE = {
	name: 'Plane',
	obj: ASSETS_PATH + '/plane/plane.obj',
	mtl: ASSETS_PATH + '/plane/plane.mtl'
};

var TEST_CAR = {
	model_path: 'test_car/test_car.obj',
	material_path: 'test_car/test_car.mtl',
	name: 'TestCar'
};

var LOWPOLY_CART = {
	name: 'LowPolyCart',
	obj: ASSETS_PATH + '/kart/lowpoly_kart.obj',
	mtl: ASSETS_PATH + '/kart/lowpoly_kart.mtl'
};

var TRACK = {
	name: 'Track',
	obj: ASSETS_PATH + '/track/track.obj',
	mtl: ASSETS_PATH + '/track/track.mtl'
};

var BILLBOARD = {
	name: 'Billboard',
	obj: ASSETS_PATH + '/billboard/billboard.obj',
	mtl: ASSETS_PATH + '/billboard/billboard.mtl'
};

function getAssetPath(asset) {
	return ASSETS_PATH + '/' + asset.model_path;
}

function getMaterialPath(asset) {
	return ASSETS_PATH + '/' + asset.material_path;
}
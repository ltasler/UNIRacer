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
	model_path: 'NewTrack/FullTrack.obj',
	name: 'World'
};

var CUBE = {
	model_path: 'cube.obj',
	name: 'Cube'
};

var PLANE = {
	model_path: 'plane/plane.obj',
	name: 'Plane'
};

var TEST_CAR = {
	model_path: 'test_car/test_car.obj',
	name: 'TestCar'
};

var LOWPOLY_CART = {
	model_path: 'kart/lowpoly_kart.obj',
	name: 'LowPolyCart'
};

function getAssetPath(asset) {
	return ASSETS_PATH + '/' + asset.model_path;
}
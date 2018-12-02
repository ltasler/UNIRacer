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



var LOWPOLY_CART = {
	name: 'LowPolyCart',
	obj: ASSETS_PATH + '/kart/lowpoly_kart.obj',
	mtl: ASSETS_PATH + '/kart/lowpoly_kart.mtl'
};

var TRACK = {
	name: 'road',
	obj: ASSETS_PATH + '/road/road.obj',
	mtl: ASSETS_PATH + '/road/road.mtl'
};

var BILLBOARD = {
	name: 'Banner',
	obj: ASSETS_PATH + '/banner/banner.obj',
	mtl: ASSETS_PATH + '/banner/banner.mtl'
};

var TREES = {
	name: 'Trees',
	obj: ASSETS_PATH + '/trees/trees.obj',
	mtl: ASSETS_PATH + '/trees/trees.mtl'
};

function getAssetPath(asset) {
	return ASSETS_PATH + '/' + asset.model_path;
}

function getMaterialPath(asset) {
	return ASSETS_PATH + '/' + asset.material_path;
}
/**
 *
 * @constructor
 */
function Car(position, rotation, speed, rotationSpeed) {
	this.positon = typeof position !== 'undefined' ? position : [0.0, 0.0, 0.0];
	this.speed = typeof speed !== 'undefined' ? speed : 0.0;
	this.rotation = typeof rotation !== 'undefined' ? rotation : 0.0;
	this.rotationSpeed = typeof position !== 'undefined' ? rotationSpeed : 0.2;
	this.mvMatrix = mat4.create();
	this.brakeSpeed = 10.0;
}

Car.prototype.accelerate = function(deltaTime) {
	var a = this.speed * Math.exp(-0.03 * this.speed);
	this.speed = a * deltaTime;
};

Car.prototype.brake = function(deltaTime) {
	this.speed = this.speed - this.brakeSpeed * deltaTime;
};

Car.prototype.rotation = function(direction, deltaTime) {
	this.rotation = this.rotation + direction * this.rotationSpeed * deltaTime;
};

Car.prototype.draw = function() {

	mat4.rotate(this.mvMatrix, degToRad(this.rotation), [0.0, 1.0, 0.0]);
	mat4.translate(this.mvMatrix, this.positon);

	//TODO: do Car Drawing logic here (or return mvMatrix and draw it elsewhere)

};


function degToRad(degrees) {
	return degrees * Math.PI / 180;
}

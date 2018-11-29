/**
 *
 * @constructor
 */
function Car(position, rotation, speed, rotationSpeed) {
	this.positon = typeof position !== 'undefined' ? position : [0.0, 0.0, 0.0];
	this.speed = typeof speed !== 'undefined' ? speed : 0.0;
	this.rotation = typeof rotation !== 'undefined' ? rotation : 0.0;
	this.rotationSpeed = typeof rotationSpeed !== 'undefined' ? rotationSpeed : 3;
	this.BRAKE_SPEED = 0.1;
	this.DRAG_SPEED = 0.02;
}


Car.prototype.accelerate = function(deltaTime) {
	//var a = this.speed + Math.exp(-0.03 * this.speed);
	var a = 0.05;
	this.speed += a * deltaTime;
};


Car.prototype.brake = function(deltaTime) {
	this.speed = this.speed - this.BRAKE_SPEED * deltaTime;
};


Car.prototype.rotate = function(direction, deltaTime) {
	this.rotation = this.rotation + direction * this.rotationSpeed * deltaTime;
};


Car.prototype.update = function(deltaTime) {
	var x = Math.cos(0) * Math.cos(this.rotation);
	var y = Math.sin(0) * Math.cos(this.rotation);
	var z = Math.sin(this.rotation);

	var direction = vec3.create();
	direction = [x, y, z];

	var drag_change = this.DRAG_SPEED * deltaTime;
	if(this.speed > 0 + drag_change)
		this.speed -= this.DRAG_SPEED * deltaTime;
	else if (this.speed < 0 - drag_change)
		this.speed += drag_change;
	else
		this.speed = 0;

	this.positon[0] += direction[0] * this.speed;
	this.positon[1] += direction[1] * this.speed;
	this.positon[2] += direction[2] * this.speed;
};


Car.prototype.getMvMatrix = function() {
	var mvMatrix = mat4.create();
	mat4.identity(mvMatrix);
	mat4.translate(mvMatrix, [0,0,-7])
	mat4.translate(mvMatrix, this.positon);
	mat4.rotate(mvMatrix, degToRad(this.rotation), [0, 1, 0]);
	return mvMatrix;
};


function degToRad(degrees) {
	return degrees * Math.PI / 180;
}

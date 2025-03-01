/**
 *
 * @constructor
 */
function Car(position, rotation, speed, rotationSpeed) {
	this.positon = typeof position !== 'undefined' ? position : [0.0, 0.0, 0.0];
	this.speed = typeof speed !== 'undefined' ? speed : 0.0;
	this.rotation = typeof rotation !== 'undefined' ? rotation : degToRad(-90);
	this.rotationSpeed = typeof rotationSpeed !== 'undefined' ? rotationSpeed : 3;
	this.BRAKE_SPEED = 0.1;
	this.DRAG_SPEED = 0.02;
}


Car.prototype.accelerate = function(deltaTime) {
	//var a = this.speed + Math.exp(-140.1 * this.speed);
	var a = 0.05;
	this.speed += a * deltaTime;
};


Car.prototype.brake = function(deltaTime) {
	this.speed = this.speed - this.BRAKE_SPEED * deltaTime;
};


Car.prototype.rotate = function(direction, deltaTime) {
	this.rotation = this.rotation + direction * this.rotationSpeed * deltaTime;
};

// This function should be called every frame. It calculates all the logic for car.
Car.prototype.update = function(deltaTime) {
	var direction = this.getDirection();

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

Car.prototype.getDirection = function () {
	var x = Math.cos(0) * Math.cos(this.rotation);
	var y = Math.sin(0) * Math.cos(this.rotation);
	var z = Math.sin(this.rotation);

	return [x, y, z];
};

Car.prototype.getTranslateMatrix = function () {
	var a = mat4.create();
	mat4.identity(a);
	mat4.translate(a, this.positon);
	return a;
};

Car.prototype.getRotationMatrix = function () {
	var a = mat4.create();
	mat4.identity(a);
	mat4.rotateY(a, -this.rotation + degToRad(270));
	return a;
};
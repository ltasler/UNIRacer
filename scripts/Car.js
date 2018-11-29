/**
 *
 * @constructor
 */
function Car(position, rotation, speed, rotationSpeed) {
	this.positon = typeof position !== 'undefined' ? position : [0.0, 0.0, 0.0];
	this.speed = typeof speed !== 'undefined' ? speed : 0.0;
	this.rotation = typeof rotation !== 'undefined' ? rotation : 0.0;
	this.rotationSpeed = typeof rotationSpeed !== 'undefined' ? rotationSpeed : 0.2;
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
	this.rotation[1] = this.rotation[1] + direction * this.rotationSpeed * deltaTime;
};

Car.prototype.update = function(deltaTime) {
	var x = Math.cos(this.rotation[1]) * Math.cos(this.rotation[2]);
	var y = Math.sin(this.rotation[1]) * Math.cos(this.rotation[2]);
	var z = Math.sin(this.rotation[2]);

	var direction = vec3.create();
	direction = [x, y, z];

	var drag_change = this.DRAG_SPEED * deltaTime;
	if(this.speed > 0 + drag_change)
		this.speed -= this.DRAG_SPEED * deltaTime;
	else if (this.speed < 0 - drag_change)
		this.speed += drag_change;
	else
		this.speed = 0;

	var offset = vec3.create();
	vec3.scale(offset, direction, this.speed);

	vec3.add(this.positon, this.positon, offset);
};


Car.prototype.getMvMatrix = function() {
	var mvMatrix = mat4.create();
	mat4.identity(mvMatrix);
	mat4.rotate(mvMatrix, degToRad(this.rotation[1]), [0, 1, 0]);
	mat4.translate(mvMatrix, this.positon);
};

Car.prototype.draw = function() {

	mat4.rotate(this.mvMatrix, degToRad(this.rotation), [0.0, 1.0, 0.0]);
	mat4.translate(this.mvMatrix, this.positon);

	//TODO: do Car Drawing logic here (or return mvMatrix and draw it elsewhere)

};


function degToRad(degrees) {
	return degrees * Math.PI / 180;
}

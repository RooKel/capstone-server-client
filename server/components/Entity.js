const { Quaternion } = require('three');
var Entity = function() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.x_rot = 0;
    this.y_rot = 0;
    //  Camera Quaternion
    this.quaternion = new Quaternion();
    //  Model Quaternion
    this.model_quaternion = new Quaternion();
    this.speed = 2;
    this.color = 0;
    this.position_buffer = [];
    this.quaternion_buffer = [];
}

module.exports = Entity;

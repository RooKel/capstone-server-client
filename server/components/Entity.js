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
    this.scale_x = 0;
    this.scale_y = 0;
    this.scale_z = 0;
    this.nickname = undefined;
    this.position_buffer = [];
    this.quaternion_buffer = [];
    this.extras = undefined;
}

module.exports = Entity;

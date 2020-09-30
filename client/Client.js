const update_rate = 60;
const server_update_rate = 12;

var Client = function() {
    // unique id of a client. Assigned by server on connection.
    this.entity_id = null;

    // local entities for rendering world objects
    this.entities = {};

    this.color = 0xae017e;

    // input state
    this.is_key_down = false;
    this.key_up = false;
    this.key_left = false;
    this.key_down = false;
    this.key_right = false;

    // reconciliation needs below data
    this.input_sequence_number = 0;
    this.pending_inputs = [];

    // socket io
    this.io = null;
  
    // update rate
    this.setUpdateRate(update_rate);

    // rendering components
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.circles = null;
}

Client.prototype.setUpdateRate = function(hz) {
    this.update_rate = hz;
  
    clearInterval(this.update_interval);
    this.update_interval = setInterval(
      (function(self) { return function() { self.update(); }; })(this),
      1000 / this.update_rate);
}

// update client state
Client.prototype.update = function() {
    // not connected yet
    if (this.entity_id == null)
      return;

    // process inputs
    this.processInputs();
  
    // interpolate other entities
    this.interpolateEntities();
  
    // render the world
    if (this.renderer) {
      for (var uid in this.circles) {
        this.circles[uid].position.x = this.entities[uid].x;
        this.circles[uid].position.y = this.entities[uid].y;
      }
      this.renderer.render(this.scene, this.camera);
    }
}

// get inputs and send them to the server
// if enabled, do client-side prediction
Client.prototype.processInputs = function() {
    // compute delta time since last update
    var now_ts = +new Date();
    var last_ts = this.last_ts || now_ts;
    var dt_sec = (now_ts - last_ts) / 1000.0;
    this.last_ts = now_ts;
  
    // package player's input
    var input = { entity_id: this.entity_id };
    input.move_dx = 0;
    input.move_dy = 0;

    if (this.key_right) {
      input.move_dx = dt_sec;
    } if (this.key_left) {
      input.move_dx = -dt_sec;
    } if (this.key_up) {
      input.move_dy = dt_sec;
    } if (this.key_down) {
      input.move_dy = -dt_sec;
    }

    if (this.key_up || this.key_left || this.key_down || this.key_right)
      this.is_key_down = true;
    else
      this.is_key_down = false;

    // nothing happened
    if (!this.is_key_down)
      return;
  
    // send the input to the server.
    input.input_sequence_number = this.input_sequence_number++;
    this.io.emit("input", input);

    // do client-side prediction.
    this.entities[this.entity_id].x += input.move_dx * this.entities[this.entity_id].speed;
    this.entities[this.entity_id].y += input.move_dy * this.entities[this.entity_id].speed;
  
    // save this input for later reconciliation.
    this.pending_inputs.push(input);
}

// process all messages from the server, i.e. world updates.
// if enabled, do server reconciliation.
Client.prototype.processServerMessages = function(data) {
    // if this is the first time we see this entity, create a local representation.
    if (!this.entities[data.entity_id]) {
      this.entity_id = data.entity_id;
      this.entities[data.entity_id] = data.entity_properties;
    }
    var entity = this.entities[data.entity_id];

    // received the authoritative position of this client's entity.
    if (data.entity_id == this.entity_id) {
      entity.x = data.entity_properties.x;
      entity.y = data.entity_properties.y;

      // Server Reconciliation. Re-apply all the inputs not yet processed by
      // the server.
      var j = 0;
      while (j < this.pending_inputs.length) {
        var input = this.pending_inputs[j];
        if (input.input_sequence_number <= data.last_processed_input) {
          // already processed. Its effect is already taken into account into the world update
          // we just got, so we can drop it.
          this.pending_inputs.splice(j, 1);
        } else {
          // not processed by the server yet. Re-apply it.
          this.entities[this.entity_id].x += input.move_dx * this.entities[this.entity_id].speed;
          this.entities[this.entity_id].y += input.move_dy * this.entities[this.entity_id].speed;
          j++;
        }
      }
    } else {
      // received the position of an entity other than this client's.
      // add it to the position buffer.
      var timestamp = +new Date();
      entity.position_buffer.push([timestamp, data.entity_properties.x, data.entity_properties.y]);
    }
}

Client.prototype.interpolateEntities = function() {
  // compute render timestamp.
  var now = +new Date(); 
  var render_timestamp = now - (1000.0 / server_update_rate);

  for (var i in this.entities) { 
    var entity = this.entities[i];

    // no point in interpolating this client's entity.
    if (entity.entity_id == this.entity_id) {
      continue;
    }

    // find the two authoritative positions surrounding the rendering timestamp.
    var buffer = entity.position_buffer;

    // drop older positions.
    while (buffer.length >= 2 && buffer[1][0] <= render_timestamp) {
      buffer.shift();
    }

    // interpolate between the two surrounding authoritative positions.
    if (buffer.length >= 2 && buffer[0][0] <= render_timestamp && render_timestamp <= buffer[1][0]) {
      var x0 = buffer[0][1]; var x1 = buffer[1][1];
      var y0 = buffer[0][2]; var y1 = buffer[1][2];
      var t0 = buffer[0][0]; var t1 = buffer[1][0];

      entity.x = x0 + (x1 - x0) * (render_timestamp - t0) / (t1 - t0);
      entity.y = y0 + (y1 - y0) * (render_timestamp - t0) / (t1 - t0);
    }
  }
}

export default Client;
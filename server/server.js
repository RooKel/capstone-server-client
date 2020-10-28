// make a express and convert http to websocket
var express = require('express');
const { Vector3, Quaternion } = require('three');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var THREE = require('three');
var fs = require('fs');

// set view engine to ejs engine, and routing to dist path for static web file
app.set('views', ['dist','editor']);
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.static('dist'));

app.use('/editor', express.static('./editor/src'));
app.use('/examples', express.static('./editor/examples'));
app.use('/build', express.static('./editor/build'));

// server listen with port 3000
server.listen(3000, function() { console.log("Express server has started on port 3000") });

// include component modules
var Entity = require('./components/Entity');
var Instance = require('./components/Instance');

// get random color for testing
const getRandomColor = function() { return Math.round(Math.random() * 0xffffff); }

// instances and entities map for processing
var instances = [];
var entities = [];

// last processed input for each client.
var last_processed_input = [];

// for testing
var instance = new Instance();
instances[instance.id] = instance;




const fps = 12;
var updateClock = function() {
    // gather the state of the world. In a real app, state could be filtered to avoid leaking data
    for (var uid in entities) {
        io.emit('world_state', { 'entity_id': uid, 'entity_properties': entities[uid], 'last_processed_input': last_processed_input[uid] });
    }
}
var timer = setInterval(updateClock, 1000 / fps);

var x_rot_value = 0;
var y_rot_value = 0;

// socket part
// socket.emit   : Sender only
// io.emit       : All clients except sender
io.on('connection', onConnect);

function onConnect(socket) {
    socket.on('login', function(data) {
        // create new entity for connected user's avatar
        var entity = new Entity();

        // TODO: this part will be modified to get gltf file from s3
        entity.color = getRandomColor();

        // store entity data into entities array
        entities[socket.id] = entity;

        if (!entities[socket.id].quaternion)
        entities[socket.id].quaternion = new THREE.Quaternion();

        // send login accept message to sender
        socket.emit('login_accept', socket.id);

        // send each entity data because socket.io doesn't support to send dictionary data
        for (var uid in entities) {
            socket.emit('entity_data', uid, entities[uid]);
        }

        // sending to all clients except sender
        socket.broadcast.emit('other_joined', socket.id, entities[socket.id]);

        // make sender starting update and rendering
        socket.emit('run', true);

        // for testing
        console.log(instances);
    });

    // if disconnection happenes, send delete entity message to clients
    socket.on('disconnect', function(reason) {
        delete entities[socket.id];
        io.emit('delete_entity', socket.id);
    });

    socket.on('input', function(data) {
        var uid = data.entity_id;

        // update the state of the entity
        entities[uid].x += data.move_dx * entities[uid].speed;
        entities[uid].y += data.move_dy * entities[uid].speed;

        // update rotation
        x_rot_value -= data.mouse_dx;
        y_rot_value -= data.mouse_dy;
        let tempQuat = new Quaternion();
        tempQuat.setFromEuler(new THREE.Euler(y_rot_value, x_rot_value, 0));
        tempQuat.normalize();
        entities[uid].quaternion.copy(tempQuat);

        console.log(entities[uid].quaternion);
        last_processed_input[uid] = data.input_sequence_number;
    });
    //  TODO : 테스트 코드니깐 꼭 지워라.
    socket.on('test', function(data) {
        //  Save GLTF file
        let gltf = data.raw_gltf;
        if(gltf !== undefined)
        {
            fs.writeFile("./testGLTF.gltf", gltf, function(e){
                console.log(e);
            });
        }

        //  Save Thumbnail To png File...
        let base64String = data.data_thumbnail;
        let base64Image = base64String.split(';base64').pop();

        fs.writeFile("./testThumb.png", base64Image, {encoding:'base64'}, function(e){
            console.log(e);
        });
    });
}

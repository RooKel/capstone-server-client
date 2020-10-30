// make a express and convert http to websocket
var express = require('express');
const { Vector3, Quaternion } = require('three');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var THREE = require('three');
var mongoose = require('mongoose');
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
var Camera = require('./components/Camera');

// get uid
const makeUID = function() { return '_' + Math.random().toString(36).substr(2, 9); }

// instances and entities map for processing
var instances = [];
var entities = [];
var cameras = [];

// last processed input for each client.
var last_processed_input = [];

// for testing
var instance = new Instance();
instances[instance.id] = instance;


// ***DATABASE***
mongoose.connect('mongodb+srv://lgy:rosetysehong@mongo-capstone.nb7jn.mongodb.net/mongo-capstone?retryWrites=true&w=majority', {useNewUrlParser: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error:"));
db.once('open', () => {
    console.log("DB connected");
});

var Schema = new mongoose.Schema({
    uid: String,
    name: String,
    creator: String,
    date: Date
})

var avatarModel = mongoose.model('avatar', Schema);
var worldModel = mongoose.model('world', Schema);









const fps = 12;
var updateClock = function() {
    // gather the state of the world. In a real app, state could be filtered to avoid leaking data
    for (var uid in entities) {
        io.emit('world_state', { 'entity_id': uid, 'entity_properties': entities[uid], 'last_processed_input': last_processed_input[uid] });
    }
}
var timer = setInterval(updateClock, 1000 / fps);

// socket part
// socket.emit   : Sender only
// io.emit       : All clients except sender
io.on('connection', onConnect);

function onConnect(socket) {
    socket.on('login', function(data) {
        // create new entity for connected user's avatar
        var entity = new Entity();
        var camera = new Camera();

        // store entity data into entities array
        entities[socket.id] = entity;
        cameras[socket.id] = camera;
        entities[socket.id].quaternion = new THREE.Quaternion();

        // send login accept message to sender
        socket.emit('login_accept', socket.id);

        // send each entity data because socket.io doesn't support to send dictionary data
        for (var uid in entities)
            socket.emit('entity_data', uid, entities[uid]);

        // sending to all clients except sender
        socket.broadcast.emit('other_joined', socket.id, entities[socket.id]);
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
        cameras[uid].x_rot -= data.mouse_dx;
        cameras[uid].y_rot -= data.mouse_dy;
        let tempQuat = new Quaternion();
        tempQuat.setFromEuler(new THREE.Euler(cameras[uid].y_rot, cameras[uid].x_rot, 0));
        tempQuat.normalize();
        entities[uid].quaternion.copy(tempQuat);

        last_processed_input[uid] = data.input_sequence_number;
    });

    //  TODO : 테스트 코드니깐 꼭 지워라.
    socket.on('file-upload', function(data) {
        var uid = makeUID();
        var dir = "./data/" + uid;

        //  Save GLTF file
        let gltf = data.raw_gltf;
        if(gltf !== undefined)
        {
            !fs.existsSync(dir) && fs.mkdirSync(dir);
            fs.writeFile(dir + "/GLTF.gltf", gltf, function(e){
                console.log(e);
            });
        }

        //  Save Thumbnail To png File...
        let base64String = data.data_thumbnail;
        let base64Image = base64String.split(';base64').pop();

        fs.writeFile(dir + "/thumbnail.png", base64Image, {encoding:'base64'}, function(e){
            console.log(e);
        });


        // If it is Avatar Type
        if (data.data_type === "avatar") {
            var avatar = new avatarModel();
            avatar.uid = uid;
            avatar.name = data.data_name;
            avatar.creator = data.data_creator;
            avatar.date = Date.now();
            avatar.save(function (err) {
                if (err)
                    throw err;
                else
                    console.log("DB IS UPDATED SUCCESSFULLY");
            });
        }

        // If it is World Type
        else if (data.data_type === "world") {
            var world = new worldModel();
            world.uid = uid;
            world.name = data.data_name;
            world.creator = data.data_creator;
            world.date = Date.now();
            world.save(function (err) {
                if (err)
                    throw err;
                else
                    console.log("DB IS UPDATED SUCCESSFULLY");
            });
        }
    });


    // Send File To Client
    socket.on('rq-file-download', function(data) {
        if (data.data_type === "avatar") {
            avatarModel.find({}).select('uid name creator date').exec(function(err, avatars) {
                avatars.forEach(function(avatar) {
                    fs.readFile("./data/" + avatar.uid + "/thumbnail.png", function(err, data) {
                        socket.emit("file-download", { type: "avatar", data: data });
                        console.log("data::", data);
                        console.log(avatar.uid + " " + avatar.name + " " + avatar.creator);
                    });
                });
            });
        }

        else if (data.data_type === "world") {
            worldModel.find({}).select('uid name creator date').exec(function(err, worlds) {
                worlds.forEach(function(world) {
                    fs.readFile("./data/" + world.uid + "/thumbnail.png", function(err, data) {
                        socket.emit("file-download", { type: "world", data: data });
                        console.log(world.uid + " " + world.name + " " + world.creator);
                    });
                });
            });
        }
    });
}
// make a express and convert http to websocket
var express = require('express');
const { Vector3, Quaternion } = require('three');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var THREE = require('three');
var mongoose = require('mongoose');
var fs = require('fs');
const { PeerServer } = require('peer');
const peerServer = PeerServer({ port: 3001, path: '/peer' });

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
const { waitForDebugger } = require('inspector');

// get random number to create instance id.
const makeUID = function() { return '_' + Math.random().toString(36).substr(2, 9); }

// all of instances.
var instances = [];
var instance_of_users = [];

// last processed input for each client.
var last_processed_input = [];





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







// send updated data to client
const fps = 12;
var updateClock = function() {
    // gather the state of the world. In a real app, state could be filtered to avoid leaking data
    for (var user_id in instance_of_users)
    {
        var instance_id = instance_of_users[user_id];
        var instance = instances[instance_id];

        for (var entity_id in instance.entities)
        {
            console.log(entity_id + "가" + "인스턴스 아이디:" + instance_id + "내의 모든 객체에 대한 정보를 받고 있다.");
            io.in(instance_id).emit('world-state', { 'entity_id': entity_id, 'entity_properties': instance.entities[entity_id], 'last_processed_input': last_processed_input[entity_id] });
        }
    }
}
var timer = setInterval(updateClock, 1000 / fps);








// socket part
// socket.emit   : Sender only
// io.emit       : All clients except sender
io.on('connection', onConnect);

function onConnect(socket)
{
    /* generate instance id and assign world, master id */
    socket.on('create-world', world_id => {
        var instance_id = makeUID();
        instances[instance_id] = new Instance();
        instances[instance_id].world_id = world_id;
        instances[instance_id].master_id = socket.id;

        socket.emit('create-success', instance_id);

        /* 여기 아래부터 파싱 진행 및 오브젝트 초기화 단계 */
    });

    /* if user join instance, broadcast other-joined event */
    socket.on('join-instance', instance_id => {
        // user join specific socket instance
        socket.join(instance_id);
        instance_of_users[socket.id] = instance_id;

        // store entity data into entities array
        var instance = instances[instance_id];
        instance.entities[socket.id] = new Entity();

        // intialize user quaternion data
        var user_entity = instance.entities[socket.id];
        user_entity.quaternion = new THREE.Quaternion();

        // send login accept message to sender
        socket.emit('join-accept', socket.id);

        // send each entity data because socket.io doesn't support to send dictionary data
        for (var entity_id in instance.entities)
        {
            socket.emit('initial-entities-data', entity_id, instance.entities[entity_id]);
        }

        // sending to all clients except sender
        socket.to(instance_id).emit('other-join', socket.id, instance.entities[socket.id]);
    });

    /* peer login for audio chat */
    socket.on('peer-login', pid => {
        var instance_id = instance_of_users[socket.id];
        socket.to(instance_id).emit('peer-connected', { 'uid':socket.id, 'pid':pid });
        console.log("PEER CONNECT : " + pid);
    });

    /* if disconnection happenes, send delete entity message to clients */
    socket.on('disconnect', reason => {
        var instance_id = instance_of_users[socket.id];
        var instance = instances[instance_id];

        // delete disconnected user entity
        delete instance.entities[socket.id];

        // broadcast disconnected user id
        io.emit('disconnected', socket.id);
        socket.to(instance_id).emit('peer-disconnected', socket.id);
        console.log("PEER DISCONNECT : " + socket.id);
    });

    /* process user input */
    socket.on('input', data => {
        var user_instance = instance_of_users[socket.id];
        var user_entity = instances[user_instance].entities[socket.id];
        
        user_entity.x += data.move_dx * user_entity.speed;
        user_entity.y += data.move_dy * user_entity.speed;
        
        user_entity.x_rot -= data.mouse_dx;
        user_entity.y_rot -= data.mouse_dy;
        
        let tempQuat =  new Quaternion();
        let mulQuat = new Quaternion();
        mulQuat.setFromAxisAngle(new Vector3(-1,0,0), user_entity.y_rot);
        tempQuat.setFromAxisAngle(new Vector3(0,1,0), user_entity.x_rot);
        tempQuat.multiply(mulQuat);
        user_entity.quaternion.copy(tempQuat);
    });

    /* upload avatar or world from client */
    socket.on('file-upload', data => {
        // generate world id and set directory
        var uid = makeUID();
        var dir = "./data/" + uid;

        // save GLTF file
        var gltf = data.raw_gltf;
        if(gltf !== undefined)
        {
            !fs.existsSync(dir) && fs.mkdirSync(dir);
            fs.writeFile(dir + "/GLTF.gltf", gltf, function(e){
                console.log(e);
            });
        }

        // save thumbnail to png file.
        var base64String = data.data_thumbnail;
        var base64Image = base64String.split(';base64').pop();

        fs.writeFile(dir + "/thumbnail.png", base64Image, {encoding:'base64'}, function(e){
            console.log(e);
        });


        // if file is avatar type, update db in avatar table
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

        // if file is world type, update db in world table
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

        socket.emit("file-upload-ack", { uid: uid, data_name: data.data_name, data_size: data.raw_gltf.length, data_type: data.data_type, data_creator:data.data_creator });
        console.log("file-upload-ack : " + uid + " " + data.data_name + " " + data.raw_gltf.length + " " + data.data_type + " " + data.data_creator);
    });

    // send avatar or world file to client
    socket.on('rq-file-download', function(data) {
        if (data.category === "avatar") {
            sendModelData(socket, avatarModel, data.request_type, data.category, data.uid);
        } else if (data.category === "world") {
            sendModelData(socket, worldModel, data.request_type, data.category, data.uid);
        }
    });
}

function sendModelData(socket, model, request_type, category, param_uid)
{
    var dataArray = [];

    var file_name = request_type;
    var file_format = "";

    if (request_type === "thumbnail")
        file_format = ".png";
    else if (request_type === "gltf")
    {
        file_name = "GLTF";
        file_format = ".gltf";
    }


    if (param_uid === undefined) {
        model.find({}).select('uid name creator date').exec()
            .then((items) => {
                function logItem(item) {
                    return new Promise((resolve, reject) => {
                            process.nextTick(() => {
                                    fs.readFile("./data/" + item.uid + "/" + file_name + file_format, (err, data) => {
                                        var dataTuple = { uid: undefined, name: undefined, creator:undefined, date:undefined, data: undefined };
                                        dataTuple.uid = item.uid;
                                        dataTuple.name = item.name;
                                        dataTuple.creator = item.creator;
                                        dataTuple.date = item.date;
                                        dataTuple.data = data;
                                        dataArray.push(dataTuple);
                                    });
                            setTimeout(function(){ resolve() }, 100);
                            })
                        });
                    }
                function forEachPromise(items, fn) {
                return items.reduce(function (promise, item) {
                        return promise.then(function () {
                            return fn(item);
                        });
                }, Promise.resolve());
                }
                forEachPromise(items, logItem).then(() => {
                    console.log(dataArray);
                    socket.emit("file-download", { request_type: request_type, category: category, data: dataArray });
                    console.log("all of file data sent!");
                });
            });
    } else {
        model.findOne({'uid':param_uid}).exec()
            .then((item) => {
            var dataTuple = { uid: undefined, name: undefined, creator:undefined, date:undefined, data: undefined };
            dataTuple.uid = item.uid;
            dataTuple.name = item.name;
            dataTuple.creator = item.creator;
            dataTuple.date = item.date;
            dataTuple.data = fs.readFileSync("./data/" + item.uid + "/" + file_name + file_format);
            dataArray.push(dataTuple);
            socket.emit("file-download", { request_type: request_type, category: category, data: dataArray });
            console.log("dataArray : " + dataArray[0].uid + " " + dataArray[0].name + " " + dataArray[0].creator);
            console.log("only one file data sent!");
        });
    }
}

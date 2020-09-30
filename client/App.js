import { Scene, Color, PerspectiveCamera, AmbientLight, WebGLRenderer } from 'three'

import * as THREE from 'three';

import Client from './Client.js'

const App = ()=>{
    const Init = ()=>{
        // make a socket and bind in client
        let client = new Client();

        // create socket
        client.io = io();

        // send login message to server
        client.io.emit("login", true);

        // accept a login and get unique id from the server.
        client.io.on("login_accept", function(uid) {
            client.entity_id = uid;
        });







        // ***** Rendering part ******
        // declare renderer and set viewport
        const renderer = new WebGLRenderer();
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild(renderer.domElement);

        // declare scene, light
        const scene = new Scene();
        scene.background = new Color(0xaaaaaa);
        scene.add(new AmbientLight(0xFFFFFF, 5));

        // declare camera
        const camera = new PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
        camera.position.set(0,0,5);
        
        // initial render to fill canvas with specific background color
        renderer.render(scene, camera);

        // store renderer, scene and camera into client
        client.renderer = renderer;
        client.scene = scene;
        client.camera = camera;

        // entities for rendering
        var circles = {};
        client.circles = circles;

        // get entities data from the server
        client.io.on("entity_data", function(uid, data) { addNewObject(uid, data); });
        client.io.on("other_joined", function(uid, data) { addNewObject(uid, data); });

        // instantiate if new client joins
        function addNewObject(uid, data) {
            // add new entity to entities of client
            client.entities[uid] = data;

            // declare geometry and material to create a circle mesh
            var geometry = new THREE.CircleGeometry(0.5, 32);
            var material = new THREE.MeshBasicMaterial( { color: data.color } );

            // declare circle mesh
            circles[uid] = new THREE.Mesh( geometry, material );
            circles[uid].position.x = client.entities[uid].x;
            circles[uid].position.y = client.entities[uid].y;

            scene.add(circles[uid]);
        }

        // TODO: need to sync with client input update
        // process message from the server
        client.io.on("world_state", function(data) {
            //console.log(data);
            client.processServerMessages(data);
        })

        // delete entity of disconnected player
        client.io.on("delete_entity", function(uid) {
            scene.remove(circles[uid]);

            delete client.entities[uid];
            delete circles[uid];
        })







        // key handler part
        // when the player presses the arrow keys, set the corresponding flag in the client.
        var keyHandler = function(e) {
            e = e || window.event;

            // Arrow Up
            if (e.keyCode == 38)
            {
                client.key_up = (e.type == "keydown");
            }

            // Arrow Left
            if (e.keyCode == 37)
            {
                client.key_left = (e.type == "keydown");
            }

            // Arrow Down
            if (e.keyCode == 40)
            {
                client.key_down = (e.type == "keydown");
            }

            // Arrow Right
            if (e.keyCode == 39)
            {
                client.key_right = (e.type == "keydown");
            }
        }
        document.body.onkeydown = keyHandler;
        document.body.onkeyup = keyHandler;   
    }

    return {
        Start: ()=>Init()
    };
};

export default App;
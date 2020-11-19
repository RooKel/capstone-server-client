import Page from './Page.js'
import Canvas from './UI/Canvas.js'
import WorldPgMainMenu from './UI/WorldPgMainMenu.js'
import Pointer from './Pointer.js'
import { Color, LineSegments, LineBasicMaterial, BoxGeometry, MeshBasicMaterial, Mesh,
    AnimationMixer, AnimationClip } from 'three'
import UserManager from './Comms/UserManager.js'
import InputCollector from './Comms/InputCollector.js'
import Click from './Interaction/Click.js'

import * as TMUI from 'three-mesh-ui'
import * as STY from './UI/Styles.js'

import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js'
import Billboard from './Interaction/Billboard.js'
import {FileTransferManager} from './FileTransferManager.js'
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js';
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";

import MyPeer from './MyPeer.js'

const WorldPage = (socket, client_data, app_sigs)=>{
    const page = Page();
    page.scene.background = new Color(0xFFFFFF);
    page.scene.add(
        new LineSegments(
            new BoxLineGeometry( 10, 10, 10, 10, 10, 10 ).translate( 0, 5, 0 ),
            new LineBasicMaterial( { color: 0x000000 } )
        )
    );

    let mixer = undefined;
    const network_object = new FileTransferManager(null, "ws://localhost:3000");
    const OnFileDownload = (res)=>{
        let models = res.data;
        for (let c = 0; c < models.length; c++)
        {
            let model = models[c];
            let dracoLoader = new DRACOLoader();
            dracoLoader.setDecoderPath( '../examples/js/libs/draco/gltf/' );

            let loader = new GLTFLoader();
            loader.setDRACOLoader( dracoLoader );
            loader.parse( model.data, '', function ( result ) {

                var scene = result.scene;
                scene.name = result.scene.name;

                scene.position.set(-2,0,-2);
                page.scene.add(scene);
                let getAnimSet = [ ];
                scene.traverse((_)=>{
                    if(_.userData === undefined) return;
                    if(_.userData.animSet === undefined) return;
                    if(_.userData.animSet.length === 0) return;
                    for(let a = 0; a < _.userData.animSet.length; a++){
                        let animByName = result.animations.find(
                            anim=>anim.name == _.userData.animSet[a].animation
                        );
                        getAnimSet.push(animByName);
                        mixer = new AnimationMixer(_);
                        mixer.clipAction(getAnimSet[0], _).play();
                    }
                });
                //editor.addAnimation( scene, result.animations );
                //editor.execute( new AddObjectCommand( editor, scene ) );
            });
        }
    }
    network_object.addFileDownloadListener(OnFileDownload);
    network_object.requestFileDownload('gltf', 'world', '_waql4iri2');
    network_object.listenFileDownload();

    //const peer = MyPeer(socket);

    let temp = new TMUI.Block(STY.small_panel);
    temp.position.set(0,1,0);
    page.scene.add(temp);
    Billboard(temp, page.camera, page.sigs);

    page.camera.position.set(0,1,4);
    const ui_objs_to_test = [ ];
    const objs_to_test = [ ];

    let geometry = new BoxGeometry(1,1,1);
    let material = new MeshBasicMaterial({color:0xFF0000});
    let cube = new Mesh(geometry, material);
    cube.position.set(0,2,0);
    Click(cube, ()=>{ cube.material.color = new Color(0x0000FF); });
    objs_to_test.push(cube);
    page.scene.add(cube);

    const canvas = Canvas(page.sigs.update);
    Object.assign(page, { canvas: canvas });
    const pointer_cam = page.camera;
    const pointer_objs_to_move = objs_to_test;
    const pointer = Pointer(page.sigs, pointer_cam, pointer_objs_to_move);

    const input_collector = InputCollector(socket, client_data, page.sigs);
    const user_manager = UserManager(socket, client_data, page, input_collector);
    //#region signals event handlers
    const OnEnter = ()=>{
        //console.log('WorldPage: enter');
    }
    const OnExit = ()=>{
        //console.log('WorldPage: exit');
    }
    const OnUpdate = (delta)=>{
        if(mixer)
            mixer.update(delta)
    }
    //#endregion
    page.sigs.enter.add(OnEnter);
    page.sigs.exit.add(OnExit);
    page.sigs.update.add(OnUpdate);
    return page;
}

export default WorldPage
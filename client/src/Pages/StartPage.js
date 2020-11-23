import {Color, LineSegments, LineBasicMaterial, AnimationMixer, MathUtils, MeshToonMaterial} from 'three'
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import RobotGLTF from '../../assets/models/Robot.gltf'
import StartSceneGLTF from '../../assets/models/Start_Scene.gltf'
import BackgroundPNG from '../../assets/png/CartoonSpace01.png';

import { Page } from './Page.js'
import { Pointer } from './Invokers/Pointer.js'

import * as TMUI from 'three-mesh-ui'
import * as STYLE from './UI/Styles.js'
import { SetVisibility } from './Interactions/SetVisibility.js'
import { Canvas } from './UI/Canvas.js'
import { StartPanel } from './UI/StartPage/StartPanel.js'
import { MainMenuPanel } from './UI/StartPage/MainMenuPanel.js'
import {TextureLoader} from "../../../editor/build/three.module";
import {Euler, Vector3} from "../../../editor/build/three";

const StartPage = (socket, client_data, app_sigs, ftm)=>{
    const page = Page();
    page.scene.background = new Color(0xFFFFFF);
    // page.scene.add(
    //     new LineSegments(
    //         new BoxLineGeometry(10, 10, 10, 10, 10, 10).translate(0, 5, 0),
    //         new LineBasicMaterial({ color: 0x000000 })
    //     )
    // );

    const loading_panel = new TMUI.Block(Object.assign({},
        STYLE.startPanelType,
        STYLE.font_roboto,
        {
            alignContent: 'center',
            justifyContent: 'center',
        }
    ));
    loading_panel.set({ backgroundOpacity:0.5 });
    loading_panel.add(new TMUI.Text({ content: 'Loading' }));
    loading_panel.position.z = -1;
    SetVisibility(loading_panel);

    let mixer = undefined;
    const animation_action = [ ];
    const loader = new GLTFLoader();
    const texLoader = new TextureLoader();
    texLoader.load(BackgroundPNG, function(texture){
        page.scene.background = texture;
        page.scene.environment = texture;
    });

    loader.load(
        StartSceneGLTF,
        (loaded)=>{
            let loadedScene = loaded.scene;
            loadedScene.scale.set(1.25, 1.25, 1.25);
            //loadedScene.rotation.set(0.1,0,0);
            let astro = loaded.scene.children[0];
            astro.translateX(-8);
            astro.translateY(-10);
            astro.translateZ(-2);
            astro.traverseVisible(_ =>{
                if(_.isMesh)
                {
                    let curMat = _.material;
                    let toonMat = new MeshToonMaterial({
                        color:curMat.color,
                        emissive:curMat.emissive,
                        skinning:curMat.skinning,
                        map:curMat.map,
                        emissiveMap:curMat.emissiveMap,
                        side:curMat.side,
                        depthTest:curMat.depthTest,
                        depthWrite:curMat.depthWrite
                    });
                    _.material = toonMat;
                }
            })
            console.log(astro);

            let debri = loaded.scene.children[1];
            debri.translateX(-8);
            debri.translateY(-10);

            let light = loaded.scene.children[2];
            light.position.set(5, 14, 13.379);
            light.lookAt(debri.position);
            light.intensity = 1.5;

            page.scene.add(loaded.scene);

            mixer = new AnimationMixer(loaded.scene);
            loaded.animations.forEach((_)=>{
                animation_action.push(mixer.clipAction(_));
            });
            loading_panel.sigs.set_visib.dispatch(false);
            main_menu_panel.sigs.set_visib.dispatch(true);
            animation_action[0].play();
        },
        (xhr)=>{
            //PROGRESS BAR
        }
    );
    page.camera.fov = 50;
    page.camera.position.set(-2.114,8.763,33.020);
    let camRot = new Euler(0,0,0);
    camRot.x = MathUtils.degToRad(-16.13);
    camRot.y = MathUtils.degToRad(-17.84);
    camRot.z = MathUtils.degToRad(-5.06);
    page.camera.rotation.set(camRot.x,camRot.y,camRot.z);

    const ui_interactable = [ ];
    //#region ui
    const canvas = Canvas(page.sigs);
    const start_panel = StartPanel(ui_interactable, socket);
    const main_menu_panel = MainMenuPanel(ui_interactable, canvas, app_sigs, ftm, socket, page);
    main_menu_panel.set({ backgroundOpacity: 0 });
    main_menu_panel.position.set(0,0,-1);
    canvas.scene.add(start_panel, main_menu_panel, loading_panel);
    Object.assign(page, { canvas: canvas });
    //#endregion
    const pointer = Pointer(page.sigs, canvas.camera, ui_interactable);
    //#region socket event handlers
    const OnCreateSuccess = (instance_id)=>{
        //socket.emit('join-instance', instance_id);
        console.log('create_success');
    }
    const OnJoinAccept = (socket_id)=>{
        client_data.uid = socket_id;
        app_sigs.change_page.dispatch(1);
    }
    //#endregion
    //#region signal event handlers
    const OnEnter = ()=>{
        socket.on('create-success', OnCreateSuccess);
        socket.on('join-accept', OnJoinAccept);
        main_menu_panel.sigs.set_visib.dispatch(false);
        start_panel.sigs.set_visib.dispatch(false);
        loading_panel.sigs.set_visib.dispatch(true);
    }
    const OnExit = ()=>{
        socket.off('create-success', OnCreateSuccess);
        socket.on('join-accept', OnJoinAccept);
    }
    const OnUpdate = (delta)=>{
        if(mixer) mixer.update(delta);
    }
    //#endregion
    page.sigs.enter.add(OnEnter);
    page.sigs.exit.add(OnExit);
    page.sigs.update.add(OnUpdate);
    return page;
}

export { StartPage }

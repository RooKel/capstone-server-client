import {Page} from './Page.js'
import {Pointer} from './Invoker/Pointer.js'
import {Canvas} from './UI/Canvas.js'
import {StartPanel} from './UI/Panels/StartPanel.js'
import {MainPanel} from './UI/Panels/MainPanel.js'
import {UserDataPanel} from './UI/Panels/UserDataPanel.js'
import {SelectAvatarPanel} from './UI/Panels/SelectAvatarPanel.js'
import {EnterInstPanel} from './UI/Panels/EnterInstPanel.js'
import {CreateInstPanel} from './UI/Panels/CreateInstPanel.js'
import {SelectWorldPanel} from './UI/Panels/SelectWorldPanel.js'
import {Color, AnimationMixer, Euler, MathUtils, MeshToonMaterial, sRGBEncoding} from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {TextureLoader} from '../../../editor/build/three.module'
import BackgroundPNG from '../../assets/Img/CartoonSpace01.png'
import StartSceneGLTF from '../../assets/Models/Start_Scene.gltf'

const StartPage = (socket, ftm, client_data, app_sigs)=>{
    const page = Page();
    page.scene.background = new Color(0xF0F0F0);
    //#region deco
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
    //#endregion
    //#region ui
    const ui_interactable = [ ];
    const canvas = Canvas(page.sigs);
    const pointer = Pointer(page.sigs, canvas.camera, ui_interactable);
    const navigate = { };
    const start_panel = StartPanel(ui_interactable, socket, ftm, navigate, client_data);
    const main_panel = MainPanel(ui_interactable, socket, ftm, navigate, client_data);
    const user_data_panel = UserDataPanel(ui_interactable, socket, ftm, navigate, client_data);
    const select_avatar_panel = SelectAvatarPanel(ui_interactable, socket, ftm, navigate, client_data);
    const enter_inst_panel = EnterInstPanel(ui_interactable, socket, ftm, navigate, client_data);
    const create_inst_panel = CreateInstPanel(ui_interactable, socket, ftm, navigate, client_data);
    const select_world_panel = SelectWorldPanel(ui_interactable, socket, ftm, navigate, client_data);
    Object.assign(navigate, {
        start: start_panel,
        main: main_panel,
        user_data: user_data_panel,
        select_avatar: select_avatar_panel,
        enter_inst: enter_inst_panel,
        create_inst: create_inst_panel,
        select_world: select_world_panel,
    });
    canvas.scene.add(start_panel, main_panel, user_data_panel, select_avatar_panel, enter_inst_panel, create_inst_panel, select_world_panel);
    //#endregion
    //#region socket event handlers
    const OnJoinAccept = (world_id)=>{
        app_sigs.change_page.dispatch('world', world_id);
    }
    //#endregion
    page.sigs.enter.add(()=>{
        if(!client_data.user_name) start_panel.sigs.toggle_on.dispatch(false, undefined);
        else main_panel.sigs.toggle_on.dispatch(false, 'start');
        socket.on('join-accept', OnJoinAccept);
        page.sigs.render.addOnce((renderer)=>{
            renderer.outputEncoding = sRGBEncoding;
            renderer.toneMapping = 0;
            renderer.toneMappingExposure = 1;
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = 1;
        }, null, 2);
    });
    page.sigs.exit.add(()=>{
        socket.off('join-accept', OnJoinAccept);
    });
    page.sigs.update.add((delta)=>{
        if(mixer) mixer.update(delta);
    });
    return page;
}

export {StartPage}
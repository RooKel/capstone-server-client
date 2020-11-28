import { Color, LineSegments, LineBasicMaterial, Vector3, DirectionalLight } from 'three'
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js'
import { Page } from './Page.js'
import { Pointer } from './Invokers/Pointer.js'
import { UserManager } from './Comms/UserManager.js'
import { InputCollector } from './Comms/InputCollector.js'
import { MyPeer } from '../MyPeer.js'

import { Canvas } from './UI/Canvas.js'
import { MainMenuPanel } from './UI/WorldPage/MainMenuPanel.js'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

import * as TMUI from 'three-mesh-ui'
import * as STYLE from './UI/Styles.js'
import { SetVisibility } from './Interactions/SetVisibility.js'

const WorldPage = (socket, client_data, app_sigs, ftm, world_id)=>{
    const three_canvas = document.getElementById('three_canvas');

    const loading_panel = new TMUI.Block(Object.assign({},
        STYLE.startPanelType,
        STYLE.font_roboto,
        {
            backgroundOpacity: 0,
            alignContent: 'center',
            justifyContent: 'center',
        }
    ));
    loading_panel.set({ backgroundOpacity:0.5 });
    loading_panel.add(new TMUI.Text({ content: 'Loading' }));
    loading_panel.position.z = -1;
    SetVisibility(loading_panel);
    
    const page = Page();
    page.scene.background = new Color(0xFFFFFF);
    const dir_light = new DirectionalLight(0xFFFFFF, 1);
    dir_light.position.set(5,12,-18);
    page.scene.add(dir_light);
    // page.scene.add(
    //     new LineSegments(
    //         new BoxLineGeometry(10, 10, 10, 10, 10, 10).translate(0, 5, 0),
    //         new LineBasicMaterial({ color: 0x000000 })
    //     )
    // );
    let dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath( '../examples/js/libs/draco/gltf/' );
    const loader = new GLTFLoader();
    loader.setDRACOLoader( dracoLoader );

    ftm.addFileDownloadListener((result)=>{
        if(result.request_type === 'gltf' && result.category === 'world'){
            loader.parse(result.data[0].data, '', (loaded)=>{
                page.scene.add(loaded.scene);

                loading_panel.sigs.set_visib.dispatch(false);
            });
        }
    });
    ftm.requestFileDownload('gltf', 'world', world_id);

    page.camera.position.set(0,5,7.5);
    const ui_interactable = [ ];
    const interactable = [ ];
    //#region ui
    const canvas = Canvas(page.sigs);
    const main_menu_panel = MainMenuPanel(ui_interactable, canvas, app_sigs, ftm, socket, page);
    canvas.scene.add(main_menu_panel, loading_panel);
    Object.assign(page, { canvas: canvas });
    //#endregion
    //#region input event handlers
    let main_menu_panel_visibility = false;
    const OnKeyDown = (e)=>{
        if(e.code === 'Escape'){
            main_menu_panel_visibility = !main_menu_panel_visibility;
            main_menu_panel.sigs.set_visib.dispatch(main_menu_panel_visibility);
            if(main_menu_panel_visibility){
                ui_pointer.sigs.active.dispatch(true);
                pointer.sigs.active.dispatch(false);
                //client_data.player_obj.sigs.dispose.dispatch();
                page.camera.sigs.dispose.dispatch();
            }
            else{
                ui_pointer.sigs.active.dispatch(false);
                pointer.sigs.active.dispatch(true);
                //client_data.player_obj.sigs.init.dispatch();
                page.camera.sigs.init.dispatch();
            }
        }
    }
    //#endregion
    const OnCreateSuccess = (instance_id)=>{
        console.log('create_success');
    }
    const OnJoinAccept = (world_id)=>{
        client_data.uid = socket.id;
        console.log(client_data.uid);
        app_sigs.change_page.dispatch(1, world_id);
    }
    //#region signal event handlers
    const OnEnter = ()=>{
        socket.on('create-success', OnCreateSuccess);
        socket.on('join-accept', OnJoinAccept);
        main_menu_panel.sigs.set_visib.dispatch(false);
        loading_panel.sigs.set_visib.dispatch(true);
        ui_pointer.sigs.active.dispatch(false);
        
        document.addEventListener('keydown', OnKeyDown);
    }
    const OnExit = ()=>{
        socket.off('create-success', OnCreateSuccess);
        socket.off('join-accept', OnJoinAccept);
        document.removeEventListener('keydown', OnKeyDown);
    }
    //#endregion
    page.sigs.enter.add(OnEnter);
    page.sigs.exit.add(OnExit);

    const pointer = Pointer(page.sigs, page.camera, interactable);
    const ui_pointer = Pointer(page.sigs, canvas.camera, ui_interactable);

    const input_collector = InputCollector(socket, client_data, page.sigs);
    const user_manager = UserManager(socket, client_data, page, input_collector, ftm);

    return page;
}

export { WorldPage }
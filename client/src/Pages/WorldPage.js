import { Color, LineSegments, LineBasicMaterial, Vector3 } from 'three'
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js'
import { Page } from './Page.js'
import { Pointer } from './Invokers/Pointer.js'
import { UserManager } from './Comms/UserManager.js'
import { InputCollector } from './Comms/InputCollector.js'
import { MyPeer } from '../MyPeer.js'

import { Canvas } from './UI/Canvas.js'
import { MainMenuPanel } from './UI/WorldPage/MainMenuPanel.js'

const WorldPage = (socket, client_data, app_sigs, ftm, world_id)=>{
    console.log(client_data.uid);
    const three_canvas = document.getElementById('three_canvas');
    
    const page = Page();
    page.scene.background = new Color(0xFFFFFF);
    page.scene.add(
        new LineSegments(
            new BoxLineGeometry(10, 10, 10, 10, 10, 10).translate(0, 5, 0),
            new LineBasicMaterial({ color: 0x000000 })
        )
    );
    page.camera.position.set(0,5,7.5);
    const ui_interactable = [ ];
    const interactable = [ ];
    //#region ui
    const canvas = Canvas(page.sigs);
    const main_menu_panel = MainMenuPanel(ui_interactable, canvas, app_sigs, ftm, socket, page);
    canvas.scene.add(main_menu_panel);
    Object.assign(page, { canvas: canvas });
    //#endregion
    //#region input event handlers
    let main_menu_panel_visibility = false;
    const OnKeyDown = (e)=>{
        if(e.code === 'KeyQ'){
            main_menu_panel_visibility = !main_menu_panel_visibility;
            main_menu_panel.sigs.set_visib.dispatch(main_menu_panel_visibility);
            if(main_menu_panel_visibility){
                ui_pointer.sigs.active.dispatch(true);
                pointer.sigs.active.dispatch(false);
                client_data.player_obj.sigs.dispose.dispatch();
                page.camera.sigs.dispose.dispatch();
            }
            else{
                ui_pointer.sigs.active.dispatch(false);
                pointer.sigs.active.dispatch(true);
                client_data.player_obj.sigs.init.dispatch();
                page.camera.sigs.init.dispatch();
            }
        }
    }
    //#endregion
    //#region signal event handlers
    const OnEnter = ()=>{
        main_menu_panel.sigs.set_visib.dispatch(false);
        ui_pointer.sigs.active.dispatch(false);

        document.addEventListener('keydown', OnKeyDown);
    }
    const OnExit = ()=>{
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
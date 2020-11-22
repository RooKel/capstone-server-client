import { Color, LineSegments, LineBasicMaterial } from 'three'
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js'
import { Page } from './Page.js'
import { Pointer } from './Invokers/Pointer.js'

import { Canvas } from './UI/Canvas.js'
import { StartPanel } from './UI/StartPage/StartPanel.js'
import { MainMenuPanel } from './UI/StartPage/MainMenuPanel.js'

const StartPage = (socket, client_data, app_sigs, ftm)=>{
    const page = Page();
    page.scene.background = new Color(0xFFFFFF);
    page.scene.add(
        new LineSegments(
            new BoxLineGeometry(10, 10, 10, 10, 10, 10).translate(0, 5, 0),
            new LineBasicMaterial({ color: 0x000000 })
        )
    );
    page.camera.position.set(0,1,4);
    const ui_interactable = [ ];
    //#region ui
    const canvas = Canvas(page.sigs);
    const start_panel = StartPanel(ui_interactable, socket);
    const main_menu_panel = MainMenuPanel(ui_interactable, canvas, app_sigs, ftm, socket, page);
    canvas.scene.add(start_panel, main_menu_panel);
    Object.assign(page, { canvas: canvas });
    //#endregion
    const pointer = Pointer(page.sigs, canvas.camera, ui_interactable);
    //#region socket event handlers
    const OnCreateSuccess = (instance_id)=>{
        socket.emit('join-instance', instance_id);
    }
    const OnJoinAccept = (socket_id)=>{
        client_data.uid = socket_id;
        app_sigs.create_inst.dispatch();
        app_sigs.change_page.dispatch(1);
    }
    //#endregion
    //#region signal event handlers
    const OnEnter = ()=>{
        socket.on('create-success', OnCreateSuccess);
        socket.on('join-accept', OnJoinAccept);
        //main_menu_panel.sigs.set_visib.dispatch(false);
        start_panel.sigs.set_visib.dispatch(false);
    }
    const OnExit = ()=>{
        socket.off('create-success', OnCreateSuccess);
        socket.on('join-accept', OnJoinAccept);
    }
    //#endregion
    page.sigs.enter.add(OnEnter);
    page.sigs.exit.add(OnExit);
    return page;
}

export { StartPage }
import Page from './Page.js'
import Canvas from './UI/Canvas.js'
import StartPgMainMenu from './UI/StartPgMainMenu.js'
import Pointer from './Pointer.js'
import { Color } from 'three'

const StartPage = (socket, client_data, app_sigs)=>{
    const page = Page();
    page.scene.background = new Color(0xFFFFFF);
    const objs_to_test = [ ];
    const canvas = Canvas(page.sigs.update);
    const start_pg_main_menu = StartPgMainMenu(objs_to_test, socket);
    canvas.scene.add(start_pg_main_menu);
    Object.assign(page, { canvas: canvas });
    const pointer = Pointer(page.sigs, page.camera, objs_to_test);
    //#region socket event handlers
    const OnLoginAccept = (uid)=>{
        //console.log('StartPage: login_accept');
        client_data.uid = uid;
        app_sigs.create_world.dispatch('_4pqz5yppk');
    }
    //#endregion
    //#region signals event handlers
    const OnEnter = ()=>{
        //console.log('StartPage: enter');
        //socket.on('login-accept', OnLoginAccept);
    }
    const OnExit = ()=>{
        //console.log('StartPage: exit');
        //socket.off('login-accept', OnLoginAccept);
    }
    const OnUpdate = ()=>{
        //console.log('StartPage: update');
    }
    //#endregion
    page.sigs.enter.add(OnEnter);
    page.sigs.exit.add(OnExit);
    page.sigs.update.add(OnUpdate);
    return page;
}

export default StartPage
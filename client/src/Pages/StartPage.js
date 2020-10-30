import * as THREE from 'three'
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js'

import Page from './Page.js'
import EventLink from '../EventLink.js'
import * as CTRL from '../Controllers/Import.js'

const StartPage = (app_event_link, socket, client_data)=>{
    const page = Page();
    const ctrl_manager = CTRL.CtrlManager(socket, client_data);
    ctrl_manager.AddCtrl(CTRL.QLogin(ctrl_manager.inputs));
    //#region init scene & camera
    page.scene.background = new THREE.Color(0x000000);
    page.scene.add(
        new THREE.LineSegments(
            new BoxLineGeometry( 10, 10, 10, 10, 10, 10 ).translate( 0, 5, 0 ),
            new THREE.LineBasicMaterial( { color: 0xFFFFFF } )
        )
    );
    page.camera.position.set(0,1,5);
    //#endregion
    //#region socket event handlers
    const OnLoginAccept = (uid)=>{
        client_data.uid = uid;
        app_event_link.Invoke('change_page', 1);
    }
    //#endregion
    //#region event link event handlers
    const OnEnter = ()=>{
        socket.on('login_accept', OnLoginAccept);
    }
    const OnUpdate = (delta)=>{
        
    }
    const OnExit = ()=>{
        socket.off('login_accept', OnLoginAccept);
    }
    //#endregion
    const event_link = EventLink([
        { name:'enter', handler:OnEnter },
        { name:'update', handler:OnUpdate },
        { name:'exit', handler:OnExit }
    ]);
    event_link.AddLink(ctrl_manager.event_link);
    Object.assign(page, { event_link:event_link });
    return page;
}

export default StartPage
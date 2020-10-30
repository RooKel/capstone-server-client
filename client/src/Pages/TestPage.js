import * as THREE from 'three'
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js'

import Page from './Page.js'
import EventLink from '../EventLink.js'
import * as CTRL from '../Controllers/Import.js'
import UserManager from '../UserManager.js'

const TestPage = (app_event_link, socket, client_data)=>{
    const page = Page();
    const ctrl_manager = CTRL.CtrlManager(socket, client_data);
    //#region init scene & camera
    page.scene.background = new THREE.Color(0xFFFFFF);
    page.scene.add(
        new THREE.LineSegments(
            new BoxLineGeometry( 10, 10, 10, 10, 10, 10 ).translate( 0, 5, 0 ),
            new THREE.LineBasicMaterial( { color: 0x000000 } )
        )
    );
    page.camera.position.set(0,1,5);
    const cam_ctrl = CTRL.FPCameraCtrl(socket, client_data.uid, page.camera, ctrl_manager.inputs);
    ctrl_manager.AddCtrl(cam_ctrl);
    //#endregion
    //#region event link event handlers
    const OnEnter = ()=>{
        
    }
    const OnUpdate = (delta)=>{
        
    }
    const OnExit = ()=>{
        
    }
    //#endregion
    const event_link = EventLink([
        { name:'enter', handler:OnEnter },
        { name:'update', handler:OnUpdate },
        { name:'exit', handler:OnExit }
    ]);
    event_link.AddLink(ctrl_manager.event_link);
    event_link.AddLink(UserManager(socket, client_data, page.scene, ctrl_manager).event_link);
    Object.assign(page, { event_link:event_link });
    return page;
}

export default TestPage
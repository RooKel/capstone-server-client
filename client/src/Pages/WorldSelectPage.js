import EventLink from '../EventLink.js'
import Page from './Page.js'
import * as THREE from 'three'
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js'
import Pointer from '../Pointer.js'
import TMUI from 'three-mesh-ui'

import RobotGLTF from '../../assets/models/Robot.gltf'
import WorldSelectPanel from "./UI/WorldSelectPanel.js";

const WorldSelectPage = (socket, client_data, app_event_link)=>{
    const page = Page();
    const ui_objs = [ ];
    const ui_pointer = Pointer(page.ui_manager.camera, ui_objs);
    //#region init page
    page.scene.background = new THREE.Color(0x000000);
    page.scene.add(
        new THREE.LineSegments(
            new BoxLineGeometry( 10, 10, 10, 10, 10, 10 ).translate( 0, 5, 0 ),
            new THREE.LineBasicMaterial( { color: 0xFFFFFF } )
        )
    );
    page.camera.position.set(0,1,4);
    page.ui_manager.AddUIElem(WorldSelectPanel(ui_objs, socket));
    //#endregion

    //#region event link event handlers
    const OnEnter = ()=>{
        //console.log('StartPage: enter');
    }
    const OnExit = ()=>{
        //console.log('StartPage: exit');
    }
    const OnUpdate = (delta)=>{
        TMUI.update();
    }
    //#endregion
    const event_link = EventLink([
        { name:'enter', handler:OnEnter },
        { name:'exit', handler:OnExit },
        { name:'update', handler:OnUpdate }
    ]);
    event_link.AddLink(page.scene.event_link);
    event_link.AddLink(page.camera.event_link);
    event_link.AddLink(ui_pointer.event_link);
    event_link.AddLink(page.ui_manager.event_link);

    Object.assign(page, { event_link: event_link });
    return page;
}

export default WorldSelectPage

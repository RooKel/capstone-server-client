import Page from './Page.js'
import EventLink from '../EventLink.js'
import InputCollector from '../InputCollector.js'
import UserManager from '../UserManager.js'
import * as CTRL from '../Controllers/Import.js'
import * as THREE from 'three'
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js'

const TestStartPage = (socket, client_data, app_event_link)=>{
    const page = Page();
    page.scene.background = new THREE.Color(0x000000);
    page.scene.add(
        new THREE.LineSegments(
            new BoxLineGeometry( 10, 10, 10, 10, 10, 10 ).translate( 0, 5, 0 ),
            new THREE.LineBasicMaterial( { color: 0xFFFFFF } )
        )
    );
    page.camera.position.set(0,1,5);
    const input_collector = InputCollector(socket, client_data);
    //#region socket event handler
    const OnLoginAccept = (uid)=>{
        client_data.uid = uid;
        app_event_link.Invoke('change_page', 1);
    }
    //#endregion
    //#region event link event handlers
    const OnEnter = ()=>{
        console.log('TestStartPage: enter');
        
        const login = CTRL.QLogin(input_collector);
        login.event_link.Invoke('enter');
        page.scene.event_link.AddLink(login.event_link);

        socket.on('login_accept', OnLoginAccept);
    }
    const OnUpdate = (delta)=>{

    }
    const OnExit = ()=>{
        console.log('TestStartPage: exit');

        socket.off('login_accept', OnLoginAccept);
    }
    //#endregion
    const event_link = EventLink([
        {name:'enter',handler:OnEnter},
        {name:'update',handler:OnUpdate},
        {name:'exit',handler:OnExit}
    ]);
    event_link.AddLink(page.scene.event_link);
    event_link.AddLink(page.camera.event_link);
    event_link.AddLink(input_collector.event_link);
    Object.assign(page, {event_link:event_link});
    return page;
}

const TestWorldPage = (socket, client_data, app_event_link)=>{
    const page = Page();
    page.scene.background = new THREE.Color(0xFFFFFF);
    page.scene.add(
        new THREE.LineSegments(
            new BoxLineGeometry( 10, 10, 10, 10, 10, 10 ).translate( 0, 5, 0 ),
            new THREE.LineBasicMaterial( { color: 0x000000 } )
        )
    );
    page.camera.position.set(0,1,5);
    const input_collector = InputCollector(socket, client_data);
    const camera_ctrl = CTRL.TestCameraCtrl(socket, client_data, page.camera, input_collector);
    page.camera.event_link.AddLink(camera_ctrl.event_link);
    const user_manager = UserManager(socket, client_data, page.scene, camera_ctrl, input_collector);
    //#region event link event handlers
    const OnEnter = ()=>{
        console.log('TestWorldPage: enter');
    }
    const OnUpdate = (delta)=>{

    }
    const OnExit = ()=>{
        console.log('TestWorldPage: exit');
    }
    //#endregion
    const event_link = EventLink([
        {name:'enter',handler:OnEnter},
        {name:'update',handler:OnUpdate},
        {name:'exit',handler:OnExit},
    ]);
    event_link.AddLink(page.scene.event_link);
    event_link.AddLink(page.camera.event_link);
    event_link.AddLink(user_manager.event_link);
    event_link.AddLink(input_collector.event_link);
    Object.assign(page, {event_link:event_link});
    return page;
}

export {
    TestStartPage,
    TestWorldPage
}
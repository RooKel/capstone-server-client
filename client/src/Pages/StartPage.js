import * as THREE from 'three'
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js'

import Page from './Page.js'
import * as EVENTS from '../Events/Import.js'

const StartPage = (app_event_link, socket, client_data)=>{
    let page = Page();
    //#region init scene
    page.scene.background = new THREE.Color(0x000000);
    page.scene.add(
        new THREE.LineSegments(
            new BoxLineGeometry( 10, 10, 10, 10, 10, 10 ).translate( 0, 5, 0 ),
            new THREE.LineBasicMaterial( { color: 0xFFFFFF } )
        )
    );
    page.scene.add(new THREE.DirectionalLight(0xFFFFFF, 5));
    //#endregion
    //#region init camera
    page.camera.position.set(0,1,5);
    //#endregion
    //#region init event link
    //#region socket event handlers
    const OnLoginAccept = (uid)=>{
        client_data.uid = uid;
        app_event_link.Invoke('change_page', 1);
    }
    //#endregion
    //#region input event handlers
    const OnKeyDown = (e)=>{
        if(e.code === 'KeyQ')
            socket.emit('login', true);
    }
    //#endregion
    //#region event link event handlers
    const OnEnter = ()=>{
        console.log('StartPage: enter');
        socket.on('login_accept', OnLoginAccept);
        document.addEventListener('keydown', OnKeyDown);
    }
    const OnUpdate = (delta)=>{}
    const OnExit = ()=>{
        console.log('StartPage: exit');
        socket.off('login_accept', OnLoginAccept);
        document.removeEventListener('keydown', OnKeyDown);
    }
    //#endregion
    const event_link = EVENTS.EventLink([
        { name:'enter', handler:OnEnter },
        { name:'update', handler:OnUpdate },
        { name:'exit', handler:OnExit }
    ]);
    event_link.AddLink(page.scene.event_link);
    event_link.AddLink(page.camera.event_link);
    //#endregion
    Object.assign(page, { event_link:event_link });
    return page;
}

export default StartPage
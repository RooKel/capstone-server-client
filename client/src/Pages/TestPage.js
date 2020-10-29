import * as THREE from 'three'
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js'

import Page from './Page.js'
import * as EVENTS from '../Events/Import.js'
import * as SYNC from '../Synchronize/Import.js'

const TestPage = (app_event_link, socket, client_data)=>{
    let page = Page();
    //#region init scene
    page.scene.background = new THREE.Color(0xFFFFFF);
    page.scene.add(
        new THREE.LineSegments(
            new BoxLineGeometry( 10, 10, 10, 10, 10, 10 ).translate( 0, 5, 0 ),
            new THREE.LineBasicMaterial( { color: 0x000000 } )
        )
    );
    page.scene.add(new THREE.DirectionalLight(0xFFFFFF, 5));
    //#endregion
    //#region init camera
    page.camera.position.set(0,1,5);
    //#endregion
    //#region init event link
    //#region event link event handlers
    const OnEnter = ()=>{
        console.log('TestPage: enter');
    }
    const OnUpdate = (delta)=>{}
    const OnExit = ()=>{
        console.log('TestPage: exit');
    }
    //#endregion
    const event_link = EVENTS.EventLink([
        { name:'enter', handler:OnEnter },
        { name:'update', handler:OnUpdate },
        { name:'exit', handler:OnExit }
    ]);
    event_link.AddLink((SYNC.SyncObjFactory(socket, client_data, page.scene)).event_link);
    event_link.AddLink(page.scene.event_link);
    event_link.AddLink(page.camera.event_link);
    //#endregion
    Object.assign(page, { event_link:event_link });
    return page;
}

export default TestPage
import * as THREE from 'three'
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js'
import * as EVENTS from '../FastImports/Events.js'
import * as CTRLS from '../FastImports/Controllers.js'
import Page from './Page.js'

const StartPageFactory = (app_event_link, socket, client_data)=>{
    const page = Page();
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
    const OnLoginAccept = (uid)=>{
        client_data.uid = uid;
        app_event_link.Invoke('change_page', 1);
    }
    const OnKeyDown = (e)=>{
        if(e.code === 'KeyQ')
            socket.emit('login', true);
    }
    const OnEnter = ()=>{
        //console.log('StartPage: enter');
        document.addEventListener('keydown', OnKeyDown);
        socket.on('login_accept', OnLoginAccept);
    }
    const OnUpdate = (args)=>{
        //console.log('StartPage: update');
    }
    const OnExit = ()=>{
        //console.log('StartPage: exit');
        document.removeEventListener('keydown', OnKeyDown);
        socket.off('login_accept', OnLoginAccept);
    }
    const event_link = EVENTS.EventLink([
        { name:'enter', handler:OnEnter },
        { name:'update', handler:OnUpdate },
        { name:'exit', handler:OnExit }
    ]);
    event_link.AddLink(page.scene.event_link);
    event_link.AddLink(page.camera.event_link);
    Object.assign(page, {
        event_link: event_link
    });
    //#endregion
    return page;
}

export default StartPageFactory
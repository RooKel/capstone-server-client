//#region imports
import * as THREE from 'three'
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js'

import SyncObjs from '../ClassExtentions/SyncObjs'
import InputManager from '../ClassExtentions/InputManager.js'
import TargetCamera from '../ClassExtentions/TargetCamera.js'
//#endregion

const TestPage = (page, socket, events, client_data)=>{
    //#region socket event handlers
    
    //#endregion
    //#region page event handlers
    const OnEnter = ()=>{
        //#region register socket event handlers
        
        //#endregion
    }
    const OnExit = ()=>{
        //#region deregister socket event handlers
        
        //#endregion
    }
    const OnUpdate = (delta)=>{
        
    }
    //#endregion
    //#region register page event handlers
    page.events.on('enter', OnEnter);
    page.events.on('exit', OnExit);
    page.events.on('update', OnUpdate);
    //#endregion
    
    //#region init scene
    page.scene.background = new THREE.Color(0xFFFFFF);
    page.scene.add(
        new THREE.LineSegments(
            new BoxLineGeometry( 10, 10, 10, 10, 10, 10 ).translate( 0, 5, 0 ),
            new THREE.LineBasicMaterial( { color: 0x000000 } )
        )
    );
    page.scene.add(new THREE.DirectionalLight(0xFFFFFF, 5));
    page.camera.position.set(0,1,5);
    //#endregion
    //#region extend page
    Object.assign(page, InputManager(page, socket, client_data));
    Object.assign(page, SyncObjs(page, socket, client_data));
    //Object.assign(page.camera, TargetCamera(page));
    //#endregion
    return page;
}

export default TestPage
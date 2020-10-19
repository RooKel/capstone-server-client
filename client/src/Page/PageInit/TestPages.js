//#region imports
import * as THREE from 'three'
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js'
import EventChain from '../Events/EventChain.js'
import SyncObj from '../Controls/SyncObj.js'
//#endregion

const TestStartPage = (app_event_chain, page, socket, client_data)=>{
    //#region event handlers
    const OnKeyDown = (e)=>{
        if(e.code === 'KeyQ')
            socket.emit('login', true);
    }
    const OnLoginAccept = (uid)=>{
        client_data.uid = uid;
        app_event_chain.Invoke('change_page', 1);
    }
    //#endregion
    const OnStart = ()=>{
        console.log('TestStartPage: start');
        document.addEventListener('keydown', OnKeyDown);
        socket.on('login_accept', OnLoginAccept);
    }
    const OnDispose = ()=>{
        console.log('TestStartPage: dispose');
        document.removeEventListener('keydown',OnKeyDown);
        socket.off('login_accept', OnLoginAccept);
    }
    const event_chain = EventChain([
        { name:'start', handler:OnStart },
        { name:'dispose', handler:OnDispose }
    ]);
    return {
        event_chain: event_chain,
    }
}

const TestMainPage = (app_event_chain, page, socket, client_data)=>{
    const sync_objs = { };
    //#region event handlers
    const AddSyncObj = (uid, data)=>{
        let geometry = new THREE.BoxGeometry(1,1,1);
        let material = new THREE.MeshBasicMaterial({color:0xFF0000});
        let cube = new THREE.Mesh(geometry, material);
        cube.position.x = data.x;
        cube.position.y = data.y;
        cube.position.z = 0;
        page.scene.add(cube);
        
        let sync = SyncObj(uid, data);
        sync.event_chain.Invoke('start');
        page.scene.event_chain.AddChildren(sync);
        
        let sync_obj = {
            obj: cube,
            sync: sync
        };
        sync_objs[uid] = sync_obj;
    }
    const RemoveSyncObj = (uid)=>{
        page.scene.scene.remove(sync_objs[uid].obj);
        delete sync_objs[uid].obj;
        sync_objs[uid].sync.event_chain.Invoke('dispose');
        delete sync_objs[uid].sync;
        delete sync_objs[uid];
    }
    //#endregion
    const OnStart = ()=>{
        console.log('TestMainPage: start');
        //#region init scene & camera
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
        socket.on('entity_data', AddSyncObj);
        socket.on('other_joined', AddSyncObj);
        socket.on('delete_entity', RemoveSyncObj);

    }
    const OnDispose = ()=>{
        console.log('TestMainPage: dispose');
        socket.off('entity_data', AddSyncObj);
        socket.off('other_joined', AddSyncObj);
        socket.off('delete_entity', RemoveSyncObj);
    }
    const event_chain = EventChain([
        { name:'start', handler:OnStart },
        { name:'dispose', handler:OnDispose }
    ]);
    return {
        event_chain: event_chain,
    }
}

export { TestStartPage, TestMainPage }
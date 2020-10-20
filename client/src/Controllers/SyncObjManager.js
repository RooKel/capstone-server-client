import Synchronize from './Synchronize.js'
import * as EVENTS from '../FastImports/Events.js'
import * as THREE from 'three'
import SynchronizePlayer from './SynchronizePlayer.js';

const SyncObjManager = (socket, client_data, scene)=>{
    const sync_objs = { };
    //#region socket event handlers
    const AddSyncObj = (uid, data)=>{
        let geometry = new THREE.BoxGeometry(1,1,1);
        let material = new THREE.MeshBasicMaterial({color:0xFF0000});
        let cube = new THREE.Mesh(geometry, material);
        cube.position.x = data.x;
        cube.position.y = data.y;
        scene.add(cube);
        sync_objs[uid] = cube;
        
        if(uid === client_data.uid)
            Object.assign(sync_objs[uid], SynchronizePlayer(socket, uid, data, sync_objs[uid]));
        else
            Object.assign(sync_objs[uid], Synchronize(socket, uid, data, sync_objs[uid]));
        
        event_link.AddLink(sync_objs[uid].event_link);
        sync_objs[uid].event_link.Invoke('enter');
    }
    const RemSyncObj = (uid)=>{
        scene.remove(sync_objs[uid]);
        sync_objs[uid].event_link.Invoke('dispose');
        delete sync_objs[uid];
    }
    //#endregion
    //#region init event link
    const OnEnter = ()=>{
        socket.on('entity_data', AddSyncObj);
        socket.on('other_joined', AddSyncObj);
        socket.on('delete_entity', RemSyncObj);
    }
    const OnExit = ()=>{
        socket.off('entity_data', AddSyncObj);
        socket.off('other_joined', AddSyncObj);
        socket.off('delete_entity', RemSyncObj);
        for(let key in sync_objs){
            RemSyncObj(key);
        }
    }
    const event_link = EVENTS.EventLink([
        { name:'enter', handler:OnEnter },
        { name:'exit', handler:OnExit }
    ]);
    //#endregion
    return {
        event_link: event_link
    }
}

export default SyncObjManager
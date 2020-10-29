import * as THREE from 'three'

import Player from './Player.js'
import Others from './Others.js'
import * as EVENTS from '../Events/Import.js'

const SyncObjFactory = (socket, client_data, scene)=>{
    //#region init
    const sync_objs = { };
    //#region init event link
    //#region socket event handler
    const AddUser = (uid, data)=>{
        let geometry = new THREE.BoxGeometry(1,1,1);
        let material = new THREE.MeshBasicMaterial({color:0xFF0000});
        let cube = new THREE.Mesh(geometry, material);
        cube.position.x = data.x;
        cube.position.y = data.y;
        scene.add(cube);
        sync_objs[uid] = cube;

        if(client_data.uid === uid)
            Object.assign(sync_objs[uid], Player(socket,uid,sync_objs[uid],data));
        else 
            Object.assign(sync_objs[uid], Others(socket,uid,sync_objs[uid],data));
        sync_objs[uid].event_link.Invoke('init');

        scene.event_link.AddLink(sync_objs[uid].event_link);
    }
    const RemUser = (uid)=>{
        scene.remove(sync_objs[uid]);
        sync_objs[uid].event_link.Invoke('dispose');
        delete sync_objs[uid];
    }
    //#endregion
    //#region event link event handler
    const OnEnter = ()=>{
        socket.on('entity_data', AddUser);
        socket.on('other_joined', AddUser);
        socket.on('delete_entity', RemUser);
    }
    const OnExit = ()=>{
        socket.off('entity_data', AddUser);
        socket.off('other_joined', AddUser);
        socket.off('delete_entity', RemUser);
    }
    //#endregion
    const event_link = EVENTS.EventLink([
        { name:'enter', handler:OnEnter },
        { name:'exit', handler:OnExit }
    ]);
    //#endregion
    //#endregion
    return {
        event_link: event_link
    }
}

export default SyncObjFactory
import * as THREE from 'three'

import EventLink from './EventLink.js'
import * as CTRL from './Controllers/Import.js'

const UserManager = (socket, client_data, scene, ctrl_manager)=>{
    const sync_objs = { };
    //#region socket event handlers
    const AddUser = (uid, data)=>{
        let geometry = new THREE.BoxGeometry(1,1,1);
        let material = new THREE.MeshBasicMaterial({color:0xFF0000});
        let cube = new THREE.Mesh(geometry, material);
        cube.position.x = data.x;
        cube.position.y = data.y;
        scene.add(cube);

        let ctrl = undefined;
        if(uid === client_data.uid)
            ctrl = CTRL.PlayerCtrl(socket, uid, cube, data, ctrl_manager.inputs);
        else
            ctrl = CTRL.OtherUsersCtrl(socket, uid, cube, data);
        ctrl_manager.AddCtrl(ctrl);
        
        sync_objs[uid] = { model:cube, ctrl:ctrl };
    }
    const RemUser = (uid)=>{
        scene.remove(sync_objs[uid].model);
        ctrl_manager.RemCtrl(sync_objs[uid].ctrl);
        delete sync_objs[uid];
    }
    //#endregion
    //#region event link event handlers
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
    const event_link = EventLink([
        { name:'enter', handler:OnEnter },
        { name:'exit', handler:OnExit }
    ]);
    return {
        event_link: event_link
    }
}

export default UserManager
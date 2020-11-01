import * as THREE from 'three'
import EventLink from './EventLink.js'
import * as CTRL from './Controllers/Import.js'

const UserManager = (socket, client_data, scene, camera_ctrl, camera, input_collector)=>{
    const users = { };
    //#region socket event handler
    const AddUser = (uid, data)=>{
        let geometry = new THREE.BoxGeometry(1,1,1);
        let material = new THREE.MeshBasicMaterial({color:0xFF0000});
        let cube = new THREE.Mesh(geometry, material);
        cube.position.x = data.x;
        cube.position.y = data.y;
        if(uid !== client_data.uid)
            Object.assign(cube, CTRL.OthersCtrl(socket, uid, data, cube));
        else {
            Object.assign(cube, CTRL.PlayerCtrl(socket, uid, data, cube, camera, input_collector));
            camera_ctrl.ChangeTarget(cube, new THREE.Vector3(0,1,0));
        }
        cube.event_link.Invoke('enter');
        users[uid] = cube;

        scene.add(cube);
        scene.event_link.AddLink(cube.event_link);
    }
    const RemUser = (uid)=>{
        scene.remove(users[uid]);
        users[uid].event_link.Invoke('exit');
        delete users[uid];
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
        {name:'enter',handler:OnEnter},
        {name:'exit',handler:OnExit}
    ]);
    return {
        event_link: event_link
    }
}

export default UserManager
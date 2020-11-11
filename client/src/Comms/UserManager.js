import EventLink from '../EventLink.js'
import { BoxGeometry, MeshBasicMaterial, Mesh } from 'three'
import PlayerCtrl from '../Controllers/PlayerCtrl.js'
import OtherUsersCtrl from '../Controllers/OtherUsersCtrl.js'
import * as THREE from 'three'
import TestCameraCtrl from '../Controllers/TestCameraCtrl.js'

const UserManager = (socket, client_data, scene, camera, input_collector)=>{
    const users = { };
    //#region socket event handlers
    const AddUser = (uid, data)=>{
        let geometry = new BoxGeometry(1,1,1);
        let material = new MeshBasicMaterial({color:0xFF0000});
        let cube = new Mesh(geometry, material);
        cube.position.x = data.x;
        cube.position.y = 1;
        cube.position.z = data.y;
        if(uid !== client_data.uid)
            Object.assign(cube, OtherUsersCtrl(socket, uid, data, cube));
        else {
            Object.assign(cube, PlayerCtrl(socket, uid, data, cube, camera, input_collector));
            const camera_ctrl = TestCameraCtrl(socket, client_data, data, camera, input_collector);
            camera.event_link.AddLink(camera_ctrl.event_link);
            camera_ctrl.event_link.Invoke('enter');
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
    //#region  event link event handlers
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
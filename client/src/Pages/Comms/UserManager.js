import { BoxGeometry, MeshBasicMaterial, Mesh, Vector3, Frustum, Group, Quaternion } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import { PlayerMovementCtrl } from '../Controllers/PlayerMovementCtrl.js'
import { OthUserMovementCtrl } from '../Controllers/OthUserMovementCtrl.js'
import { CameraCtrl } from '../Controllers/CameraCtrl.js'
import { AvatarCtrl } from '../Controllers/AvatarCtrl.js'
import { PlayerRotationCtrl } from '../Controllers/PlayerRotationCtrl.js'
import { OthUserRotationCtrl } from '../Controllers/OthUserRotationCtrl.js'

const UserManager = (socket, client_data, page, input_collector, ftm)=>{
    const users = { };
    const AddUser = (uid, data)=>{
        let group = new Group();
        let geometry = new BoxGeometry(1,1,1);
        let material = new MeshBasicMaterial({color:0xFF0000});
        let cube = new Mesh(geometry, material);
        cube.name = 'default_mesh';
        group.add(cube);
        group.position.set(data.x, 0, data.y);
        group.quaternion.set(
            data.quaternion._x,
            data.quaternion._y,
            data.quaternion._z,
            data.quaternion._w
        );
        console.log(group);
        Object.assign(group, { sigs: { 
            init: new signals.Signal(),
            dispose: new signals.Signal()
        }});
        const anim_ctrl = AvatarCtrl(uid, group, socket, ftm, page.sigs, page.camera);
        if(uid === client_data.uid){
            PlayerMovementCtrl(socket, uid, data, group, page.camera, input_collector, page.sigs, anim_ctrl);
            PlayerRotationCtrl(page.sigs, socket, group, data);
            Object.assign(page.camera, { sigs: { 
                init: new signals.Signal(),
                dispose: new signals.Signal(),
                change_target: new signals.Signal()
            }});
            const cam_ctrl = CameraCtrl(socket, client_data, data, page.camera, input_collector, page.sigs);
            page.camera.sigs.change_target.dispatch(group, new Vector3(0,1,0));
            page.camera.sigs.init.dispatch();
            client_data.player_obj = group;
        }
        else{
            OthUserMovementCtrl(socket, uid, data, group, page.sigs, anim_ctrl);
            OthUserRotationCtrl(page.sigs, socket, group, data);
        }
        users[uid] = group;
        users[uid].sigs.init.dispatch();
        page.scene.add(group);
    }
    const RemUser = (uid)=>{
        users[uid].sigs.dispose.dispatch();
        page.scene.remove(users[uid]);
        delete users[uid];
    }
    //#region signal event handlers
    const OnEnter = ()=>{
        socket.on('initial-entities-data', AddUser);
        socket.on('other-join', AddUser);
        socket.on('disconnected', RemUser);
    }
    const OnExit = ()=>{
        socket.off('initial-entities-data', AddUser);
        socket.off('other-join', AddUser);
        socket.off('disconnected', RemUser);
        for(let i in users){
            users[i].sigs.dispose.dispatch();
            delete users[i];
        }
    }
    //#endregion
    page.sigs.enter.add(OnEnter);
    page.sigs.exit.add(OnExit);
}

export { UserManager }
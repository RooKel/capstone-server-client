import {Group, BoxGeometry, MeshBasicMaterial, Mesh, Vector3, Gyroscope} from 'three'
import {AvatarCtrl} from '../Controllers/AvatarCtrl.js'
import {InputCollector} from './InputCollector.js'
import {PlayerMovementCtrl} from '../Controllers/PlayerMovementCtrl.js'
import {PlayerRotationCtrl} from '../Controllers/PlayerRotationCtrl.js'
import {OthUserMovementCtrl} from '../Controllers/OthUserMovementCtrl.js'
import {OthUserRotationCtrl} from '../Controllers/OthUserRotationCtrl.js'
import {CameraCtrl} from '../Controllers/CameraCtrl.js'

const UserManager = (socket, ftm, client_data, page)=>{
    const users = { };
    const input_collector = InputCollector(socket, client_data, page.sigs);
    //#region socket event handlers
    const AddUser = (uid, data)=>{
        let group = new Group();
        group.position.set(data.x, 0, data.y);
        group.quaternion.set(
            data.quaternion._x,
            data.quaternion._y,
            data.quaternion._z,
            data.quaternion._w
        );
        let geometry = new BoxGeometry(1,1,1);
        let material = new MeshBasicMaterial({color:0xFF0000});
        let cube = new Mesh(geometry, material);
        group.add(cube);        
        Object.assign(group, { sigs: { 
            init: new signals.Signal(),
            dispose: new signals.Signal()
        }});
        const avatar_ctrl = AvatarCtrl(group, socket, uid, ftm, page, data, client_data);
        if(client_data.uid === uid){
            PlayerMovementCtrl(socket, uid, data, group, page.camera, input_collector, page.sigs, avatar_ctrl);
            PlayerRotationCtrl(page.sigs, socket, group, data, uid, page.camera);
            Object.assign(page.camera, { sigs: { 
                init: new signals.Signal(),
                dispose: new signals.Signal(),
                change_target: new signals.Signal()
            }});
            const cam_ctrl = CameraCtrl(socket, client_data, Object.assign({}, data), page.camera, input_collector, page.sigs);
            page.camera.sigs.change_target.dispatch(group, new Vector3(0,1,0));
            //page.camera.sigs.init.dispatch();
            client_data.player_obj = group;
        }
        else{
            OthUserMovementCtrl(socket, uid, Object.assign({}, data), group, page.sigs, avatar_ctrl);
            OthUserRotationCtrl(page.sigs, socket, group, Object.assign({}, data), uid);
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
    //#endregion
    page.sigs.enter.add(()=>{
        socket.on('initial-entities-data', AddUser);
        socket.on('other-join', AddUser);
        socket.on('disconnected', RemUser);
    });
    page.sigs.exit.add(()=>{
        socket.off('initial-entities-data', AddUser);
        socket.off('other-join', AddUser);
        socket.off('disconnected', RemUser);
        input_collector.Active(false);
        for(let i in users){
            users[i].sigs.dispose.dispatch();
            delete users[i];
        }
    });
}

export {UserManager}
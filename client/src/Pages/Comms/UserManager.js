import { BoxGeometry, MeshBasicMaterial, Mesh, Vector3 } from 'three'

import { PlayerMovementCtrl } from '../Controllers/PlayerMovementCtrl.js'
import { CameraCtrl } from '../Controllers/CameraCtrl.js'
import { OthUserMovementCtrl } from '../Controllers/OthUserMovementCtrl.js'

const UserManager = (socket, client_data, page, input_collector)=>{
    const users = { };
    const AddUser = (uid, data)=>{
        let geometry = new BoxGeometry(1,1,1);
        let material = new MeshBasicMaterial({color:0xFF0000});
        let cube = new Mesh(geometry, material);
        cube.position.set(data.x, 1, data.y);

        Object.assign(cube, { sigs: {
            init: new signals.Signal(),
            dispose: new signals.Signal()
        }});
        if(uid === client_data.uid){
            PlayerMovementCtrl(socket, uid, data, cube, page.camera, input_collector, page.sigs);
            Object.assign(page.camera, { sigs: {
                init: new signals.Signal(),
                dispose: new signals.Signal()
            }});
            const cam_ctrl = CameraCtrl(socket, client_data, data, page.camera, input_collector, page.sigs);
            cam_ctrl.ChangeTarget(cube, new Vector3(0,1,0));
            page.camera.sigs.init.dispatch();
            client_data.player_obj = cube;
        }
        else{
            OthUserMovementCtrl(socket, uid, data, cube, page.sigs);
        }
        users[uid] = cube;
        users[uid].sigs.init.dispatch();
        page.scene.add(cube);
    }
    const RemUser = (uid)=>{
        users[uid].sigs.dispose.dispatch();
        page.scene.remove(users[uid]);
        delete users[uid];
    }
    //#region signal event handlers
    const OnEnter = ()=>{
        socket.on('initial-entities-data', AddUser);
        socket.on('other-joined', AddUser);
        socket.on('disconnect', RemUser);
    }
    const OnExit = ()=>{
        socket.off('initial-entities-data', AddUser);
        socket.off('other-joined', AddUser);
        socket.off('disconnect', RemUser);
    }
    //#endregion
    page.sigs.enter.add(OnEnter);
    page.sigs.exit.add(OnExit);
}

export { UserManager }
import { BoxGeometry, MeshBasicMaterial, Mesh, Vector3 } from 'three'
import OtherUsersCtrl from '../Interaction/OtherUsersCtrl';
import PlayerCtrl from '../Interaction/PlayerCtrl';
import TestCameraCtrl from '../Interaction/TestCameraCtrl.js'

const UserManager = (socket, client_data, page, input_collector)=>{
    const users = { };
    //#region signal event handlers
    const AddUser = (uid, data)=>{
        //console.log('UserManager: add_user');
        let geometry = new BoxGeometry(1,1,1);
        let material = new MeshBasicMaterial({color:0xFF0000});
        let cube = new Mesh(geometry, material);
        cube.position.set(data.x, 1, data.y);
        users[uid] = cube;

        let temp = undefined;
        if(uid === client_data.uid){
            temp = PlayerCtrl(socket, uid, data, cube, page.camera, input_collector, page.sigs);
            const camera_ctrl = TestCameraCtrl(socket, client_data, data, page.camera, input_collector, page.sigs);
            camera_ctrl.sigs.init.dispatch();
            camera_ctrl.ChangeTarget(cube, new Vector3(0,1,0));
        }
        else
            temp = OtherUsersCtrl(socket, uid, data, cube, page.sigs);
        temp.sigs.init.dispatch();
        Object.assign(cube, temp);
        
        page.scene.add(cube);
    }
    const RemUser = (uid)=>{
        //console.log('UserManager: rem_user');
        users[uid].sigs.dispose.dispatch();
        page.scene.remove(users[uid]);
        delete users[uid];
    }
    //#endregion
    page.sigs.enter.add(()=>{
        socket.on('entity_data', AddUser);
        socket.on('other_joined', AddUser);
        socket.on('delete_entity', RemUser);
    });
    page.sigs.exit.add(()=>{
        socket.off('entity_data', AddUser);
        socket.off('other_joined', AddUser);
        socket.off('delete_entity', RemUser);
    });
}

export default UserManager
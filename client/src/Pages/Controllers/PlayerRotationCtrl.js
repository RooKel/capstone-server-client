import * as THREE from 'three'

const PlayerRotationCtrl = (socket, uid, data, model, camera, page_sigs)=>{
    const ProcessServerMessage = (msg)=>{
        if(msg.entity_id !== client_data.uid) return;
        
    }
    const OnInit = ()=>{
        //socket.on('instance-state', ProcessServerMessage)
    }
    const OnDispose = ()=>{
        //socket.off('instance-state', ProcessServerMessage)
    }
    const OnUpdate = ()=>{
        let look_dir = new THREE.Vector3();
        camera.getWorldDirection(look_dir);
        console.log(look_dir);
        let right_dir = new THREE.Vector3();
        right_dir.crossVectors(look_dir, new THREE.Vector3(0,1,0));
        let forward_dir = new THREE.Vector3();
        forward_dir.crossVectors(right_dir, new THREE.Vector3(0,1,0));
    }
    page_sigs.update.add(OnUpdate);
    model.sigs.init.add(OnInit);
    model.sigs.dispose.add(OnDispose);
}

export { PlayerRotationCtrl }
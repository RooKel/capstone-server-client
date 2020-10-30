import EventLink from '../EventLink.js'
import * as THREE from 'three'

const TestCameraCtrl = (socket, uid, camera, input_collector)=>{
    let target = undefined;
    let offset = undefined;
    const pending_inputs = [ ];
    let input_sequence_number = 0;
    //#region socket event handlers
    const ProcessServerMessage = (msg)=>{
        if(msg.entity_id !== uid) return;

    }
    //#endregion
    //#region input event handlers
    const OnMouseMove = (e)=>{

    }
    //#endregion
    //#region event link event handlers
    const OnEnter = ()=>{
        socket.on('world_state', ProcessServerMessage);
        document.addEventListener('mousemove', OnMouseMove);
    }
    const OnUpdate = (delta)=>{
        //#region camera translation
        if(target){
            let target_pos = target.position.clone().add(offset);
            camera.position.lerp(target_pos, 0.5);
        }
        //#endregion
        //#region camera rotation
        
        //#endregion
    }
    const OnExit = ()=>{
        socket.off('world_state', ProcessServerMessage);
        document.removeEventListener('mousemove', OnMouseMove);
    }
    //#endregion
    const event_link = EventLink([
        {name:'enter',handler:OnEnter},
        {name:'update',handler:OnUpdate},
        {name:'exit',handler:OnExit}
    ]);
    //#region public funcs
    const ChangeTarget = (_target, _offset)=>{
        if(!(_target instanceof THREE.Object3D)) return -1;
        if(!(_offset instanceof THREE.Vector3)) return -1;
        target = _target;
        offset = _offset;
    }
    //#endregion
    return {
        event_link: event_link,
        ChangeTarget: (target, offset)=>ChangeTarget(target, offset)
    }
}

export default TestCameraCtrl
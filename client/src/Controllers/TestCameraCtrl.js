import EventLink from '../EventLink.js'
import * as THREE from 'three'

const TestCameraCtrl = (socket, client_data, camera, input_collector)=>{
    let target = undefined;
    let offset = undefined;

    let prev_mouse_pos = undefined;
    let d_mouse_pos = { mouse_dx:0, mouse_dy:0 };
    const pending_inputs = [ ];
    let input_sequence_number = 0;

    //#region socket event handlers
    const ProcessServerMessage = (msg)=>{
        if(msg.entity_id !== client_data.uid) return;
        let tempQuat = new THREE.Quaternion(
            msg.entity_properties.quaternion._x,
            msg.entity_properties.quaternion._y,
            msg.entity_properties.quaternion._z,
            msg.entity_properties.quaternion._w
        );
        console.log(tempQuat);
        camera.quaternion.copy(tempQuat);
    }
    //#endregion
    //#region input event handlers
    const OnMouseMove = (e)=>{
        if(!prev_mouse_pos){
            prev_mouse_pos = { x:e.offsetX, y:e.offsetY };
        }
        else{
            d_mouse_pos.mouse_dx = e.offsetX - prev_mouse_pos.x;
            d_mouse_pos.mouse_dy = prev_mouse_pos.y - e.offsetY;
            prev_mouse_pos.x = e.offsetX;
            prev_mouse_pos.y = e.offsetY;
        }
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
            let target_rot = target.quaternion.clone();
            camera.position.lerp(target_pos, 0.5);
            //camera.quaternion.copy(target_rot);
        }
        //#endregion
        //#region camera rotation
        const input = {
            mouse_dx: d_mouse_pos.mouse_dx * 0.05,
            mouse_dy: d_mouse_pos.mouse_dy * 0.05,
            //input_sequence_number: input_sequence_number++
        };
        input_collector.AddMsg('input', input);
        //pending_inputs.push(input);

        d_mouse_pos.mouse_dx = 0;
        d_mouse_pos.mouse_dy = 0;
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

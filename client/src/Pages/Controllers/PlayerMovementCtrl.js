import * as THREE from 'three'

const PlayerMovementCtrl = (socket, uid, data, model, camera, input_collector, page_sigs, anim_ctrl)=>{
    const netw_obj = data;
    let pending_inputs = [ ];
    let input_sequence_number = 0;
    let anim_name = undefined;

    const pressed = [false,false,false,false];
    const key_map = {
        0:['KeyW','ArrowUp'],
        1:['KeyA','ArrowLeft'],
        2:['KeyS','ArrowDown'],
        3:['KeyD','ArrowRight']
    };
    //#region socket event handlers
    const ProcessServerMessage = (msg)=>{
        if(msg.entity_id !== uid) return;
        netw_obj.x = msg.entity_properties.x;
        netw_obj.y = msg.entity_properties.y;
        pending_inputs = pending_inputs.filter((_)=>_.input_sequence_number > msg.last_processed_input);
        pending_inputs.forEach((_)=>{
            netw_obj.x += _.move_dx * netw_obj.speed;
            netw_obj.y += _.move_dy * netw_obj.speed;
        });
    }
    //#endregion
    //#region input event handlers
    const TranslateKeyCode = (code)=>{
        for(let key in key_map){
            if(key_map[key].find((_)=>_===code))
                return key;
        }
        return undefined;
    }
    const OnKeyDown = (e)=>{
        const index = TranslateKeyCode(e.code);
        if(!index) return;
        pressed[index] = true;
    }
    const OnKeyUp = (e)=>{
        const index = TranslateKeyCode(e.code);
        if(!index) return;
        pressed[index] = false;
    }
    //#endregion
    //#region event link event handlers
    const OnInit = ()=>{
        socket.on('instance-state', ProcessServerMessage);
        document.addEventListener('keydown', OnKeyDown);
        document.addEventListener('keyup', OnKeyUp);
    }
    let walking = false;
    const OnUpdate = (delta)=>{
        let vertical = undefined;
        if(!(pressed[0]^pressed[2])) vertical = 0;
        else if(pressed[2]) vertical = 1;
        else vertical = -1;

        let horizontal = undefined;
        if(!(pressed[1]^pressed[3])) horizontal = 0;
        else if(pressed[3]) horizontal = 1;
        else horizontal = -1;

        if(anim_ctrl){
            let temp_anim_name = undefined;
            if(vertical < 0){
                temp_anim_name = 'walk_front';
            }
            else if(vertical > 0){
                temp_anim_name = 'walk_back';
            }
            else if(horizontal > 0){
                temp_anim_name = 'walk_right';
            }
            else if(horizontal < 0){
                temp_anim_name = 'walk_left';
            }
            else{
                temp_anim_name = 'idle';
            }
            if(anim_name !== temp_anim_name)
                anim_name = temp_anim_name;
            anim_ctrl.PlayAnim(anim_name);
        }

        //console.log(horizontal + ", " + vertical);

        let look_dir = new THREE.Vector3();
        camera.getWorldDirection(look_dir);
        let right_dir = new THREE.Vector3();
        right_dir.crossVectors(look_dir, new THREE.Vector3(0,1,0));
        let forward_dir = new THREE.Vector3();
        forward_dir.crossVectors(right_dir, new THREE.Vector3(0,1,0));
        let move = new THREE.Vector3().addVectors(
            forward_dir.multiplyScalar(vertical),
            right_dir.multiplyScalar(horizontal)
        );
        const input = { 
            move_dx: move.x * delta,
            move_dy: move.z * delta,
            animation_state: anim_name,
            input_sequence_number: input_sequence_number++
        };
        input_collector.AddMsg('input', input);
        pending_inputs.push(input);

        model.position.x += input.move_dx * netw_obj.speed;
        model.position.z += input.move_dy * netw_obj.speed;
    }
    const OnDispose = ()=>{
        socket.off('instance-state', ProcessServerMessage);
        document.removeEventListener('keydown', OnKeyDown);
        document.removeEventListener('keyup', OnKeyUp);
    }
    //#endregion
    page_sigs.update.add(OnUpdate);
    model.sigs.init.add(OnInit);
    model.sigs.dispose.add(OnDispose);
}

export { PlayerMovementCtrl }
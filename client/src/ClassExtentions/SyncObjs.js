//#region imports
import * as THREE from 'three'
//#endregion

const SyncObjs = (page, socket, client_data)=>{
    let objs = {};
    let netw_objs = {};
    const server_update_rate = 12;

    //#region helper functions
    const InterpolateObjs = ()=>{
        let now = +new Date();
        let render_timestamp = now - (1000.0/ server_update_rate);
        for(let key in netw_objs){
            let cur = netw_objs[key];
            //BUG: cur_entity_id is undefined
            if(cur.entity_id === client_data.uid){
                return;
            }
            let buffer = cur.position_buffer;
            while(buffer.length >= 2 && buffer[1][0] <= render_timestamp){
                buffer.shift();
            }
            if (buffer.length >= 2 && buffer[0][0] <= render_timestamp && render_timestamp <= buffer[1][0]) {
                let x0 = buffer[0][1]; let x1 = buffer[1][1];
                let y0 = buffer[0][2]; let y1 = buffer[1][2];
                let t0 = buffer[0][0]; let t1 = buffer[1][0];
          
                cur.x = x0 + (x1 - x0) * (render_timestamp - t0) / (t1 - t0);
                cur.y = y0 + (y1 - y0) * (render_timestamp - t0) / (t1 - t0);
            }
        }
    }
    //#endregion
    //#region socket event handlers
    const AddNetwObj = (_uid, data)=>{
        netw_objs[_uid] = data;
        //#region TEST
        let geometry = new THREE.BoxGeometry(1,1,1);
        let material = new THREE.MeshBasicMaterial({color:0xFF0000});
        let cube = new THREE.Mesh(geometry, material);
        objs[_uid] = cube;
        //#endregion
        objs[_uid].position.x = data.x;
        objs[_uid].position.y = 1;
        objs[_uid].position.z = data.y;
        //objs[_uid].position.z = 0;
        page.scene.add(objs[_uid]);
    }
    const ProcessServerMessage = (data)=>{
        if(!netw_objs[data.entity_id]){
            client_data.uid = data.entity_id;
            netw_objs[data.entity_id] = data.entity_properties;
        }
        if(data.entity_id === client_data.uid){ 
            netw_objs[client_data.uid].x = data.entity_properties.x;
            netw_objs[client_data.uid].y = data.entity_properties.y;

            let j = 0;
            while(j < page.pending_inputs().length){
                let input = page.pending_inputs()[j];
                if(input.input_sequence_number <= data.last_processed_input){
                    page.pending_inputs().splice(j,1);
                }
                else{
                    netw_objs[client_data.uid].x += input.move_dx * netw_objs[client_data.uid].speed;
                    netw_objs[client_data.uid].y += input.move_dy * netw_objs[client_data.uid].speed;
                    j++;
                }
            }
        }
        else{
            let timestamp = +new Date();
            netw_objs[data.entity_id].position_buffer.push([timestamp, data.entity_properties.x, data.entity_properties.y]);
        }
    }
    const RemNetwObj = (_uid)=>{
        page.scene.remove(objs[_uid]);
        delete objs[_uid];
        delete netw_objs[_uid];
    }
    //#endregion
    //#region page event handlers
    const OnEnter = ()=>{
        //#region register socket event handlers
        socket.on('entity_data', AddNetwObj);
        socket.on('other_joined', AddNetwObj);
        socket.on('world_state', ProcessServerMessage);
        socket.on('delete_entity', RemNetwObj);
        //#endregion
    }
    const OnExit = ()=>{
        //#region deregister socket event handlers
        socket.off('entity_data', AddNetwObj);
        socket.off('other_joined', AddNetwObj);
        socket.off('world_state', ProcessServerMessage);
        socket.off('delete_entity', RemNetwObj);
        //#endregion
    }
    const OnUpdate = (delta)=>{
        let input = page.pending_inputs()[0];
        if(input) {
            netw_objs[client_data.uid].x += input.move_dx * netw_objs[client_data.uid].speed;
            netw_objs[client_data.uid].y += input.move_dy * netw_objs[client_data.uid].speed;
        }
        InterpolateObjs();
        for(let key in objs){
            let cur = objs[key];
            cur.position.x = netw_objs[key].x;
            cur.position.z = -netw_objs[key].y;
        }
    }
    //#endregion
    //#region register page event handlers
    page.events.on('enter', OnEnter);
    page.events.on('exit', OnExit);
    page.events.on('update', OnUpdate);
    //#endregion

    //#region public funcs
    const GetMyObj = ()=>{
        return objs[client_data.uid];
    }
    //#endregion

    return {
        GetMyObj: ()=>GetMyObj(),
    }
}

export default SyncObjs
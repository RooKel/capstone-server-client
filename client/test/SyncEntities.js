//#region imports
import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three'
//#endregion

const SyncEntities = (page, socket, uid)=>{
    let entities = {};
    let networkEnt = {};

    const update_rate = 60;
    const server_update_rate = 12;

    //#region helper funcs
    const InterpolateEntities = ()=>{
        let now = +new Date();
        let render_timestamp = now - (1000.0/ server_update_rate);
        for(let key in networkEnt){
            let cur = networkEnt[key];
            if(cur.entity_id == uid)
                return;
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
    const addSyncObj = (ruid, data)=>{
        networkEnt[ruid] = data;
        //#region TEST
        let geometry = new BoxGeometry(1,1,1);
        let material = new MeshBasicMaterial({color:0xFF0000});
        let cube = new Mesh(geometry, material);
        entities[ruid] = cube;
        //#endregion
        entities[ruid].position.x = data.x;
        entities[ruid].position.y = data.y;
        //entities[ruid].position.z = 0;
        page.addObj(entities[ruid]);
    }
    const processServerMessages = (data)=>{
        if(!networkEnt[data.entity_id]){
            //uid = data.entity_id;
            networkEnt[data.entity_id] = data.entity_properties;
        }
        if(data.entity_id === uid){ 
            networkEnt[uid].x = data.entity_properties.x;
            networkEnt[uid].y = data.entity_properties.y;

            let j = 0;
            while(j < page.pending_inputs().length){
                let input = page.pending_inputs()[j];
                if(input.input_sequence_number <= data.last_processed_input){
                    page.pending_inputs().splice(j,1);
                }
                else{
                    networkEnt[uid].x += input.move_dx * networkEnt[uid].speed;
                    networkEnt[uid].y += input.move_dy * networkEnt[uid].speed;
                    j++;
                }
            }
        }
        else{
            let timestamp = +new Date();
            networkEnt[data.entity_id].position_buffer.push([timestamp, data.entity_properties.x, data.entity_properties.y]);
        }
    }
    const onDeleteEntity = (ruid)=>{
        page.removeObj(entities[ruid]);
        delete entities[ruid];
        delete networkEnt[ruid];
    }
    //#endregion
    //#region page event handlers
    const onEnter = ()=>{
        //#region register socket event handlers
        socket.on('entity_data', addSyncObj);
        socket.on('other_joined', addSyncObj);
        socket.on('world_state', processServerMessages);
        socket.on('delete_entity', onDeleteEntity);
        //#endregion
    }
    const onExit = ()=>{
        //#region deregister socket event handlers
        socket.off('entity_data', addSyncObj);
        socket.off('other_joined', addSyncObj);
        socket.off('world_state', processServerMessages);
        socket.off('delete_entity', onDeleteEntity);
        //#endregion
    }
    const onUpdate = (delta)=>{
        InterpolateEntities();
        for(let key in entities){
            let cur = entities[key];
            cur.position.x = networkEnt[key].x;
            cur.position.y = networkEnt[key].y;
        }
    }
    //#endregion
    //#region register page event handlers
    page.events.on('enter', ()=>onEnter());
    page.events.on('exit', ()=>onExit());
    page.events.on('update', (args)=>onUpdate(args[0]));
    //#endregion

    return {}
}
const SyncEntitiesConst = (page, socket, uid)=>{
    return Object.assign(page, SyncEntities(page, socket, uid))
}

export { SyncEntitiesConst }
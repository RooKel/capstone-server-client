//#region imports
import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three'
//#endregion

const SyncEntities = (page, socket, uid)=>{
    let entities = {};
    let networkEnt = {};

    let update_rate = 60;
    let server_update_rate = 12;

    //#region helper funcs
    const InterpolateEntities = ()=>{
        // compute render timestamp.
        var now = +new Date(); 
        var render_timestamp = now - (1000.0 / server_update_rate);

        for (var i in networkEnt) { 
            var entity = networkEnt[i];

            // no point in interpolating this client's entity.
            if (entity.entity_id == uid) {
                continue;
            }

            // find the two authoritative positions surrounding the rendering timestamp.
            var buffer = entity.position_buffer;

            // drop older positions.
            while (buffer.length >= 2 && buffer[1][0] <= render_timestamp) {
                buffer.shift();
            }

            // interpolate between the two surrounding authoritative positions.
            if (buffer.length >= 2 && buffer[0][0] <= render_timestamp && render_timestamp <= buffer[1][0]) {
                var x0 = buffer[0][1]; var x1 = buffer[1][1];
                var y0 = buffer[0][2]; var y1 = buffer[1][2];
                var t0 = buffer[0][0]; var t1 = buffer[1][0];

                entity.x = x0 + (x1 - x0) * (render_timestamp - t0) / (t1 - t0);
                entity.y = y0 + (y1 - y0) * (render_timestamp - t0) / (t1 - t0);
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
        entities[ruid].position.x = 0;
        entities[ruid].position.y = 0.5;
        entities[ruid].position.z = 0;
        
        page.addObj(entities[ruid]);
    }
    const processServerMessages = (data)=>{
        // if this is the first time we see this entity, create a local representation.
        if (!networkEnt[data.entity_id]) {
            uid = data.entity_id;
            networkEnt[data.entity_id] = data.entity_properties;
        }
        var entity = networkEnt[data.entity_id];
    
        // received the authoritative position of this client's entity.
        if (data.entity_id == uid) {
            entity.x = data.entity_properties.x;
            entity.y = data.entity_properties.y;
    
            // Server Reconciliation. Re-apply all the inputs not yet processed by
            // the server.
            var j = 0;
            while (j < page.pending_inputs().length) {
            var input = page.pending_inputs()[j];
                if (input.input_sequence_number <= data.last_processed_input) {
                    // already processed. Its effect is already taken into account into the world update
                    // we just got, so we can drop it.
                    page.pending_inputs().splice(j, 1);
                } else {
                    // not processed by the server yet. Re-apply it.
                    networkEnt[uid].x += input.move_dx * networkEnt[uid].speed;
                    networkEnt[uid].y += input.move_dy * networkEnt[uid].speed;
                    j++;
                }
            }
        } else {
            // received the position of an entity other than this client's.
            // add it to the position buffer.
            var timestamp = +new Date();
            entity.position_buffer.push([timestamp, data.entity_properties.x, data.entity_properties.y]);
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
        // do client-side prediction.
        networkEnt[uid].x += page.horizontal()* delta * networkEnt[uid].speed;
        networkEnt[uid].y += page.vertical()* delta * networkEnt[uid].speed;

        InterpolateEntities();
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
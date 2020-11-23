

const PlayerRotationCtrl = (page_sigs, socket, model, data)=>{
    const netw_obj = data;

    const ProcessServerMessage = (msg)=>{
        if(msg.entity_id !== uid) return;
        model.quaternion.set(
            msg.entity_properties.quaternion._x,
            msg.entity_properties.quaternion._y,
            msg.entity_properties.quaternion._z,
            msg.entity_properties.quaternion._w
        );
    }
    const OnInit = ()=>{
        socket.on('instance-state', ProcessServerMessage);
    }
    const OnDispose = ()=>{
        socket.off('instance-state', ProcessServerMessage);
    }
    const OnUpdate = (delta)=>{

    }
    page_sigs.update.add(OnUpdate);
    model.sigs.init.add(OnInit);
    model.sigs.dispose.add(OnDispose);
}

export { PlayerRotationCtrl }
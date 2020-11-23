

const OthUserRotationCtrl = (page_sigs, socket, model, data)=>{
    const netw_obj = data;

    const ProcessServerMessage = (msg)=>{
        console.log(msg.entity_properties.quaternion);
        console.log(model);
        model.quaternion.copy(
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

export { OthUserRotationCtrl }
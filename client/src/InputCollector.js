import EventLink from './EventLink.js'

const InputCollector = (socket, client_data)=>{
    const batches = [ ];
    //#region event link event handler
    const OnUpdate = (delta)=>{
        batches.forEach((_)=>{
            Object.assign(_.batch, {entity_id:client_data.uid});
            socket.emit(_.name, _.batch);
        });
        batches.splice(0, batches.length);
    }
    //#endregion
    const event_link = EventLink([
        {name:'update',handler:OnUpdate},
    ]);
    //#region public funcs
    const AddMsg = (batch_name, msg)=>{
        let index = batches.findIndex((_)=>_.name===batch_name);
        if(index < 0)
            batches.push({name:batch_name,batch:Object.assign({},msg)});
        else
            Object.assign(batches[index].batch, msg);
    }
    //#endregion
    return {
        event_link: event_link,
        AddMsg: (batch_name, msg)=>AddMsg(batch_name, msg)
    }
}

export default InputCollector
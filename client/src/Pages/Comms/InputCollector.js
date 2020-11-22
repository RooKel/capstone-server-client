
const InputCollector = (socket, client_data, sigs)=>{
    const batches = [ ];
    //#region signal event handlers
    const OnUpdate = (delta)=>{
        batches.forEach((_)=>{
            Object.assign(_.batch, {entity_id:client_data.uid});
            socket.emit(_.name, _.batch);
        });
        batches.splice(0, batches.length);
    }
    //#endregion
    sigs.update.add(OnUpdate);
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
        AddMsg: (batch_name, msg)=>AddMsg(batch_name, msg)
    }
}

export { InputCollector }
//#region imports

//#endregion

const EventChain = (event_handler)=>{
    //#region init
    const events = { };
    event_handler.forEach((_)=>{
        if(!_.name || !_.handler)
            return;
        if(typeof _.name !== 'string' || !(_.handler instanceof Function))
            return;

        if(!events[_.name])
            events[_.name] = [ _.handler ];
        else
            events[_.name].push(_.handler);
    });
    let children = [ ];
    //#endregion
    //#region public funcs
    const Invoke = (name, args)=>{
        if(typeof name !== 'string')
            return -1;
        if(!events[name])
            return -1;
        //Invoke children handlers
        children.forEach((_)=>_.Invoke(name, args));
        //Invoke my handlers
        events[name].forEach((_)=>_(args));
    }
    const AddChildren = (objs)=>{
        objs.forEach((_)=>{
            if(!_.event_chain)
                return;
            children.push(_.event_chain);
        });
    }
    const RemoveChild = (child)=>{
        if(!child.event_chain)
            return -1;
        let splice_ind = children.findIndex((_)=>_===child.event_chain);
        if(splice_ind === -1)
            return -1;
        children.splice(splice_ind, 1);
    }
    //#endregion
    return {
        Invoke: (name, ...args)=>Invoke(name, args), 
        AddChildren: (...objs)=>AddChildren(objs), 
        RemoveChild: (child)=>RemoveChild(child),
    }
}

export default EventChain
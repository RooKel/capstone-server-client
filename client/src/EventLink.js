
const EventLink = (events)=>{
    const children = [ ];
    const handlers = { };
    events.forEach((_)=>{
        if(typeof _.name !== 'string' || !(_.handler instanceof Function))
            return;
        if(!handlers[_.name])
            handlers[_.name] = [ _.handler ];
        else
            handlers[_.name].push(_.handler);
    });
    const AddLink = (link)=>{
        children.push(link);
    }
    const RemoveLink = (link)=>{
        children.splice(children.findIndex((_)=>_===link), 1);
    }
    const Invoke = (event_name, args)=>{
        if(!handlers[event_name])
            return -1;
        children.forEach((_)=>{
            _.Invoke.apply(this, [ event_name, ...args ]);
        });
        handlers[event_name].forEach((_)=>_.apply(this, args));
    }
    return {
        AddLink: (link)=>AddLink(link),
        RemoveLink: (link)=>RemoveLink(link),
        Invoke: (event_name, ...args)=>Invoke(event_name, args)
    }
}

export default EventLink
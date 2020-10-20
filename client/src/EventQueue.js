
const EventQueue = ()=>{
    let trigHand = {};
    
    const on = (name, handler)=>{
        if(name in trigHand) 
            trigHand[name].push(handler);
        else 
            trigHand[name] = [ handler ];
    }
    const emit = (name, args)=>{
        if(name in trigHand){
            trigHand[name].forEach((x)=>x(args));
        }
    }

    return {
        on: (name, handler)=>on(name, handler),
        emit: (name, ...args)=>emit(name, args),
        clear: ()=>trigHand.clear(),
    }
}

export { EventQueue }
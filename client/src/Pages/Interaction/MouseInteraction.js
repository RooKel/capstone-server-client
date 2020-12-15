
const LeftClick = (object, callback)=>{
    if(!object.sigs) Object.assign(object, {sigs:{ }});
    if(!object.sigs.left_click){
        Object.assign(object.sigs, {
            left_click: new signals.Signal()
        });
    }
    object.sigs.left_click.add(callback);
}
const Hover = (object, callback, return_callback)=>{
    if(!object.sigs) Object.assign(object, {sigs:{ }});
    if(!object.sigs.hover){
        Object.assign(object.sigs, {
            hover:  new signals.Signal(),
        });
    }
    object.sigs.hover.add(callback);
}
const Idle = (object, callback)=>{
    if(!object.sigs) Object.assign(object, {sigs:{ }});
    if(!object.sigs.idle){
        Object.assign(object.sigs, {
            idle: new signals.Signal()
        });
    }
    object.sigs.idle.add(callback);
}

export {
    LeftClick,
    Hover,
    Idle
}
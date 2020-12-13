
const LeftClick = (object, callback)=>{
    if(!object.sigs) Object.assign(object, {sigs:{ }});
    Object.assign(object.sigs, {
        left_click: new signals.Signal()
    });
    object.sigs.left_click.add(callback);
}
const RightClick = (object, callback)=>{
    if(!object.sigs) Object.assign(object, {sigs:{ }});
    Object.assign(object.sigs, {
        right_click: new signals.Signal()
    });
    object.sigs.right_click.add(callback);
}
const Hover = (object, callback)=>{
    if(!object.sigs) Object.assign(object, {sigs:{ }});
    Object.assign(object.sigs, {
        hover: new signals.Signal()
    });
    object.sigs.hover.add(callback);
}
const Idle = (object, callback)=>{
    if(!object.sigs) Object.assign(object, {sigs:{ }});
    Object.assign(object.sigs, {
        idle: new signals.Signal()
    });
    object.sigs.idle.add(callback);
}

export {
    LeftClick, RightClick,
    Hover,
    Idle
}
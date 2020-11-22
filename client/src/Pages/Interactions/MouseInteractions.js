
const LeftClick = (object, ...callbacks)=>{
    if(!object.sigs) Object.assign(object, { sigs:{ } });
    Object.assign(object.sigs, {
        left_click: new signals.Signal()
    });
    callbacks.forEach((_)=>{ object.sigs.left_click.add(_); });
}
const RightClick = (object, ...callbacks)=>{
    if(!object.sigs) Object.assign(object, { sigs:{ } });
    Object.assign(object.sigs, {
        right_click: new signals.Signal()
    });
    callbacks.forEach((_)=>{ object.sigs.right_click.add(_); });
}
const LeftPressed = (object, ...callbacks)=>{
    if(!object.sigs) Object.assign(object, { sigs:{ } });
    Object.assign(object.sigs, {
        left_pressed: new signals.Signal()
    });
    callbacks.forEach((_)=>{ object.sigs.left_pressed.add(_); });
}
const RightPressed = (object, ...callbacks)=>{
    if(!object.sigs) Object.assign(object, { sigs:{ } });
    Object.assign(object.sigs, {
        right_pressed: new signals.Signal()
    });
    callbacks.forEach((_)=>{ object.sigs.right_pressed.add(_); });
}
const Hover = (object, ...callbacks)=>{
    if(!object.sigs) Object.assign(object, { sigs:{ } });
    Object.assign(object.sigs, {
        hover: new signals.Signal()
    });
    callbacks.forEach((_)=>{ object.sigs.hover.add(_); });
}
const Scroll = (object, ...callbacks)=>{
    if(!object.sigs) Object.assign(object, { sigs:{ } });
    Object.assign(object.sigs, {
        scroll: new signals.Signal()
    });
    callbacks.forEach((_)=>{ object.sigs.scroll.add(_); });
}

export {
    LeftClick, RightClick,
    LeftPressed, RightPressed,
    Hover,
    Scroll,
}
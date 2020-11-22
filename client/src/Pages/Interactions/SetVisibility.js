
const SetVisibility = (object)=>{
    if(!object.sigs) Object.assign(object, { sigs:{ } });
    Object.assign(object.sigs, {
        set_visib: new signals.Signal()
    });
    object.sigs.set_visib.add((visibility)=>{
        object.traverse((_)=>{
            _.visible = visibility;
        });
    });
}

export { SetVisibility }
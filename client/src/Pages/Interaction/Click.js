
const Click = (object, callback)=>{
    if(!object.sigs)
        Object.assign(object, {sigs:{}});
    Object.assign(object.sigs, {
        click: new signals.Signal()
    });
    object.sigs.click.add(callback);
}

export default Click
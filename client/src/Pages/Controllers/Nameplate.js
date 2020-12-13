
const Nameplate = (follow_target, client_data, object, offset, page)=>{
    page.sigs.update.add((_)=>{
        object.position.set(
            follow_target.position.x + offset.x,
            follow_target.position.y + offset.y,
            follow_target.position.z + offset.z
        );
        if(client_data.player_obj) object.lookAt(client_data.player_obj.position);
    });
    follow_target.sigs.dispose.add(()=>{
        page.scene.remove(object);
    });
}

export {Nameplate}
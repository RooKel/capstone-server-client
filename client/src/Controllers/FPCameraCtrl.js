import EventLink from '../EventLink.js'

const FPCameraCtrl = (socket, uid, camera, out)=>{
    
    //#region socket event handlers
    const OnWorldState = (msg)=>{
        if(msg.entity_id !== uid)
            return;
        console.log(msg.entity_properties.quaternion);
    }
    //#endregion
    //#region input event handlers
    const OnMouseMove = (e)=>{
        
    }
    //#endregion
    //#region event link event handlers
    const OnInit = ()=>{
        document.addEventListener('mousemove', OnMouseMove);
        socket.on('world_state', OnWorldState);
    }
    const OnUpdate = (delta)=>{
        
    }
    const OnDispose = ()=>{
        document.removeEventListener('mousemove', OnMouseMove);
        socket.off('world_state', OnWorldState);
    }
    //#endregion
    const event_link = EventLink([
        { name:'init', handler:OnInit },
        { name:'update', handler:OnUpdate },
        { name:'dispose', handler:OnDispose }
    ])
    return {
        event_link: event_link
    }
}

export default FPCameraCtrl
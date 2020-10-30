import EventLink from '../EventLink.js'

const CtrlManager = (socket, client_data)=>{
    const ctrls = [ ];
    const messages = [ ];
    const inputs = [ ];
    //#region event link event handlers
    const OnUpdate = (delta)=>{
        inputs.forEach((_)=>{
            let index = messages.findIndex((__)=>_.name===__.name);
            if(index !== -1){
                Object.assign(messages[index].args, _.args);
                return;
            }
            messages.push({ name:_.name, args:Object.assign({}, _.args)});
        });
        messages.forEach((_)=>{
            _.args.entity_id = client_data.uid;
            socket.emit(_.name, _.args);
        });
        inputs.splice(0, inputs.length);
        messages.splice(0, messages.length);
    }
    //#endregion
    const event_link = EventLink([
        { name:'update', handler:OnUpdate },
    ]);
    //#region public funcs
    const AddCtrl = (ctrl)=>{
        ctrls.push(ctrl);
        ctrl.event_link.Invoke('init');
        event_link.AddLink(ctrl.event_link);
    }
    const RemCtrl = (ctrl)=>{
        ctrls.splice(ctrls.findIndex((_)=>_===ctrl), 1);
        ctrl.event_link.Invoke('dispose');
        event_link.RemoveLink(ctrl.event_link);
    }
    //#endregion
    return {
        inputs: inputs,
        event_link: event_link,
        AddCtrl: (ctrl)=>AddCtrl(ctrl),
        RemCtrl: (ctrl)=>RemCtrl(ctrl)
    }
}

export default CtrlManager
import {PanelType1} from '../Templates.js'

const Panel = (navigate)=>{
    const panel = PanelType1();
    let return_panel = {panel: undefined};

    const sigs = {
        toggle_on:  new signals.Signal(),
        toggle_off: new signals.Signal()
    }
    sigs.toggle_on.add((returning, from)=>{
        if(!returning) return_panel.panel = from;
        panel.position.z = -1;
    });
    sigs.toggle_off.add((returning)=>{
        if(returning && !return_panel.panel)  return;
        if(returning && return_panel.panel)   navigate[return_panel.panel].sigs.toggle_on.dispatch(true, 'main');
        panel.position.z = 0;
    });
    return Object.assign(panel, {
        sigs: sigs,
        return_panel: return_panel
    });
}

export {Panel}
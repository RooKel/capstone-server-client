import {Panel} from './Panel.js'
import {ButtonType1} from '../Templates.js'
import {Text} from 'three-mesh-ui'

const MainPanel = (interactable, socket, ftm, navigate, client_data)=>{
    const panel = Panel(navigate);
    //#region header
    panel.header.set({
        contentDirection: 'row',
        alignContent: 'center',
        justifyContent: 'center'
    });
    panel.header.add(new Text({content: 'Main Panel'}));
    //#endregion
    //#region body
    panel.body.set({
        contentDirection: 'column',
        alignContent: 'center',
        justifyContent: 'center'
    });
    const user_data_button = ButtonType1('User Data', ()=>{
        panel.sigs.toggle_off.dispatch(false);
        navigate['user_data'].sigs.toggle_on.dispatch(false, 'main');
    });
    const enter_inst_button = ButtonType1('Enter Inst', ()=>{
        panel.sigs.toggle_off.dispatch(false);
        navigate['enter_inst'].sigs.toggle_on.dispatch(false, 'main');
    });
    const create_inst_button = ButtonType1('Create Inst', ()=>{
        panel.sigs.toggle_off.dispatch(false);
        navigate['create_inst'].sigs.toggle_on.dispatch(false, 'main');
    });
    panel.body.add(user_data_button, enter_inst_button, create_inst_button);
    interactable.push(user_data_button, enter_inst_button, create_inst_button);
    //#endregion
    panel.sigs.toggle_on.add(()=>{
        navigate.current = 'main';
    });
    return panel;
}

export {MainPanel}
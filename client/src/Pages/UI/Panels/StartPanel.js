import {Panel} from './Panel.js'
import {Text} from 'three-mesh-ui'
import {ButtonType1, TextInputType1} from '../Templates.js'

const StartPanel = (interactable, socket, ftm, navigate, client_data)=>{
    const panel = Panel(navigate);
    //#region header
    panel.header.set({
        contentDirection: 'row',
        alignContent: 'center',
        justifyContent: 'center'
    });
    panel.header.add(new Text({content: 'Start Panel'}));
    //#endregion
    //#region body
    panel.body.set({
        contentDirection: 'column',
        alignContent: 'center',
        justifyContent: 'center'
    });
    const user_name_inp_field = TextInputType1('Username:', 20, interactable, panel.sigs);
    const start_button = ButtonType1('Start', ()=>{
        client_data.user_name = user_name_inp_field.text.content;
        socket.emit('create-nickname', client_data.user_name);
        panel.sigs.toggle_off.dispatch(false);
        navigate['main'].sigs.toggle_on.dispatch(false, 'start');
    });
    panel.body.add(user_name_inp_field, start_button);
    interactable.push(start_button);
    //#endregion
    panel.sigs.toggle_on.add(()=>{
        navigate.current = 'start';
    });
    return panel;
}

export {StartPanel}
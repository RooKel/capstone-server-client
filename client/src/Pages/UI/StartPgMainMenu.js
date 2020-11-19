import * as TMUI from 'three-mesh-ui'
import * as STY from './Styles.js'
import Click from '../Interaction/Click.js'

const StartPgMainMenu = (objs_to_test, socket)=>{
    const panel = new TMUI.Block(Object.assign({}, STY.small_panel, STY.roboto_font));
    panel.add(new TMUI.Text({ content:'Hello World!' }));
    panel.position.set(0,0,-1);
    
    const start_button = new TMUI.Block(Object.assign({}, STY.button_type1, STY.roboto_font));
    start_button.add(new TMUI.Text({content:'START'}));
    Click(start_button, ()=>{
        socket.emit('create-world', '_4pqz5yppk');
    });
    panel.add(start_button);
    objs_to_test.push(start_button);
    
    return panel;
}

export default StartPgMainMenu
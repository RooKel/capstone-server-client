import * as TMUI from 'three-mesh-ui'
import * as STYLE from '../Styles.js'
import * as MINT from '../../Interactions/MouseInteractions.js'
import { SetVisibility } from '../../Interactions/SetVisibility.js'

const StartPanel = (ui_interactable, socket)=>{
    const panel = new TMUI.Block(Object.assign({}, 
        STYLE.panelType1,
        STYLE.alignmentType1,
        STYLE.font_roboto
    ));
    SetVisibility(panel);
    panel.position.z = -1;

    const panel_header = new TMUI.Block(Object.assign({},
        STYLE.panelType1_header,
        STYLE.alignmentType1
    ));
    panel_header.add(new TMUI.Text({ content: 'Start Panel' }));

    const panel_content = new TMUI.Block(Object.assign({},
        STYLE.panelType1_content,
        STYLE.alignmentType1
    ));
    const start_btn = new TMUI.Block(Object.assign({},
        STYLE.btnType2,
        STYLE.alignmentType1
    ));
    start_btn.add(new TMUI.Text({ content: 'START' }));
    MINT.LeftClick(start_btn, ()=>{ socket.emit('login', true); });
    ui_interactable.push(start_btn);
    panel_content.add(start_btn);
    
    panel.add(panel_header, panel_content);
    return panel;
}

export { StartPanel }
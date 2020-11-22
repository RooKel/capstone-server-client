import { Texture } from 'three'
import * as TMUI from 'three-mesh-ui'
import * as STYLE from '../Styles.js'
import * as MINT from '../../Interactions/MouseInteractions.js'
import { SetVisibility } from '../../Interactions/SetVisibility.js'

import { SelectWorldPanel } from './SelectWorldPanel.js'
import { TextInputPanel } from './TextInputPanel.js'

const CreateInstPanel = (ui_interactable, return_panel, ftm, canvas, page)=>{
    const panel = new TMUI.Block(Object.assign({},
        STYLE.panelType2,
        STYLE.alignmentType1,
        STYLE.font_roboto
    ));
    SetVisibility(panel);
    panel.position.z = -1;

    const panel_header = new TMUI.Block(Object.assign({},
        STYLE.panelType2_header,
        STYLE.alignmentType1
    ));
    panel_header.add(new TMUI.Text({ content: 'Create Inst' }));

    const panel_content = new TMUI.Block(Object.assign({},
        STYLE.panelType2_content,
        STYLE.alignmentType1
    ));
    
    const select_world_panel = SelectWorldPanel(ui_interactable, panel, ftm);
    canvas.scene.add(select_world_panel);
    select_world_panel.sigs.set_visib.dispatch(false);
    const select_world_panel_btn = new TMUI.Block(Object.assign({},
        STYLE.btnType2,
        STYLE.alignmentType1
    ));
    select_world_panel_btn.add(new TMUI.Text({ content: 'Select World' }));
    MINT.LeftClick(select_world_panel_btn, ()=>{
        panel.sigs.set_visib.dispatch(false);
        select_world_panel.sigs.set_visib.dispatch(true);
    });
    
    ui_interactable.push(select_world_panel_btn);
    panel_content.add(select_world_panel_btn);

    const panel_footer = new TMUI.Block(Object.assign({},
        STYLE.panelType2_footer,
        STYLE.alignmentType2
    ));
    const close_btn = new TMUI.Block(Object.assign({},
        STYLE.btnType1,
        STYLE.alignmentType1
    ));
    const submit_btn = new TMUI.Block(Object.assign({},
        STYLE.btnType1,
        STYLE.alignmentType1
    ));
    close_btn.add(new TMUI.Text({ content: 'CLOSE' }));
    submit_btn.add(new TMUI.Text({ content: 'SUBMIT' }));
    MINT.LeftClick(close_btn, ()=>{ 
        panel.sigs.set_visib.dispatch(false);
        return_panel.sigs.set_visib.dispatch(true);
    });
    MINT.LeftClick(submit_btn, ()=>{

    });
    ui_interactable.push(close_btn, submit_btn);
    panel_footer.add(submit_btn, close_btn);
    
    panel.add(panel_header, panel_content, panel_footer);
    return panel;
}

export { CreateInstPanel }
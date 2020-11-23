import * as TMUI from 'three-mesh-ui'
import * as STYLE from '../Styles.js'
import * as MINT from '../../Interactions/MouseInteractions.js'
import { SetVisibility } from '../../Interactions/SetVisibility.js'

import { SelectAvatarPanel } from '../CommonPanels/SelectAvatarPanel.js'
import { EnterInstPanel } from '../CommonPanels/EnterInstPanel.js'
import { CreateInstPanel } from '../CommonPanels/CreateInstPanel.js'

const MainMenuPanel = (ui_interactable, canvas, app_sigs, ftm, socket, page)=>{
    const panel = new TMUI.Block(Object.assign({},
        STYLE.panelType2,
        STYLE.alignmentType1,
        STYLE.font_roboto,

    ));
    SetVisibility(panel);
    panel.position.z = -1;
    
    const panel_header = new TMUI.Block(Object.assign({},
        STYLE.panelType1_header,
        STYLE.alignmentType1
    ));
    panel_header.add(new TMUI.Text({ content: 'Main Menu' }));

    const panel_content = new TMUI.Block(Object.assign({},
        STYLE.panelType1_content,
        STYLE.alignmentType1
    ));
    const select_avatar_panel = SelectAvatarPanel(ui_interactable, panel, ftm, socket);
    const enter_inst_panel = EnterInstPanel(ui_interactable, panel, ftm, socket, page);
    const create_inst_panel = CreateInstPanel(ui_interactable, panel, ftm, canvas);
    canvas.scene.add(select_avatar_panel, enter_inst_panel, create_inst_panel);
    select_avatar_panel.sigs.set_visib.dispatch(false);
    enter_inst_panel.sigs.set_visib.dispatch(false);
    create_inst_panel.sigs.set_visib.dispatch(false);
    const select_avatar_panel_btn = new TMUI.Block(Object.assign({},
        STYLE.btnType2,
        STYLE.alignmentType1
    ));
    const enter_inst_panel_btn = new TMUI.Block(Object.assign({},
        STYLE.btnType2,
        STYLE.alignmentType1
    ));
    const create_inst_panel_btn = new TMUI.Block(Object.assign({},
        STYLE.btnType2,
        STYLE.alignmentType1
    ));
    select_avatar_panel_btn.add(new TMUI.Text({ content: 'Select Avatar' }));
    enter_inst_panel_btn.add(new TMUI.Text({ content: 'Enter Inst' }));
    create_inst_panel_btn.add(new TMUI.Text({ content: 'Create Inst' }));
    MINT.LeftClick(select_avatar_panel_btn, ()=>{  
        panel.sigs.set_visib.dispatch(false);
        select_avatar_panel.sigs.set_visib.dispatch(true);
    });
    MINT.LeftClick(enter_inst_panel_btn, ()=>{ 
        panel.sigs.set_visib.dispatch(false);
        enter_inst_panel.sigs.set_visib.dispatch(true);
    });
    MINT.LeftClick(create_inst_panel_btn, ()=>{ 
        panel.sigs.set_visib.dispatch(false);
        create_inst_panel.sigs.set_visib.dispatch(true);
    });
    ui_interactable.push(select_avatar_panel_btn, enter_inst_panel_btn, create_inst_panel_btn);
    panel_content.add(select_avatar_panel_btn, enter_inst_panel_btn, create_inst_panel_btn);

    //TEST
    const test_btn = new TMUI.Block(Object.assign({},
        STYLE.btnType2,
        STYLE.alignmentType1 
    ));
    test_btn.add(new TMUI.Text({ content: 'TEST' }));
    MINT.LeftClick(test_btn, ()=>{
        socket.emit('create-world', '_4pqz5yppk');
    });
    ui_interactable.push(test_btn);
    panel_content.add(test_btn);

    panel.add(panel_header, panel_content);

    const half = (_)=>{
        if(_ instanceof TMUI.Block){
            _.set({
                width: _.width * .6,
                //height: _.height * 0.5,
            });
        }
    }
    panel.traverse((_)=>half(_));
    select_avatar_panel.traverse((_)=>half(_));
    enter_inst_panel.traverse((_)=>half(_));
    create_inst_panel.traverse((_)=>half(_));
    return panel;
}

export { MainMenuPanel }
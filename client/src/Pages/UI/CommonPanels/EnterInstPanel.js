import { Texture } from 'three'
import * as TMUI from 'three-mesh-ui'
import * as STYLE from '../Styles.js'
import * as MINT from '../../Interactions/MouseInteractions.js'
import { SetVisibility } from '../../Interactions/SetVisibility.js'

import InvisiblePNG from '../../../../assets/png/invisible.png'

const EnterInstPanel = (ui_interactable, return_panel, ftm, socket, page)=>{
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
    panel_header.add(new TMUI.Text({ content: 'Enter Inst' }));

    const panel_content = new TMUI.Block(Object.assign({},
        STYLE.panelType2_content,
        STYLE.alignmentType1
    ));
    const num_list_elem = 3;
    const list = [ ];
    let start_ind = 0;
    for(let i = 0; i < num_list_elem; i++){
        const list_elem = new TMUI.Block(Object.assign({},
            STYLE.panelType2_content_listElem,
            STYLE.alignmentType4
        ));
        const list_elem_img = new TMUI.Block(Object.assign({},
            STYLE.panelType2_content_listElem_img,
        ));
        const image = new Image(512, 512);
        const texture = new Texture(image);
        list_elem_img.set({ backgroundTexture: texture });
        const list_elem_info = new TMUI.Block(Object.assign({},
            STYLE.panelType2_content_listElem_info,
            STYLE.alignmentType1
        ));
        list_elem.add(list_elem_img, list_elem_info);
        ui_interactable.push(list_elem);
        panel_content.add(list_elem);
    }
    const UpdateListElems = ()=>{        
        panel_content.children.forEach((_, i)=>{
            if(i === 0) return;
            if(start_ind + (i-1) < list.length){
                const info_block = _.children[2];
                info_block.add(new TMUI.Text({ content:list[start_ind + (i-1)].id }));
                MINT.LeftClick(_, ()=>{ 
                    console.log(list[start_ind + (i-1)].id);
                    socket.emit('join-instance', list[start_ind + (i-1)].id);
                });
            }
        });
    }
    panel.sigs.set_visib.add((visibility)=>{
        if(visibility)
            socket.emit('rq-instance-list', true);
    });
    const OnInstanceList = (input)=>{
        console.log(input);
        input.forEach((_)=>list.push(_));
        UpdateListElems();
    }
    page.sigs.enter.add(()=>{
        socket.on('instance-list', OnInstanceList);
    });
    page.sigs.exit.add(()=>{
        socket.off('instance-list', OnInstanceList);
    });

    const panel_footer = new TMUI.Block(Object.assign({},
        STYLE.panelType2_footer,
        STYLE.alignmentType2
    ));
    const close_btn = new TMUI.Block(Object.assign({},
        STYLE.btnType1,
        STYLE.alignmentType1
    ));
    const prev_btn = new TMUI.Block(Object.assign({},
        STYLE.btnType1,
        STYLE.alignmentType1
    ));
    const next_btn = new TMUI.Block(Object.assign({},
        STYLE.btnType1,
        STYLE.alignmentType1
    ));
    close_btn.add(new TMUI.Text({ content: 'CLOSE' }));
    prev_btn.add(new TMUI.Text({ content: 'PREV' }));
    next_btn.add(new TMUI.Text({ content: 'NEXT' }));
    MINT.LeftClick(close_btn, ()=>{ 
        panel.sigs.set_visib.dispatch(false);
        return_panel.sigs.set_visib.dispatch(true);
    });
    MINT.LeftClick(prev_btn, ()=>{ 
        
    });
    MINT.LeftClick(next_btn, ()=>{ 
        
    });
    ui_interactable.push(close_btn, prev_btn, next_btn);
    panel_footer.add(prev_btn, close_btn, next_btn);
    
    panel.add(panel_header, panel_content, panel_footer);
    return panel;
}

export { EnterInstPanel }
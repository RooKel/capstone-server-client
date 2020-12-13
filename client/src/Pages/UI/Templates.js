import * as STYLE from './Styles.js'
import * as MINT from '../Interaction/MouseInteraction.js'
import * as TMUI from 'three-mesh-ui'

const PanelType1 = ()=>{
    const panel = new TMUI.Block(Object.assign({},
        STYLE.panelType1,
        STYLE.fontRoboto
    ));
    const panel_header = new TMUI.Block(STYLE.panelType1Header);
    const panel_body = new TMUI.Block(STYLE.panelType1Body);
    const panel_footer = new TMUI.Block(STYLE.panelType1Footer);
    panel.add(panel_header, panel_body, panel_footer);
    return Object.assign(panel, {
        header: panel_header,
        body:   panel_body,
        footer: panel_footer
    });
}
const ButtonType1 = (desc, click_cb)=>{
    const button = new TMUI.Block(STYLE.buttonType1);
    button.add(new TMUI.Text({content: desc}));
    MINT.LeftClick(button, click_cb);
    return button;
}
const TableType1 = (table_width, table_height, num_rows, num_columns)=>{
    const table = new TMUI.Block({
        width: table_width, height: table_height,
        backgroundOpacity: 0,
        contentDirection: 'column',
        alignContent: 'center',
        justifyContent: 'center'
    });
    const cells = [ ];
    const rows = [ ];
    const margin = 0.01;
    const row_height = table_height / num_rows - 2 * margin;
    const column_width = table_width / num_columns - 2 * margin;
    for(let i = 0; i < num_rows; i++){
        rows.push(new TMUI.Block({
            width: 1.0, height: row_height,
            margin: margin,
            backgroundOpacity: 0,
            contentDirection: 'row',
            alignContent: 'center',
            justifyContent: 'center'
        }));
    }
    rows.forEach((_)=>{
        for(let i = 0; i < num_columns; i++){
            const cell = new TMUI.Block({
                width: column_width, height: row_height,
                margin: margin,
                contentDirection: 'row',
                alignContent: 'center',
                justifyContent: 'center'
            });
            _.add(cell);
            cells.push(cell);
        }
        table.add(_);
    });
    return Object.assign(table, {cells: cells});
}
const TextInputType1 = (desc, max_length, interactable, panel_sigs)=>{
    const panel = new TMUI.Block({
        width: 1.0, height: 0.125,
        padding:0.01, margin: 0.01,
        backgroundOpacity: 0,
        contentDirection: 'row',
        alignContent: 'center',
        justifyContent: 'center'
    });
    const desc_block = new TMUI.Block({
        width: 0.3, height: 0.1,
        margin: 0.01,
        alignContent: 'center',
        justifyContent: 'center'
    });
    const input_block = new TMUI.Block({
        width: 0.65, height: 0.1,
        margin:0.01,
        alignContent: 'center',
        justifyContent: 'center'
    });
    desc_block.add(new TMUI.Text({content: desc}));
    input_block.add(new TMUI.Text({content: ''}));
    let hover = false;
    const OnMouseDown = (e)=>{
        if(hover){
            document.addEventListener('keydown', OnKeyDown);
        }
        else{
            document.removeEventListener('keydown', OnKeyDown);
        }
    }
    const OnKeyDown = (e)=>{
        if((e.which >= 65 && e.which <= 90)
            || (e.which >= 48 && e.which <= 57 && !e.shiftKey)
            || (e.which >= 96 && e.which <= 105 && !e.shiftKey)
            || e.which === 32
        )
        {
            if(input_block.children[1].content.length > max_length) return;
            input_block.children[1].set({
                content: input_block.children[1].content + e.key
            });
        }
        else if(e.code === 'Backspace')
            input_block.children[1].set({
                content: input_block.children[1].content.substring(0, input_block.children[1].content.length-1)
            });
        else if(e.code === 'Enter')
            document.removeEventListener('keydown', OnKeyDown);
    }
    MINT.Hover(input_block, ()=>{
        hover = true;
    });
    MINT.Idle(input_block, ()=>{
        hover = false;
    });
    interactable.push(input_block);
    panel.add(desc_block, input_block);

    panel_sigs.toggle_on.add(()=>{
        document.addEventListener('mousedown', OnMouseDown);
    });
    panel_sigs.toggle_off.add(()=>{
        document.removeEventListener('mousedown', OnMouseDown);
    });

    return Object.assign(panel, {
        text: input_block.children[1],
    });
}

const DisplayBlock = ()=>{
    const block = new TMUI.Block(STYLE.display_block);
    const img_block = new TMUI.Block(STYLE.display_block_img);
    const txt_block = new TMUI.Block(STYLE.display_block_text);
    block.add(img_block, txt_block);
    return Object.assign(block, {
        img_block: img_block,
        txt_block: txt_block
    });
}
const LoadingPanel = ()=>{
    const panel = new TMUI.Block(Object.assign({}, STYLE.loadingPanel, STYLE.fontRoboto));
    panel.add(new TMUI.Text({content: 'Loading...'}));
    return panel;
}

export {
    PanelType1,
    ButtonType1,
    TableType1,
    TextInputType1,
    DisplayBlock,
    LoadingPanel
}
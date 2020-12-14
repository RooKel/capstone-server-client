import {Panel} from './Panel.js'
import {Text} from 'three-mesh-ui'
import {ButtonType1, DisplayBlock, TextInputType1} from '../Templates.js'
import {Texture} from 'three'
import InvisiblePNG from '../../../../assets/Img/invisible.png'
import LoadingPNG from '../../../../assets/Img/loading.png'

const b64 = (e)=>{
    let t="";
    let n=new Uint8Array(e);
    let r=n.byteLength;
    for(let i=0;i<r;i++)
    {
        t+=String.fromCharCode(n[i]);
    }
    return window.btoa(t);
}
const CreateInstPanel = (interactable, socket, ftm, navigate, client_data)=>{
    const panel = Panel(navigate);
    //#region header
    panel.header.set({
        contentDirection: 'row',
        alignContent: 'center',
        justifyContent: 'center'
    });
    panel.header.add(new Text({content: 'Create Inst'}));
    //#endregion
    //#region body
    panel.body.set({
        contentDirection: 'column',
        alignContent: 'center',
        justifyContent: 'center'
    });
    const world_name_inp_field = TextInputType1('World Name:', 20, interactable, panel.sigs);
    const selected_world_block = DisplayBlock();
    let selected_world_uid = undefined;
    //#region selected world block
    const image = new Image(512, 512);
    const texture = new Texture(image);
    selected_world_block.img_block.backgroundTexture = texture;
    selected_world_block.img_block.backgroundTexture.image.onload = ()=>{
        selected_world_block.img_block.backgroundTexture.needsUpdate = true;
    }
    const Clear = ()=>{
        selected_world_block.img_block.backgroundTexture.dispose();
        selected_world_block.img_block.backgroundTexture.image.src = InvisiblePNG;
        selected_world_block.txt_block.children.splice(0, selected_world_block.txt_block.children.length);
    }
    //#endregion
    const select_world_button = ButtonType1('Select World', ()=>{
        panel.sigs.toggle_off.dispatch(false);
        navigate['select_world'].sigs.toggle_on.dispatch(false, 'create_inst');
    });
    panel.body.add(world_name_inp_field, selected_world_block, select_world_button);
    interactable.push(select_world_button);
    //#endregion
    //#region footer
    panel.footer.set({
        contentDirection: 'row',
        alignContent: 'center',
        justifyContent: 'center'
    });
    const submit_button = ButtonType1('Submit', ()=>{
        socket.emit('create-world', {
            world_id: selected_world_uid, 
            room_name: world_name_inp_field.text.content
        });
        panel.sigs.toggle_off.dispatch(true);
    });
    const close_button = ButtonType1('Close', ()=>{
        panel.sigs.toggle_off.dispatch(true);
    });
    panel.footer.add(submit_button, close_button);
    interactable.push(submit_button, close_button);
    //#endregion
    panel.sigs.toggle_on.add((returning, from)=>{
        navigate.current = 'create_inst';
    });
    panel.sigs.toggle_off.add((returning)=>{
        Clear();
        selected_world_uid = undefined;
        if(returning)
            world_name_inp_field.text.set({content: ''});
    });
    Object.assign(panel.sigs, {
        selected_world: new signals.Signal()
    });
    panel.sigs.selected_world.add((input)=>{
        selected_world_uid = input.uid;
        selected_world_block.img_block.backgroundTexture.image.src = input.data;
        selected_world_block.txt_block.add(new Text({content:'name: ' + input.name}));
        selected_world_block.txt_block.add(new Text({content:'\ncreator: ' + input.creator}));
        selected_world_block.txt_block.add(new Text({content:'\ndate: ' + input.date.substring(0, 10)}));
    });
    return panel;
}

export {CreateInstPanel}
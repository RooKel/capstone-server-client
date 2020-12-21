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
const UserDataPanel = (interactable, socket, ftm, navigate, client_data)=>{
    const panel = Panel(navigate);
    //#region header
    panel.header.set({
        contentDirection: 'row',
        alignContent: 'center',
        justifyContent: 'center'
    });
    panel.header.add(new Text({content: 'User Data'}));
    //#endregion
    //#region body
    panel.body.set({
        contentDirection: 'column',
        alignContent: 'center',
        justifyContent: 'center'
    });
    const user_name_inp_field = TextInputType1('Username:', 20, interactable, panel.sigs);
    const selected_avatar_block = DisplayBlock();
    //#region selected avatar block
    const image = new Image(512,512);
    const texture = new Texture(image);
    selected_avatar_block.img_block.set({backgroundTexture: texture});
    selected_avatar_block.img_block.backgroundTexture.image.onload = ()=>{
        selected_avatar_block.img_block.backgroundTexture.needsUpdate = true;
    }
    const Clear = ()=>{
        selected_avatar_block.img_block.backgroundTexture.dispose();
        selected_avatar_block.img_block.backgroundTexture.image.src = InvisiblePNG;
        selected_avatar_block.txt_block.children.splice(1, selected_avatar_block.txt_block.children.length - 1);
    }
    const OnFileDownload = (result)=>{
        if(result.request_type === 'thumbnail' && result.category === 'avatar' && result.data[0].uid === client_data.avatar_id) {
            selected_avatar_block.img_block.backgroundTexture.image.src = 'data:image/png;base64,' + b64(result.data[0].data);
            selected_avatar_block.txt_block.add(new Text({content:'name: ' + result.data[0].name}));
            selected_avatar_block.txt_block.add(new Text({content:'\ncreator: ' + result.data[0].creator}));
            selected_avatar_block.txt_block.add(new Text({content:'\ndate: ' + result.data[0].date.substring(0, 10)}));
            binding.active = false;
        }
    }
    const binding = ftm.signals.file_download.add(OnFileDownload);
    binding.active = false;
    //#endregion
    const select_avatar_button = ButtonType1('Select Avatar', ()=>{
        panel.sigs.toggle_off.dispatch(false);
        navigate['select_avatar'].sigs.toggle_on.dispatch(false, 'user_data');
    });
    panel.body.add(user_name_inp_field, selected_avatar_block, select_avatar_button);
    interactable.push(select_avatar_button);
    //#endregion
    //#region footer
    panel.footer.set({
        contentDirection: 'row',
        alignContent: 'center',
        justifyContent: 'center'
    });
    const close_button = ButtonType1('Close', ()=>{
        panel.sigs.toggle_off.dispatch(true);
    });
    panel.footer.add(close_button);
    interactable.push(close_button);
    //#endregion
    panel.sigs.toggle_on.add(()=>{
        user_name_inp_field.text.set({content: client_data.user_name});
        if(client_data.avatar_id){
            selected_avatar_block.img_block.backgroundTexture.image.src = LoadingPNG;
            binding.active = true;
            ftm.requestFileDownload('thumbnail', 'avatar', client_data.avatar_id);
        }
        navigate.current = 'user_data';
    });
    panel.sigs.toggle_off.add(()=>{
        if(user_name_inp_field.text.content !== ''){
            client_data.user_name = user_name_inp_field.text.content;
            socket.emit('create-nickname', client_data.user_name);
        }
        Clear();
        binding.active = false;
    });
    return panel;
}

export {UserDataPanel}
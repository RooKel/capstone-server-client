import {Panel} from './Panel.js'
import {Text, Block} from 'three-mesh-ui'
import {ButtonType1, TableType1} from '../Templates.js'
import {Texture} from 'three'
import * as MINT from '../../Interaction/MouseInteraction.js'
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
const EnterInstPanel = (interactable, socket, ftm, navigate, client_data)=>{
    const panel = Panel(navigate);
    //#region header
    panel.header.set({
        contentDirection: 'row',
        alignContent: 'center',
        justifyContent: 'center'
    });
    panel.header.add(new Text({content: 'Enter Inst'}));
    //#endregion
    //#region body
    panel.body.set({
        contentDirection: 'column',
        alignContent: 'center',
        justifyContent: 'center'
    });
    const table = TableType1(1.1, 0.7, 3, 2);
    table.cells.forEach((_)=>{
        _.set({
            contentDirection: 'row',
            alignContent: 'center',
            justifyContent: 'center'
        });
        const image = new Image(512, 512);
        const texture = new Texture(image);
        const img_block = new Block({
            width: _.height - 0.05, height: _.height - 0.05,
            backgroundTexture: texture
        });
        img_block.backgroundTexture.image.onload = ()=>{
            img_block.backgroundTexture.needsUpdate = true;
        }
        const txt_block = new Block({
            width: _.width - _.height, height: _.height,
            padding: 0.03, margin: 0.01,
            backgroundOpacity: 0,
            contentDirection: 'column',
            alignContent: 'left',
            justifyContent: 'center'
        });
        _.add(img_block, txt_block);
        Object.assign(_, {sigs:{}});
        interactable.push(_);
    });
    const ClearTable = ()=>{
        table.cells.forEach((_)=>{
            const img_block = _.children[1];
            const txt_block = _.children[2];
            img_block.backgroundTexture.dispose();
            img_block.backgroundTexture.image.src = InvisiblePNG;
            txt_block.children.splice(1, txt_block.children.length - 1);
            if(_.sigs.left_click)
                _.sigs.left_click.removeAll();
        });
    }
    const thumbnail_list = [ ];
    const OnFileDownload = (result)=>{
        if(result.request_type === 'thumbnail' && result.category === 'world') {
            result.data.forEach((_)=>{
                if(!_.data) return;
                _.data = 'data:image/png;base64,' + b64(_.data);
                thumbnail_list.push(_);
            });
            table.cells.forEach((_, i)=>{
                if(cur_start_ind + i >= inst_list.length) return;
                for(let i = 0; i < thumbnail_list.length; i++){
                    if(thumbnail_list[i].uid === inst_list[cur_start_ind + i].instance.world_id){
                        _.children[1].backgroundTexture.image.src = thumbnail_list[i].data;
                        break;
                    }
                }
            });
            binding.active = false;
        }
    }
    const binding = ftm.signals.file_download.add(OnFileDownload);
    binding.active = false;
    let inst_list = undefined;
    let cur_start_ind = 0;
    const OnInstanceList = (_inst_list)=>{
        inst_list = [..._inst_list];
        table.cells.forEach((_, i)=>{
            const img_block = _.children[1];
            const txt_block = _.children[2];
            if(cur_start_ind + i >= inst_list.length){
                img_block.backgroundTexture.image.src = InvisiblePNG;
                return;
            }
            img_block.backgroundTexture.image.src = LoadingPNG;
            txt_block.add(new Text({content:'name: ' + inst_list[cur_start_ind + i].id, fontSize: 0.03}));
            txt_block.add(new Text({content:'\nmaster: ' + inst_list[cur_start_ind + i].instance.master_id, fontSize: 0.03}));
            MINT.LeftClick(_, ()=>{
                socket.emit('rq-exit-instance', true);
                socket.emit('join-instance', inst_list[cur_start_ind + i].id);
                panel.sigs.toggle_off.dispatch(false);
            });
        });
        binding.active = true;
        ftm.requestFileDownload('thumbnail', 'world');
    }
    panel.body.add(table);
    //#endregion
    //#region footer
    panel.footer.set({
        contentDirection: 'row',
        alignContent: 'center',
        justifyContent: 'center'
    });
    const next_button = ButtonType1('Next', ()=>{
        if(cur_start_ind + 6  >= inst_list.length) return;
        cur_start_ind += 6;
        FillTable();
    });
    const prev_button = ButtonType1('Prev', ()=>{
        if(cur_start_ind - 6  < 0) return;
        cur_start_ind -= 6;
        FillTable();
    });
    const close_button = ButtonType1('Close', ()=>{
        panel.sigs.toggle_off.dispatch(true);
    });
    panel.footer.add(prev_button, close_button, next_button);
    interactable.push(prev_button, close_button, next_button);
    //#endregion
    panel.sigs.toggle_on.add(()=>{
        socket.on('instance-list', OnInstanceList);
        socket.emit('rq-instance-list', true);
        navigate.current = 'enter_inst';
    });
    panel.sigs.toggle_off.add(()=>{
        socket.off('instance-list', OnInstanceList);
        inst_list = undefined;
        binding.active = false;
        ClearTable();
    });
    return panel;
}

export {EnterInstPanel}
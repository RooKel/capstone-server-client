import {Block, Text} from 'three-mesh-ui'
import {fontRoboto} from '../UI/Styles.js'
import {Vector3} from 'three'

const Nameplate = (nickname, follow_target, client_data, page)=>{
    let fontSize = 2 / nickname.length;
    if(nickname.length < 6)
        fontSize = 0.2;
    const nameplate_block = new Block(Object.assign({}, fontRoboto, {
        width: 1, height:0.3,
        backgroundOpacity: 0.8,
        fontSize: fontSize,
        borderRadius: 0.075,
        alignContent: 'center',
        justifyContent: 'center'
    }));
    nameplate_block.add(new Text({content: nickname}));
    let offset = new Vector3(0,1,0);

    const OnUpdate = (delta)=>{
        nameplate_block.position.set(
            follow_target.position.x + offset.x,
            follow_target.position.y + offset.y,
            follow_target.position.z + offset.z
        );
        nameplate_block.lookAt(client_data.player_obj.position);
    }
    page.sigs.update.add(OnUpdate);

    const sigs = { 
        change_offset: new signals.Signal(),
        dispose: new signals.Signal(),
    };
    sigs.change_offset.add((_offset)=>{
        offset.set(_offset.x, _offset.y, _offset.z);
    });
    sigs.dispose.add(()=>{
        page.sigs.update.remove(OnUpdate);
        page.scene.remove(nameplate_block);
    });
    Object.assign(nameplate_block, {
        sigs: sigs
    })
    return nameplate_block;
}

export {Nameplate}
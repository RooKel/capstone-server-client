import {Block, Text} from 'three-mesh-ui'
import {fontRoboto} from '../UI/Styles.js'

const DisplayText = (dest, params)=>{
    document.addEventListener('keyup', (e)=>{
        if(e.code === 'Escape'){
            params.canvas.scene.remove(display);
            params.pointer.Active(true);
            params.camera.sigs.init.dispatch();
            document.addEventListener('keyup', params.call_menu);
            e.stopPropagation();
        }
    }, {once: true});
    document.removeEventListener('keyup', params.call_menu);
    params.pointer.Active(false);
    params.camera.sigs.dispose.dispatch();

    const display = new Block(Object.assign({}, fontRoboto, {
        width:0.5, height:0.5,
        padding:0.03, margin:0.01,
        contentDirection: 'column',
        alignContent: 'center',
        justifyContent: 'center'
    }));
    display.add(new Text({content: params.text}));
    display.position.set(0,0,-1);
    params.canvas.scene.add(display);
}

export {DisplayText}
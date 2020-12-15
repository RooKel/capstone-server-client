import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import {Color} from 'three'

const Inspector = (dest, params)=>{
    const OnKeyUp = (e)=>{
        if(e.code === 'Escape'){
            params.canvas.camera.position.set(0,0,0);
            params.canvas.camera.lookAt(0,0,-1);
            params.canvas.light.position.set(0,1,1);
            params.canvas.scene.background = null;
            cam_ctrl.dispose();
            light_ctrl.dispose();
            params.canvas.scene.remove(clone);
            params.pointer.Active(true);
            params.camera.sigs.init.dispatch();
            document.addEventListener('keyup', params.call_menu);
            document.getElementById('three-canvas').requestPointerLock();
            document.removeEventListener('keyup', OnKeyUp);
        }
    }
    document.addEventListener('keyup', OnKeyUp);

    document.exitPointerLock();
    document.removeEventListener('keyup', params.call_menu);
    params.pointer.Active(false);
    params.camera.sigs.dispose.dispatch();

    const clone = dest.clone();
    clone.position.set(0,0,-2);
    params.canvas.scene.add(clone);
    params.canvas.scene.background = new Color(0x000000);

    const cam_ctrl = new OrbitControls(params.canvas.camera, document.getElementById('three-canvas'));
    cam_ctrl.enableZoom = false;
    cam_ctrl.enablePan = false;
    
    cam_ctrl.target.set(0,0,-2);
    const light_ctrl = new OrbitControls(params.canvas.light, document.getElementById('three-canvas'));
    light_ctrl.enableZoom = false;
    light_ctrl.enablePan = false;
}

export {Inspector}
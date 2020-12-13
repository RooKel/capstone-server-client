import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'

const Inspector = (dest, params)=>{
    document.addEventListener('keydown', (e)=>{
        if(e.code === 'Escape'){
            params.canvas.camera.position.set(0,0,0);
            params.canvas.camera.lookAt(0,0,-1);
            cam_ctrl.dispose();
            params.canvas.scene.remove(clone);
        }
    }, {once: true});
    params.pointer.Active(false);
    params.camera.sigs.dispose.dispatch();

    const clone = dest.clone();
    clone.position.set(0,0,-2);
    params.canvas.scene.add(clone);

    const cam_ctrl = new OrbitControls(params.canvas.camera, document.getElementById('three-canvas'));
    cam_ctrl.target.set(0,0,-2);
}

export {Inspector}
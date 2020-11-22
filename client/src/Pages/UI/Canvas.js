import { Scene, PerspectiveCamera } from 'three'
import * as TMUI from 'three-mesh-ui'

const Canvas = (page_sigs)=>{
    const scene = new Scene();
    const camera = new PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1, 1000
    );
    page_sigs.update.add(()=>{ TMUI.update(); });
    page_sigs.resize.add(()=>{
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    })
    return {
        scene: scene,
        camera: camera,
    }
}

export { Canvas }
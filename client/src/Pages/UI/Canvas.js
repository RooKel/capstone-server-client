import { PerspectiveCamera, Scene } from "three"
import * as TMUI from 'three-mesh-ui'

const Canvas = (update_signal)=>{
    const scene = new Scene();
    const camera = new PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1, 1000
    );
    update_signal.add(()=>{ TMUI.update(); });
    return {
        scene: scene,
        camera: camera
    }
}

export default Canvas
import {Scene, PerspectiveCamera} from 'three'
import ThreeMeshUI from 'three-mesh-ui'

const Canvas = (page_sigs)=>{
    const scene = new Scene();
    const camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    page_sigs.update.add((delta)=>{
        ThreeMeshUI.update();
    });
    page_sigs.resize.add(()=>{
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });
    page_sigs.render.add((renderer)=>{
        renderer.getContext().disable(renderer.getContext().DEPTH_TEST);
        renderer.render(scene, camera);
        renderer.getContext().enable(renderer.getContext().DEPTH_TEST);
    }, null, 0);

    return {
        scene:  scene,
        camera: camera,
    }
}

export {Canvas}
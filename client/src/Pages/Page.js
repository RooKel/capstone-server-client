import { Scene, PerspectiveCamera } from 'three'

const Page = ()=>{
    const scene = new Scene();
    const camera = new PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        .1, 1000
    );
    const sigs = {
        enter: new signals.Signal(),
        exit: new signals.Signal(),
        update: new signals.Signal(),
        resize: new signals.Signal()
    }
    sigs.resize.add(()=>{
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });
    return {
        scene: scene,
        camera: camera,
        sigs: sigs,
    }
}

export { Page }
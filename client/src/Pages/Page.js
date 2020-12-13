import {Scene, PerspectiveCamera} from 'three'

const Page = ()=>{
    const scene = new Scene();
    const camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    const sigs = {
        enter:  new signals.Signal(),
        exit:   new signals.Signal(),
        update: new signals.Signal(),
        resize: new signals.Signal(),
        render: new signals.Signal()
    }
    sigs.resize.add(()=>{
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });
    sigs.render.add((renderer)=>{
        renderer.render(scene, camera)
    }, null, 1);
    return {
        scene:  scene,
        camera: camera,
        sigs:   sigs
    }
}

export {Page}
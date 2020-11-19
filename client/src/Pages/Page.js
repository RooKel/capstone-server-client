import { PerspectiveCamera, Scene } from "three"

const Page = ()=>{
    const scene = new Scene();
    const camera = new PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1, 1000
    );
    const sigs = {
        enter: new signals.Signal(),
        exit: new signals.Signal(),
        update: new signals.Signal()
    }

    return {
        scene: scene,
        camera: camera,
        sigs: sigs
    }
}

export default Page
import * as THREE from 'three'

const Page = ()=>{
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    return {
        scene: scene,
        camera: camera
    }
}

export default Page
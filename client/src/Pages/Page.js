import * as THREE from 'three'
import EventLink from '../EventLink.js'

const Page = ()=>{
    const scene = new THREE.Scene();
    const scene_event_link = EventLink([
        {name:'enter',handler:()=>{}},
        {name:'update',handler:(delta)=>{}},
        {name:'exit',handler:()=>{}},
    ]);
    Object.assign(scene, {event_link:scene_event_link});
    
    const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1, 1000
    );
    const camera_event_link = EventLink([
        {name:'enter',handler:()=>{}},
        {name:'update',handler:(delta)=>{}},
        {name:'exit',handler:()=>{}},
    ]);
    Object.assign(camera, {event_link:camera_event_link});

    return {
        scene: scene,
        camera: camera
    }
}

export default Page
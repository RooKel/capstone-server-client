//#region imports
import { PerspectiveCamera, Scene } from 'three';

import { EventQueue } from './EventQueue.js'
//#endregion

const Page = ()=>{
    let scene = new Scene();
    let camera = new PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
    let events = EventQueue();

    return {
        scene: scene,
        camera: camera,
        events: events,
    }
}

export { Page }
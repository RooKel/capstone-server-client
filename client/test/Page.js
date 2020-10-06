//#region imports
import { Scene, PerspectiveCamera } from 'three'

import { EventQueue } from './EventQueue'
//#endregion

const Page = ()=>{
    const scene = new Scene();
    const camera = new PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(0,1,5);
    const events = EventQueue();

    const resetCam = ()=>{
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
    const addObj = (obj)=>{
        scene.add(obj);
    }
    const removeObj = (obj)=>{
        scene.remove(obj);
    }

    return {
        scene: ()=>scene.clone(),
        camera: ()=>camera.clone(),
        events: events,

        resetCam: ()=>resetCam(),
        addObj: (obj)=>addObj(obj),
        removeObj: (obj)=>removeObj(obj),
    }
}

export { Page }
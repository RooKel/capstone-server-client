import { Scene, PerspectiveCamera } from 'three'
import EventLink from '../EventLink.js'
import UIManager from './UI/UIManager.js'

const Page = ()=>{
    const scene = new Scene();
    const scene_event_link = EventLink([
        { name:'enter', handler: ()=>{} },
        { name:'exit', handler: ()=>{} },
        { name:'update', handler: (delta)=>{} }
    ]);
    Object.assign(scene, { event_link: scene_event_link });
    const camera = new PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1, 1000
    );
    const camera_event_link = EventLink([
        { name:'enter', handler: ()=>{} },
        { name:'exit', handler: ()=>{} },
        { name:'update', handler: (delta)=>{} }
    ]);
    Object.assign(camera, { event_link: camera_event_link });
    const ui_manager = UIManager();
    
    return {
        scene: scene,
        camera: camera,
        ui_manager: ui_manager
    }
}

export default Page
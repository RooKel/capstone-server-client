import { Scene, PerspectiveCamera } from 'three'
import * as TMUI from 'three-mesh-ui'
import EventLink from '../../EventLink.js'

const UIManager = ()=>{
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
    //#region event link event handlers
    const OnEnter = ()=>{
        //console.log('UIManager: enter');
    }
    const OnExit = ()=>{
        //console.log('UIManager: exit');
    }
    const OnUpdate = (delta)=>{
        TMUI.update();
    }
    //#endregion
    const event_link = EventLink([
        { name:'enter', handler:OnEnter },
        { name:'exit', handler:OnExit },
        { name:'update', handler:OnUpdate }
    ]);
    event_link.AddLink(scene.event_link);
    const AddUIElem = (elem)=>{
        scene.add(elem);
    }
    return {
        scene: scene,
        camera: camera,
        event_link: event_link,
        AddUIElem: (elem)=>AddUIElem(elem)
    }
}

export default UIManager
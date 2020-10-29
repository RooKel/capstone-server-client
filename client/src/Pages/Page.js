import * as THREE from 'three'
import * as EVENTS from '../Events/Import.js'

const Page = ()=>{
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    //#region init scene
    {
        const OnEnter = ()=>{}
        const OnUpdate = (delta)=>{}
        const OnExit = ()=>{}
        const event_link = EVENTS.EventLink([
            { name:'enter', handler:OnEnter },
            { name:'update', handler:OnUpdate },
            { name:'exit', handler:OnExit }
        ]);
        Object.assign(scene, { event_link: event_link });
    }
    //#endregion
    //#region init camera
    {
        const OnEnter = ()=>{}
        const OnUpdate = (delta)=>{}
        const OnExit = ()=>{}
        const event_link = EVENTS.EventLink([
            { name:'enter', handler:OnEnter },
            { name:'update', handler:OnUpdate },
            { name:'exit', handler:OnExit }
        ]);
        Object.assign(camera, { event_link: event_link });
    }
    //#endregion
    return {
        scene: scene,
        camera: camera
    }
}

export default Page
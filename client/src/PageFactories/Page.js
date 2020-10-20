import * as THREE from 'three'
import * as EVENTS from '../FastImports/Events.js'

const Page = ()=>{
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    //#region scene event link
    {
        const OnEnter = ()=>{
            //console.log('Scene: enter');
        }
        const OnUpdate = (delta)=>{
            //console.log('Scene: update');
        }
        const OnExit = ()=>{
            //console.log('Scene: exit');
        }
        const event_link = EVENTS.EventLink([
            { name:'enter', handler:OnEnter },
            { name:'update', handler:OnUpdate },
            { name:'exit', handler:OnExit }
        ]);
        Object.assign(scene, { event_link:event_link });
    }
    //#endregion
    //#region camera event link
    {
        const OnEnter = ()=>{
            //console.log('Camera: enter');
        }
        const OnUpdate = (delta)=>{
            //console.log('Camera: update');
        }
        const OnExit = ()=>{
            //console.log('Camera: exit');
        }
        const event_link = EVENTS.EventLink([
            { name:'enter', handler:OnEnter },
            { name:'update', handler:OnUpdate },
            { name:'exit', handler:OnExit }
        ]);
        Object.assign(camera, { event_link:event_link });
    }
    //#endregion

    return {
        scene:scene,
        camera:camera
    }
}

export default Page
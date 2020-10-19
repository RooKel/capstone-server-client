//#region imports
import * as THREE from 'three'

import EventChain from '../Events/EventChain.js'
//#endregion

const Page  = ()=>{
    //#region init
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    const OnStart = ()=>{
        console.log('Page: start');
    }
    const OnUpdate = (args)=>{
        //console.log('Page: update: ' + args[0]);
    }
    const OnDispose = ()=>{
        console.log('Page: dispose');
    }
    const event_chain = EventChain([
        { name:'start', handler:OnStart },
        { name:'update', handler:OnUpdate },
        { name:'dispose', handler:OnDispose }
    ]);
    //#endregion
    return {
        scene: scene,
        camera: camera,
        event_chain: event_chain,
    }
}

export default Page
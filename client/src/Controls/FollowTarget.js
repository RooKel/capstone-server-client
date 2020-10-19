//#region imports
import EventChain from '../Events/EventChain.js'
//#endregion

const FollowTarget = ()=>{
    //#region init
    const OnStart = ()=>{
        console.log('FollowTarget: start');
    }
    const OnUpdate = (delta)=>{
        console.log('FollowTarget: update: ' + args[0]);
    }
    const OnDispose = ()=>{
        console.log('FollowTarget: dispose');
    }
    const event_chain = EventChain([
        { name:'start', handler:OnStart },
        { name:'update', handler:OnUpdate },
        { name:'dispose', handler:OnDispose }
    ]);
    //#endregion

    return {
        event_chain: event_chain,
    }
}

export default FollowTarget
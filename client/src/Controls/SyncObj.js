//#region imports
import EventChain from '../Events/EventChain.js'
//#endregion

const SyncObj = ()=>{
    //#region event handlers
    
    //#endregion
    //#region init
    const OnStart = ()=>{
        console.log('SyncObj: start');
    }
    const OnUpdate = (delta)=>{
        console.log('SyncObj: update: ' + args[0]);
    }
    const OnDispose = ()=>{
        console.log('SyncObj: dispose');
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

export default SyncObj
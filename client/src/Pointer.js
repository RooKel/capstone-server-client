import { Raycaster } from 'three'
import EventLink from './EventLink.js'

const Pointer = (camera, objsToTest)=>{
    const pointer_pos = { x:undefined, y:undefined };
    const raycaster = new Raycaster();
    let click = false;
    //#region input event handlers
    const OnMouseMove = (e)=>{
        pointer_pos.x = ( e.clientX / window.innerWidth ) * 2 - 1;
        pointer_pos.y = ( e.clientY / window.innerHeight ) * 2 - 1;
    }
    const OnMouseDown = (e)=>{
        click = true;
    }
    //#endregion
    //#region event link event handlers
    const OnEnter = ()=>{
        document.addEventListener('mousemove', OnMouseMove);
        document.addEventListener('mousedown', OnMouseDown);
    }
    const OnExit = ()=>{
        document.removeEventListener('mousemove', OnMouseMove);
        document.removeEventListener('mousedown', OnMouseDown);
    }
    const OnUpdate = (delta)=>{
        if(pointer_pos.x && pointer_pos.y){
            raycaster.setFromCamera(pointer_pos, camera);
            let closest = null;
            let closest_dist = null;
            objsToTest.forEach((_)=>{
                _.event_link.Invoke('idle');
                const intersection = raycaster.intersectObject(_, true);
                if(intersection.length > 0){
                    if((closest === null || intersection[0].distance < closest_dist) && _.visible){
                        closest_dist = intersection[0].distance;
                        closest = _;
                    }
                }
            });
            if(closest && closest.event_link){
                if(!click) 
                    closest.event_link.Invoke('hover');
                else {
                    closest.event_link.Invoke('interact');
                    click = false;
                }
            }
        }
    }
    //#endregion
    const event_link = EventLink([
        { name:'enter', handler:OnEnter },
        { name:'exit', handler:OnExit },
        { name:'update', handler:OnUpdate }
    ]);
    return {
        event_link: event_link,
    }
}

export default Pointer
import { Raycaster } from "three";

const Pointer = (sigs, camera, objs_to_test)=>{
    const pointer_pos = { x:undefined, y:undefined };
    const click = { left:false, right:false };
    const raycaster = new Raycaster();
    //#region input event handlers
    const OnMouseMove = (e)=>{
        pointer_pos.x = ( e.clientX / window.innerWidth ) * 2 - 1;
        pointer_pos.y = ( e.clientY / window.innerHeight ) * 2 - 1;
    }
    const OnMouseUp = (e)=>{
        switch(e.button){
            case 0:
                click.left = true;
                break;
            case 2:
                click.right = true;
                break;
        }
    }
    //#endregion
    //#region signals event handlers
    const OnEnter = ()=>{
        //console.log('Pointer: enter');
        document.addEventListener('mousemove', OnMouseMove);
        document.addEventListener('mouseup', OnMouseUp);
    }
    const OnExit = ()=>{
        //console.log('Pointer: exit');
        document.removeEventListener('mousemove', OnMouseMove);
        document.removeEventListener('mouseup', OnMouseUp);
    }
    const OnUpdate = (delta)=>{
        //console.log('Pointer: update');
        if(!pointer_pos.x && !pointer_pos.y) return;
        raycaster.setFromCamera(pointer_pos, camera);
        let closest = null;
        let closest_dist = undefined;
        objs_to_test.forEach((_)=>{
            const intersection = raycaster.intersectObject(_, true);
            if(intersection.length > 0){
                if((closest === null || intersection[0].distance < closest_dist) && _.visible){
                    closest = _;
                    closest_dist = intersection[0].distance;
                }
            }
        });
        if(closest){
            if(click.left && closest.sigs.click){
                closest.sigs.click.dispatch();
                click.left = false;
            }
            else if(closest.sigs.hover){
                closest.sigs.hover.dispatch();
            }
        }
    }
    sigs.enter.add(OnEnter);
    sigs.exit.add(OnExit);
    sigs.update.add(OnUpdate);
    //#endregion
}

export default Pointer
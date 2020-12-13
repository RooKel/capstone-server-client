import { Raycaster } from 'three'

const Pointer = (page_sigs, camera, interactable)=>{
    const raycaster = new Raycaster();
    const pointer_pos = { x:undefined, y:undefined };
    const click = { left:false, right:false };
    let active = true;
    const Active = (input)=>{
        active = input;
    }
    //#region input event handlers
    const OnMouseMove = (e)=>{
        pointer_pos.x = ( e.clientX / window.innerWidth ) * 2 - 1;
        pointer_pos.y = -(( e.clientY / window.innerHeight ) * 2 - 1);
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
    page_sigs.enter.add(()=>{
        document.addEventListener('mousemove', OnMouseMove);
        document.addEventListener('mouseup', OnMouseUp);
    });
    page_sigs.exit.add(()=>{
        document.removeEventListener('mousemove', OnMouseMove);
        document.removeEventListener('mouseup', OnMouseUp);
    });
    page_sigs.update.add(()=>{
        if(!active || !pointer_pos.x || !pointer_pos.y) return;
        raycaster.setFromCamera(pointer_pos, camera);
        let closest = undefined;
        let closest_dist = undefined;
        interactable.forEach((_)=>{
            const intersection = raycaster.intersectObject(_, true);
            if(intersection.length > 0){
                if(closest && closest_dist < intersection[0].distance) return;
                closest = _;
                closest_dist = intersection[0].distance;
            }
        });
        interactable.forEach((_)=>{
            if(_ !== closest && _.sigs.idle)
                _.sigs.idle.dispatch();
        });
        if(closest){
            if(closest.sigs.left_click && click.left)
                closest.sigs.left_click.dispatch();
            else if(closest.sigs.hover)
                closest.sigs.hover.dispatch();
        }
        click.left = false;
        click.right = false;
    });
    return {
        Active: (input)=>Active(input)
    }
}

export { Pointer }
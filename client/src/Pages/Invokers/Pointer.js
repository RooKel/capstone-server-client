import { Raycaster } from 'three'

const Pointer = (page_sigs, camera, objs_to_test)=>{
    const raycaster = new Raycaster();
    const pointer_pos = { x:undefined, y:undefined };
    const click = { left:false, right:false };
    const pressed = { left:false, right:false };
    let scroll = 0;
    let active = true;
    //#region input event handlers
    const OnMouseMove = (e)=>{
        pointer_pos.x = ( e.clientX / window.innerWidth ) * 2 - 1;
        pointer_pos.y = -(( e.clientY / window.innerHeight ) * 2 - 1);
    }
    const OnMouseUp = (e)=>{
        switch(e.button){
            case 0:
                click.left = true;
                pressed.left = false;
                break;
            case 2:
                click.right = true;
                pressed.right = false;
                break;
        }
    }
    const OnMouseDown = (e)=>{
        switch(e.button){
            case 0:
                pressed.left = true;
                break;
            case 2:
                pressed.right = true;
                break;
        }
    }
    const OnWheel = (e)=>{
        wheel = e.deltaY;
    }
    //#endregion
    page_sigs.enter.add(()=>{
        document.addEventListener('mousemove', OnMouseMove);
        document.addEventListener('mouseup', OnMouseUp);
        document.addEventListener('mousedown', OnMouseDown);
        document.addEventListener('wheel', OnWheel);
    });
    page_sigs.exit.add(()=>{
        document.removeEventListener('mousemove', OnMouseMove);
        document.removeEventListener('mouseup', OnMouseUp);
        document.removeEventListener('mousedown', OnMouseDown);
        document.removeEventListener('wheel', OnWheel);
    });
    page_sigs.update.add(()=>{
        if(active && pointer_pos.x && pointer_pos.y){
            raycaster.setFromCamera(pointer_pos, camera);
            let closest, closest_dist;
            objs_to_test.forEach((_)=>{
                if(!_.sigs || !_.visible) return;
                const intersection = raycaster.intersectObject(_, true);
                if(intersection.length > 0){
                    if(closest && intersection[0] > closest_dist) return;
                    closest = _;
                    closest_dist = intersection[0].distance;
                }
            });
            if(closest){
                if(closest.sigs.left_click && click.left)
                    closest.sigs.left_click.dispatch();
                else if(closest.sigs.right_click && click.right)
                    closest.sigs.right_click.dispatch();
                else if(closest.sigs.scroll && scroll > 0)
                    closest.sigs.scroll.dispatch(scroll);
                else if(closest.sigs.left_pressed && pressed.left)
                    closest.sigs.left_pressed.dispatch();
                else if(closest.sigs.right_pressed && pressed.right)
                    closest.sigs.right_pressed.dispatch();
                else if(closest.sigs.hover)
                    closest.sigs.hover.dispatch();
            }
        }
        click.left = click.right = false;
        scroll = 0;
    });
    const sigs = {
        active: new signals.Signal()
    }
    sigs.active.add((_active)=>{
        active = _active;
    });
    return {
        sigs: sigs
    }
}

export { Pointer }
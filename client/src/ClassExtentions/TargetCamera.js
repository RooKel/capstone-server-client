//#region imports
import { Object3D, Vector3 } from 'three'
//#endregion

const TargetCamera = (page)=>{
    let target = undefined;
    let camera = page.camera;

    //#region page event handlers
    const OnUpdate = (delta)=>{
        if(!target)
            target = page.GetMyObj();
        camera.position.lerp(target.position, 0.5);
      //  console.log(camera.position);
    }
    //#endregion
    //#region register page event handlers
    page.events.on('update', OnUpdate);
    //#endregion

    //#region public functions
    const ChangeTarget = (obj)=>{
        if(obj === 'default'){
            target = default_target;
            return;
        }
        if(!(obj instanceof Object3D))
            return;
        target = obj;
    }
    //#endregion

    return {
        ChangeTarget: (obj)=>ChangeTarget(obj),
    }
}

export default TargetCamera
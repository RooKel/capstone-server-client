import {Color} from 'three'

const ColorSetter = (dest, params)=>{
    if(params.type === 'light'){
        dest.color = new Color(params.color);
    }
    else{
        dest.material.color = new Color(params.color);
    }
}

export {ColorSetter}
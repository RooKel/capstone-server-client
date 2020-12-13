import {Color} from 'three'

const ColorSetter = (dest, params)=>{
    dest.material.color = new Color(params.color);
}

export {ColorSetter}
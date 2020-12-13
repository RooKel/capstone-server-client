import {ColorSetter} from './ColorSetter.js'

const PrefabMap = (prefab_name)=>{
    switch(prefab_name){
        case 'color_setter':
            return ColorSetter;
    }
}

export {PrefabMap}
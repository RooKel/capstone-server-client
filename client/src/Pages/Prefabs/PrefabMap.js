import {ColorSetter} from './ColorSetter.js'
import {ToggleVisibility} from './ToggleVisibility.js'
import {Inspector} from './Inspector.js'

const PrefabMap = (prefab_name)=>{
    switch(prefab_name){
        case 'color_setter':
            return ColorSetter;
        case 'toggle_visibility':
            return ToggleVisibility;
        case 'inspector':
            return Inspector;
    }
}

export {PrefabMap}
import * as EVENTS from '../Events/Import.js'

const WASD = (out)=>{
    //#region init
    const wasd = [ false, false, false, false ];
    const keymap = {
        0:[ 'KeyW', 'ArrowUp' ],
        1:[ 'KeyA', 'ArrowLeft' ],
        2:[ 'KeyS', 'ArrowDown' ],
        3:[ 'KeyD', 'ArrowRight' ],
    }
    //#region init event link
    //#region input event handlers
    const TranslateKeyCode = (code)=>{
        for(let key in keymap){
            if(keymap[key].find((_)=>_===code))
                return key;
        }
        return -1;
    }
    const OnKeyDown = (e)=>{
        let index = TranslateKeyCode(e.code);
        if(index === -1)
            return;
        wasd[index] = true;
    }
    const OnKeyUp = (e)=>{
        let index = TranslateKeyCode(e.code);
        if(index === -1)
            return;
        wasd[index] = false;
    }
    //#endregion
    //#region event link event handlers
    const AnalyzeInput = (delta)=>{
        let horizontal = 0;
        let vertical = 0;

        if((wasd[1] && wasd[3]) || (!wasd[1] && !wasd[3]))
            horizontal = 0;
        else if(wasd[1])
            horizontal = -1;
        else
            horizontal = 1;

        if((wasd[0] && wasd[2]) || (!wasd[0] && !wasd[2]))
            vertical = 0;
        else if(wasd[0])
            vertical = 1;
        else
            vertical = -1;

        out.move_dx = horizontal * delta;
        out.move_dy = vertical * delta;
    }
    const OnInit = ()=>{
        document.addEventListener('keydown', OnKeyDown);
        document.addEventListener('keyup', OnKeyUp);
    }
    const OnUpdate = (delta)=>{
        AnalyzeInput(delta);
    }
    const OnDispose = ()=>{
        document.removeEventListener('keydown', OnKeyDown);
        document.removeEventListener('keyup', OnKeyUp);
    }
    //#endregion
    const event_link = EVENTS.EventLink([
        { name:'init', handler:OnInit },
        { name:'update', handler:OnUpdate },
        { name:'dispose', handler:OnDispose }
    ])
    //#endregion
    //#endregion
    return {
        event_link: event_link
    }
}

export default WASD
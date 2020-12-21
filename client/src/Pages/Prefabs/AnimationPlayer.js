

const AnimationPlayer = (dest, params)=>{
    const animation_action = params.animation_action;
    const anim_name = params.name;
    if(!animation_action[params.name]) return;
    for(let i in animation_action){
        animation_action[i].stop(); 
    }
    animation_action[params.name].play();
}

export {AnimationPlayer}
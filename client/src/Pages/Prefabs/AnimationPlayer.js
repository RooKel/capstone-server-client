

const AnimationPlayer = (dest, params)=>{
    const animation_action = params.animation_action;
    const anim_name = params.anim_name;
    if(!animation_action[anim_name]) return;
    for(let i in animation_action){
        animation_action[i].stop(); 
    }
    animation_action[anim_name].play();
}

export {AnimationPlayer}
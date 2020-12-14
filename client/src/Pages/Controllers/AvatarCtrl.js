import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {AnimationMixer, Box3, Vector3} from 'three'
import {Nameplate} from './Nameplate.js'

const AvatarCtrl = (group, socket, uid, ftm, page, data, client_data)=>{
    const loader = new GLTFLoader();
    let mixer = undefined;
    let animation_action = { };
    let avatar_id = undefined;
    let temp_avatar_cont = undefined;

    const nameplate = Nameplate(data.nickname, group, client_data, page);
    page.scene.add(nameplate);

    const OnFileDownload = (result)=>{
        if(result.request_type === 'gltf' && result.category === 'avatar' && result.data[0].uid === avatar_id){
            socket.emit('check-avatar-id', {uid:uid, avatar_id:result.data[0].uid});
            temp_avatar_cont = result.data[0].data;
            binding.active = false;
        }
    }
    const binding = ftm.signals.file_download.add(OnFileDownload);
    binding.active = false;
    //#region socket event handlers
    const OnUpdateAvatar = (_uid, _avatar_id)=>{
        if(uid !== _uid) return;
        binding.active = true;
        ftm.requestFileDownload('gltf', 'avatar', _avatar_id);
        avatar_id = _avatar_id;
    }
    const OnCheck = (ack_res)=>{
        if(ack_res.uid === uid && ack_res.result){
            loader.parse(temp_avatar_cont, '', (loaded)=>{
                group.add(loaded.scene);
                group.remove(group.children[0]);
                mixer = new AnimationMixer(loaded.scene);
                loaded.scene.traverse((_)=>{
                    if(_.userData === undefined) return;
                    if(_.userData.animSet === undefined) return;
                    if(_.userData.animSet.length === 0) return;
                    for(let a = 0; a < _.userData.animSet.length; a++){
                        let animByState = loaded.animations.find(
                            (anim)=>{
                                return anim.name === _.userData.animSet[a].animation;
                            }
                        );
                        animation_action[_.userData.animSet[a].state] = mixer.clipAction(animByState, _);
                    }
                });
                const bbox = new Box3().setFromObject(loaded.scene);
                nameplate.sigs.change_offset.dispatch(new Vector3(0,bbox.max.y + 0.25,0));
            });
        }
    }
    //#endregion
    group.sigs.init.add(()=>{
        socket.on('update-avatar', OnUpdateAvatar);
        socket.on('check-avatar-id-ack', OnCheck);
    });
    group.sigs.dispose.add(()=>{
        socket.off('update-avatar', OnUpdateAvatar);
        socket.off('check-avatar-id-ack', OnCheck);
        nameplate.sigs.dispose.dispatch();
    });
    page.sigs.update.add((delta)=>{
        if(mixer) mixer.update(delta);
    });
    const PlayAnim = (anim_name)=>{
        if(!animation_action[anim_name]) return;
        for(let i in animation_action){
            animation_action[i].stop();
        }
        animation_action[anim_name].play();
    }
    return {
        PlayAnim: (anim_name)=>PlayAnim(anim_name),
    }
}

export {AvatarCtrl}
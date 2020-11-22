import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import * as THREE from 'three'

const AvatarCtrl = (id, group, socket, ftm, page_sigs, camera)=>{
    let avatar_id = undefined;
    let need_update = false;

    let dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath( '../examples/js/libs/draco/gltf/' );
    const loader = new GLTFLoader();
    loader.setDRACOLoader( dracoLoader );

    //#region socket event handlers
    const OnUpdateAvatar = (uid, _avatar_id)=>{
        if(id !== uid) return;
        ftm.requestFileDownload('gltf', 'avatar', _avatar_id);
        avatar_id = _avatar_id;
        need_update = true;
    }
    //#endregion
    let mixer = undefined;
    let animation_action = { };
    const OnInit = ()=>{
        socket.on('update-avatar', OnUpdateAvatar);
        ftm.addFileDownloadListener((result)=>{
            if(result.request_type === 'gltf' && result.category === 'avatar'){
                if(need_update && result.data[0].uid === avatar_id){
                    loader.parse(result.data[0].data, '', (loaded)=>{                      
                        group.add(loaded.scene);
                        group.remove(group.children[0]);
                        mixer = new THREE.AnimationMixer(loaded.scene);
                        loaded.scene.traverse((_)=>{
                            if(_.userData === undefined) return;
                            if(_.userData.animSet === undefined) return;
                            if(_.userData.animSet.length === 0) return;
                            for(let a = 0; a < _.userData.animSet.length; a++){
                                let animByState = loaded.animations.find(
                                    (anim)=>{
                                        return anim.name === _.userData.animSet[a].animation
                                    }
                                );
                                animation_action[_.userData.animSet[a].state] = mixer.clipAction(animByState);
                            }
                        });
                        animation_action['walk'].crossFadeIn(animation_action['idle'], 0.2, true);
                        animation_action['idle'].crossFadeIn(animation_action['walk'], 0.2, true);
                    });
                    need_update = false;
                }
            }
        });
    }
    const OnDispose = ()=>{
        socket.off('update-avatar', OnUpdateAvatar);
    }
    group.sigs.init.add(OnInit);
    group.sigs.dispose.add(OnDispose);
    page_sigs.update.add((delta)=>{
        if(mixer) mixer.update(delta);
    });
    const PlayAnim = (anim_name)=>{
        console.log(anim_name);
        animation_action[anim_name].play();
    }
    return {
        PlayAnim: (anim_name)=>PlayAnim(anim_name),
    }
}

export { AvatarCtrl }
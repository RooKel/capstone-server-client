import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import * as THREE from 'three'

const AvatarCtrl = (id, group, socket, ftm, page_sigs)=>{
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
    let getAnimSet = [ ];
    const OnInit = ()=>{
        socket.on('update-avatar', OnUpdateAvatar);
        ftm.addFileDownloadListener((result)=>{
            if(result.request_type === 'gltf' && result.category === 'avatar'){
                if(need_update && result.data[0].uid === avatar_id){
                    loader.parse(result.data[0].data, '', (loaded)=>{
                        console.log(loaded.scene.children[0].children[0]);
                        
                        group.add(loaded.scene);
                        group.remove(group.children[0]);
                        loaded.scene.traverse((_)=>{
                            if(_.userData === undefined) return;
                            if(_.userData.animSet === undefined) return;
                            if(_.userData.animSet.length === 0) return;
                            for(let a = 0; a < _.userData.animSet.length; a++){
                                let animByName = loaded.animations.find(
                                    anim=>anim.name == _.userData.animSet[a].animation
                                );
                                getAnimSet.push(animByName);
                                mixer = new THREE.AnimationMixer(_);
                                mixer.clipAction(getAnimSet[0], _).play();
                            }
                        });
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
}

export { AvatarCtrl }
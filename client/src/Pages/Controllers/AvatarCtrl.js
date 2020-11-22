import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import * as THREE from 'three'
import { BufferGeometry } from 'three';

const AvatarCtrl = (id, model, socket, ftm)=>{
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
    const OnInit = ()=>{
        socket.on('update-avatar', OnUpdateAvatar);
        ftm.addFileDownloadListener((result)=>{
            if(result.request_type === 'gltf' && result.category === 'avatar'){
                if(need_update && result.data[0].uid === avatar_id){
                    loader.parse(result.data[0].data, '', (result)=>{
                        var scene = result.scene;
                        model.geometry.dispose();
                        
                    });
                    need_update = false;
                }
            }
        });
    }
    const OnDispose = ()=>{
        socket.off('update-avatar', OnUpdateAvatar);
    }
    model.sigs.init.add(OnInit);
    model.sigs.dispose.add(OnDispose);
    
}

export { AvatarCtrl }
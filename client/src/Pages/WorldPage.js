import {Page} from './Page.js'
import {Pointer} from './Invoker/Pointer.js'
import {Canvas} from './UI/Canvas.js'
import {MainPanel} from './UI/Panels/MainPanel.js'
import {UserDataPanel} from './UI/Panels/UserDataPanel.js'
import {SelectAvatarPanel} from './UI/Panels/SelectAvatarPanel.js'
import {EnterInstPanel} from './UI/Panels/EnterInstPanel.js'
import {CreateInstPanel} from './UI/Panels/CreateInstPanel.js'
import {SelectWorldPanel} from './UI/Panels/SelectWorldPanel.js'
import {ButtonType1, LoadingPanel} from './UI/Templates.js'
import {Color, AudioListener, PositionalAudio, AudioContext, AnimationMixer, LogLuvEncoding} from 'three'
import {UserManager} from './Comms/UserManager.js'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {ColorSetter} from './Prefabs/ColorSetter.js'
import {Inspector} from './Prefabs/Inspector.js'
import {PlayAudio} from './Prefabs/PlayAudio.js'
import {AnimationPlayer} from './Prefabs/AnimationPlayer.js'
import * as MINT from './Interaction/MouseInteraction.js'
import {PackageUtil} from './PackageUtil/PackageUtil.js'

const WorldPage = (socket, ftm, client_data, app_sigs, world_id, instance_id)=>{
    const page = Page();
    page.scene.background = new Color(0xF0F0F0);
    const listener = new AudioListener();
    page.camera.add(listener);
    const loader = new GLTFLoader();
    const interactable = [ ];
    const pointer = Pointer(page.sigs, page.camera, interactable);
    let audio_files = [ ]; 
    const all_pos_audio = [ ];
    const obj_mixers = [ ];
    let ui_on = false;
    const three_canvas = document.getElementById('three-canvas');
    three_canvas.requestPointerLock = three_canvas.requestPointerLock || three_canvas.mozRequestPointerLock;
    //#region ui
    const loading_panel = LoadingPanel();
    Object.assign(loading_panel, {sigs:{}});
    const ui_interactable = [ ];
    const canvas = Canvas(page.sigs);
    const ui_pointer = Pointer(page.sigs, canvas.camera, ui_interactable);
    const navigate = { };
    const main_panel = MainPanel(ui_interactable, socket, ftm, navigate, client_data);
    const return_to_start_button = ButtonType1('Return', ()=>{
        socket.emit('rq-exit-instance', true);
        app_sigs.change_page.dispatch('start');
        main_panel.sigs.toggle_off.dispatch(false);
    });
    const menu_close_button = ButtonType1('Close', ()=>{
        main_panel.sigs.toggle_off.dispatch(false);
        ui_on = false;
        ui_pointer.Active(false);
        pointer.Active(true);
        navigate.current = undefined;
    });
    main_panel.body.add(return_to_start_button);
    main_panel.footer.add(menu_close_button);
    ui_interactable.push(return_to_start_button, menu_close_button, loading_panel);
    const user_data_panel = UserDataPanel(ui_interactable, socket, ftm, navigate, client_data);
    const select_avatar_panel = SelectAvatarPanel(ui_interactable, socket, ftm, navigate, client_data);
    const enter_inst_panel = EnterInstPanel(ui_interactable, socket, ftm, navigate, client_data);
    const create_inst_panel = CreateInstPanel(ui_interactable, socket, ftm, navigate, client_data);
    const select_world_panel = SelectWorldPanel(ui_interactable, socket, ftm, navigate, client_data);
    Object.assign(navigate, {
        current: undefined,
        main: main_panel,
        user_data: user_data_panel,
        select_avatar: select_avatar_panel,
        enter_inst: enter_inst_panel,
        create_inst: create_inst_panel,
        select_world: select_world_panel,
    });
    canvas.scene.add(main_panel, user_data_panel, select_avatar_panel, enter_inst_panel, create_inst_panel, select_world_panel, loading_panel);
    //#endregion
    //#region input event handlers
    const OnKeyUp = (e)=>{
        switch(e.code){
            case 'Escape':
                ui_on = !ui_on;
                if(!ui_on){
                    navigate[navigate.current].sigs.toggle_off.dispatch();
                    navigate.current = undefined;
                    ui_pointer.Active(false);
                    pointer.Active(true);
                }
                else{
                    main_panel.sigs.toggle_on.dispatch();
                    ui_pointer.Active(true);
                    pointer.Active(false);
                }
                break;
        }
    }
    const OnMouseDown = (e)=>{
        if(e.button === 0 && !ui_on)
            three_canvas.requestPointerLock();
    }
    //#endregion
    //#region load world
    const LoadGLTF = (gltf)=>{
        const awake_objects = [ ];
        loader.parse(gltf, '', (loaded)=>{
            page.scene.add(loaded.scene);
            loaded.scene.traverse((_)=>{
                if(!_.userData) return;
                if(!_.userData.script) return;
                if(_.userData.script.length <= 0) return;
                const components = [ ];
                _.userData.script.forEach((__)=>{
                    const temp_func = new Function(__.source + '\nreturn prefabMeta;');
                    components.push(temp_func());
                });
                if(components.length <= 0) return;
                components.forEach((__)=>{
                    //#region find targets
                    const target_uuid = __.src_prefab_properties.trigger_meta_info.dest_user_data_id[0];
                    let target = undefined;
                    loaded.scene.traverse((___)=>{
                        if(!___.userData) return;
                        if('' + ___.userData.id === '' + target_uuid){
                            target = ___;
                        }
                    });
                    //#endregion
                    let prefab = undefined;
                    const params = __.src_prefab_properties.trigger_meta_info.dest_prefab_properties;
                    switch(__.src_prefab_properties.trigger_meta_info.dest_prefab){
                        case 'color_setter':
                            prefab = ColorSetter;
                            break;
                        case 'inspector':
                            prefab = Inspector;
                            params['canvas'] = canvas;
                            params['camera'] = page.camera;
                            params['pointer'] = pointer;
                            params['call_menu'] = OnKeyUp;
                            break;
                        case 'audio_player':
                            prefab = PlayAudio;
                            const lookfor = __.src_prefab_properties.trigger_meta_info.dest_prefab_properties.audioID;
                            let blob = audio_files.find((audio)=>audio.audioID===lookfor).dataBuffer;
                            let context = AudioContext.getContext();
                            let sound = new PositionalAudio(listener);
                            params['audio_file'] = sound;
                            blob.arrayBuffer().then(buffer=>{
                                context.decodeAudioData(buffer, function (audioBuffer) {
                                    sound.setBuffer(audioBuffer);
                                    sound.position.copy(target.position);
                                    all_pos_audio.push(sound);
                                });
                            });
                            break;
                        case 'animation_player':
                            prefab = AnimationPlayer;
                            const mixer = new AnimationMixer(target);
                            const animation_action = { };
                            target.traverse((___)=>{
                                if(___.userData === undefined) return;
                                if(___.userData.animSet === undefined) return;
                                if(___.userData.animSet.length === 0) return;
                                for(let a = 0; a < ___.userData.animSet.length; a++){
                                    let animByState = loaded.animations.find(
                                        (anim)=>{
                                            return anim.name === ___.userData.animSet[a].animation;
                                        }
                                    );
                                    animation_action[___.userData.animSet[a].state] = mixer.clipAction(animByState, ___);
                                }
                            });
                            params['animation_action'] = animation_action;
                            obj_mixers.push(mixer);
                            break;
                    }
                    if(!__.is_global){
                        switch(__.src_prefab){
                            case 'hover':
                                MINT.Hover(_, ()=>prefab(target, params));
                                interactable.push(_);
                                break;
                            case 'left_click':
                                MINT.LeftClick(_, ()=>prefab(target, params));
                                interactable.push(_);
                                break;
                            case 'idle':
                                MINT.Idle(_, ()=>prefab(target, params));
                                interactable.push(_);
                                break;
                            case 'awake':
                                //params['audio_file'].autoplay = true;
                                params['awake'] = true;
                                awake_objects.push(()=>prefab(target, params));
                                break;
                        }
                    }
                    else{
                        const OnAck = (ack_info)=>{
                            if(ack_info.uid === _.userData.id){
                                prefab(target, params);
                            }
                        }
                        socket.on('interaction-ack', OnAck);
                        switch(__.src_prefab){
                            case 'hover':
                                MINT.Hover(_, ()=>socket.emit('interaction', {instance_id: instance_id, uid: _.userData.id}));
                                interactable.push(_);
                                break;
                            case 'left_click':
                                MINT.LeftClick(_, ()=>socket.emit('interaction', {instance_id: instance_id, uid: _.userData.id}));
                                interactable.push(_);
                                break;
                            case 'idle':
                                MINT.Idle(_, ()=>socket.emit('interaction', {instance_id: instance_id, uid: _.userData.id}));
                                interactable.push(_);
                                break;
                            case 'awake':
                                params['awake'] = true;
                                awake_objects.push(()=>prefab(target, params));
                                break;
                        }
                    }
                });
            });
            const data_array = [ ];
            loaded.scene.traverse((_)=>{
                const data_tuple = { 
                    id:         _.userData.id,
                    instance:   {
                        instance_id:    instance_id,
                        position:       _.position,
                        quaternion:     _.quaternion,
                        scale:          _.scale,
                        userData:       _.userData,
                    }
                };
                data_array.push(data_tuple);
            });
            //socket.emit('world-init', data_array);
            awake_objects.forEach((_)=>{
                _();
            });
        });
        canvas.scene.remove(loading_panel);
        document.addEventListener('keyup', OnKeyUp);
        socket.on('join-accept', OnJoinAccept);
        document.addEventListener('mousedown', OnMouseDown);
    }
    const OnFileDownload = (result)=>{
        if(result.request_type === 'zip' && result.category === 'world' && world_id === result.data[0].uid) {
            PackageUtil.convBinaryToPackage(result.data[0].data, (conv_result)=>{
                PackageUtil.convFilesToAudioData(conv_result.audioMetaInfo, conv_result.audioFiles, (audio_conv_result)=>{
                    audio_files = [...audio_conv_result];
                    LoadGLTF(conv_result.gltf.asText());
                });
            });
            binding.active = false;
        }
    }
    const binding = ftm.signals.file_download.add(OnFileDownload);
    //#endregion
    //#region socket event handlers
    const OnJoinAccept = (world_id, instance_id)=>{
        app_sigs.change_page.dispatch('world', world_id, instance_id);
    }
    //#endregion
    const user_manager = UserManager(socket, ftm, client_data, page);
    page.sigs.enter.add(()=>{
        loading_panel.position.z = -1;
        ftm.requestFileDownload('zip', 'world', world_id);
    });
    page.sigs.update.add((delta)=>{
        obj_mixers.forEach((_)=>_.update(delta));
    });
    page.sigs.exit.add(()=>{
        document.removeEventListener('keyup', OnKeyUp);
        socket.off('join-accept', OnJoinAccept);
        all_pos_audio.forEach((_)=>{
            if(!_) return;
            if(_ === null) return;
            _.stop();
        });
        document.removeEventListener('mousedown', OnMouseDown);
    });
    return page;
}

export {WorldPage}
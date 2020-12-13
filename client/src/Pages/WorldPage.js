import {Page} from './Page.js'
import {Pointer} from './Invoker/Pointer.js'
import {Canvas} from './UI/Canvas.js'
import {MainPanel} from './UI/Panels/MainPanel.js'
import {UserDataPanel} from './UI/Panels/UserDataPanel.js'
import {SelectAvatarPanel} from './UI/Panels/SelectAvatarPanel.js'
import {EnterInstPanel} from './UI/Panels/EnterInstPanel.js'
import {CreateInstPanel} from './UI/Panels/CreateInstPanel.js'
import {SelectWorldPanel} from './UI/Panels/SelectWorldPanel.js'
import {ButtonType1} from './UI/Templates.js'
import {Color, DirectionalLight, AudioListener, PositionalAudio, AudioLoader, Vector2} from 'three'
import {UserManager} from './Comms/UserManager.js'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'

import {ColorSetter} from './Prefabs/ColorSetter.js'
import {ToggleVisibility} from './Prefabs/ToggleVisibility.js'
import {Inspector} from './Prefabs/Inspector.js'

import * as MINT from './Interaction/MouseInteraction.js'

const WorldPage = (socket, ftm, client_data, app_sigs, world_id)=>{
    const page = Page();
    page.scene.background = new Color(0xF0F0F0);
    const listener = new AudioListener();
    page.camera.add(listener);
    const loader = new GLTFLoader();
    const interactable = [ ];
    const pointer = Pointer(page.sigs, page.camera, interactable);
    //#region ui
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
        page.camera.sigs.init.dispatch();
        main_panel.sigs.toggle_off.dispatch(false);
        ui_on = false;
        ui_pointer.Active(false);
        pointer.Active(true);
        navigate.current = undefined;
    });
    main_panel.body.add(return_to_start_button);
    main_panel.footer.add(menu_close_button);
    ui_interactable.push(return_to_start_button, menu_close_button);
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
    canvas.scene.add(main_panel, user_data_panel, select_avatar_panel, enter_inst_panel, create_inst_panel, select_world_panel);
    //#endregion
    //#region input event handlers
    let ui_on = false;
    const OnKeyUp = (e)=>{
        switch(e.code){
            case 'Escape':
                ui_on = !ui_on;
                if(!ui_on){
                    page.camera.sigs.init.dispatch();
                    navigate[navigate.current].sigs.toggle_off.dispatch();
                    navigate.current = undefined;
                    ui_pointer.Active(false);
                    pointer.Active(true);
                }
                else{
                    page.camera.sigs.dispose.dispatch();
                    main_panel.sigs.toggle_on.dispatch();
                    ui_pointer.Active(true);
                    pointer.Active(false);
                }
                break;
        }
    }
    //#endregion
    //#region load world
    const OnFileDownload = (result)=>{
        if(result.request_type === 'gltf' && result.category === 'world' && world_id === result.data[0].uid) {
            loader.parse(result.data[0].data, '', (loaded)=>{
                page.scene.add(loaded.scene);
                loaded.scene.traverse((_)=>{
                    if(!_.userData) return;
                    if(!_.userData.script) return;
                    const components = [ ];
                    _.userData.script.forEach((__)=>{
                        const temp_func = new Function(__.source + '\nreturn prefabMeta;');
                        components.push(temp_func());
                    });
                    if(components.length <= 0) return;
                    //#region find targets
                    const target_uuid = components[0].src_prefab_properties.trigger_meta_info.dest_user_data_id;
                    let target = undefined;
                    loaded.scene.traverse((__)=>{
                        if(!__.userData) return;
                        if('' + __.userData.id === '' + target_uuid){
                            target = __;
                        }
                    });
                    //#endregion
                    let prefab = undefined;
                    switch(components[0].src_prefab_properties.trigger_meta_info.dest_prefab){
                        case 'color_setter':
                            prefab = ColorSetter;
                            break;
                        case 'toggle_visibility':
                            prefab = ToggleVisibility;
                            break;
                        case 'inspector':
                            prefab = Inspector;
                            const params = components[0].src_prefab_properties.trigger_meta_info.dest_prefab_properties;
                            params['canvas'] = canvas;
                            params['camera'] = page.camera;
                            params['pointer'] = pointer;
                            break;
                    }
                    switch(components[0].src_prefab){
                        case 'hover':
                            MINT.Hover(_, ()=>prefab(target, components[0].src_prefab_properties.trigger_meta_info.dest_prefab_properties));
                            break;
                        case 'left_click':
                            MINT.LeftClick(_, ()=>prefab(target, components[0].src_prefab_properties.trigger_meta_info.dest_prefab_properties));
                            break;
                        case 'idle':
                            MINT.Idle(_, ()=>prefab(target, components[0].src_prefab_properties.trigger_meta_info.dest_prefab_properties));
                            break;
                    }
                    interactable.push(_);
                });
            });
            binding.active = false;
        }
    }
    const binding = ftm.signals.file_download.add(OnFileDownload);
    //#endregion
    //#region socket event handlers
    const OnJoinAccept = (world_id)=>{
        app_sigs.change_page.dispatch('world', world_id);
    }
    //#endregion
    const user_manager = UserManager(socket, ftm, client_data, page);
    page.sigs.enter.add(()=>{
        document.addEventListener('keyup', OnKeyUp);
        ftm.requestFileDownload('gltf', 'world', world_id);
        socket.on('join-accept', OnJoinAccept);
    });
    page.sigs.exit.add(()=>{
        document.removeEventListener('keyup', OnKeyUp);
        socket.off('join-accept', OnJoinAccept);
        
    });
    return page;
}

export {WorldPage}
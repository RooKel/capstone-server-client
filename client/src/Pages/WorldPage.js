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
import {Color, DirectionalLight, Loader} from 'three'
import {UserManager} from './Comms/UserManager.js'

const WorldPage = (socket, ftm, client_data, app_sigs, world_id)=>{
    const page = Page();
    page.scene.background = new Color(0xF0F0F0);
    page.scene.add(new DirectionalLight(0xFFFFFF, 1));
    page.camera.position.set(0,1,5);
    //#region ui
    const ui_interactable = [ ];
    const canvas = Canvas(page.sigs);
    const ui_pointer = Pointer(page.sigs, canvas.camera, ui_interactable);
    const navigate = { };
    const main_panel = MainPanel(ui_interactable, socket, ftm, navigate, client_data);
    const return_to_start_button = ButtonType1('Return', ()=>{
        app_sigs.change_page.dispatch('start');
        main_panel.sigs.toggle_off.dispatch(false);
    });
    const menu_close_button = ButtonType1('Close', ()=>{
        main_panel.sigs.toggle_off.dispatch(false);
        ui_on = false;
        ui_pointer.Active(false);
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
                }
                else{
                    page.camera.sigs.dispose.dispatch();
                    main_panel.sigs.toggle_on.dispatch();
                    ui_pointer.Active(true);
                }
                break;
        }
    }
    //#endregion
    //#region load world
    const OnFileDownload = (result)=>{
        if(result.request_type === 'gltf' && result.category === 'world' && world_id === result.data[0].uid) {
            
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
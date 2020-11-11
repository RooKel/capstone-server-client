import EventLink from '../EventLink.js'
import Page from './Page.js'
import * as THREE from 'three'
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js'
import Pointer from '../Pointer.js'
import InputCollector from '../Comms/InputCollector.js'
import UserManager from '../Comms/UserManager.js'
import TMUI from 'three-mesh-ui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import WorldPageMenu from './UI/WorldPageMenu.js'

const WorldPage = (socket, client_data, app_event_link, path)=>{
    const page = Page();
    const input_collector = InputCollector(socket, client_data);
    const user_manager = UserManager(socket, client_data, page.scene, page.camera, input_collector);
    const ui_objs = [ ];
    const ui_pointer = Pointer(page.ui_manager.camera, ui_objs);
    //#region init page
    page.scene.background = new THREE.Color(0xFFFFFF);
    page.scene.add(
        new THREE.LineSegments(
            new BoxLineGeometry( 10, 10, 10, 10, 10, 10 ).translate( 0, 5, 0 ),
            new THREE.LineBasicMaterial( { color: 0x000000 } )
        )
    );
    page.camera.position.set(0,1,4);
    page.ui_manager.AddUIElem(WorldPageMenu(ui_objs));
    //#endregion
    //#region event link event handlers
    const OnEnter = ()=>{
        //console.log('WorldPage: enter');
        const loader = new GLTFLoader();
        loader.load(
            path,
            (gltf)=>{
                page.scene.add(gltf.scene);
            },
            (xhr)=>{
                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
            },
            undefined
        );
    }
    const OnExit = ()=>{
        //console.log('WorldPage: exit');
    }
    const OnUpdate = (delta)=>{
        TMUI.update();
    }
    //#endregion
    const event_link = EventLink([
        { name:'enter', handler:OnEnter },
        { name:'exit', handler:OnExit },
        { name:'update', handler:OnUpdate }
    ]);
    event_link.AddLink(page.scene.event_link);
    event_link.AddLink(page.camera.event_link);
    event_link.AddLink(ui_pointer.event_link);
    event_link.AddLink(page.ui_manager.event_link);
    event_link.AddLink(user_manager.event_link);
    event_link.AddLink(input_collector.event_link);

    Object.assign(page, { event_link: event_link });
    return page;
}

export default WorldPage
import * as THREE from 'three'

import EventLink from './EventLink.js'
import * as TEST from './Pages/TestPages.js'

const App = ()=>{
    const socket = io();
    const client_data = { uid: undefined };
    const clock = new THREE.Clock();
    const pages = [ ];
    let cur_page = undefined;
    //#region event link event handlers
    const OnChangePage = (to)=>{
        console.log(pages.length);
        pages[cur_page].event_link.Invoke('exit');
        pages[to].event_link.Invoke('enter');
        cur_page = to;
    }
    const CreateNewWorld = (path)=>{
        pages.push(TEST.TestWorldPage2(socket, client_data, event_link, path));
    }
    //#endregion
    const event_link = EventLink([
        { name:'change_page', handler:OnChangePage },
        { name:'new_world', handler:CreateNewWorld }
    ]);
    const renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.localClippingEnabled = true;
    renderer.domElement.setAttribute('id', 'three_canvas');
    const Update = ()=>{
        const page = pages[cur_page];
        page.event_link.Invoke('update', clock.getDelta());
        renderer.render(page.scene, page.camera);
    }
    //#region public funcs
    const Start = ()=>{
        //#region init pages
        pages.push(TEST.TestStartPage(socket, client_data, event_link));
        pages.push(TEST.TestWorldPage(socket, client_data, event_link));
        cur_page = 0;
        pages[cur_page].event_link.Invoke('enter');
        //#endregion
        document.body.appendChild(renderer.domElement);
        renderer.setAnimationLoop(Update);
    }
    //#endregion
    return {
        Start: ()=>Start()
    }
}

export default App
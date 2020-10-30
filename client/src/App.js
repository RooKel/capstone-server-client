import * as THREE from 'three'

import * as PAGES from './Pages/Import.js'
import EventLink from './EventLink.js'

const App = ()=>{
    const socket = io();
    const client_data = {
        uid: undefined
    }
    const clock = new THREE.Clock();
    const pages = [ ];
    let cur_page = undefined;
    //#region event link event handlers
    const OnChangePage = (to)=>{
        if(isNaN(to) || to % 1 !== 0 || to < 0 || to >= pages.length)
            return -1;
        pages[cur_page].event_link.Invoke('exit');
        cur_page = to;
        pages[cur_page].event_link.Invoke('enter');
    }
    //#endregion
    const event_link = EventLink([
        { name:'change_page', handler:OnChangePage }
    ]);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.domElement.setAttribute('id', 'three_canvas');
    const Update = ()=>{
        const page = pages[cur_page];
        page.event_link.Invoke('update', clock.getDelta());
        renderer.render(page.scene, page.camera);
    }
    const Start = ()=>{
        //#region init pages
        pages.push(PAGES.StartPage(event_link, socket, client_data));
        pages.push(PAGES.TestPage(event_link, socket, client_data));
        cur_page = 0;
        pages[cur_page].event_link.Invoke('enter');
        //#endregion
        document.body.appendChild(renderer.domElement);
        renderer.setAnimationLoop(Update);
    }
    return {
        Start: ()=>Start()
    }
}

export default App
import * as THREE from 'three'
import * as EVENTS from './Events/Import.js'
import * as PAGES from './Pages/Import.js'

const App = ()=>{
    const socket = io();
    const client_data = { uid:undefined };
    const clock = new THREE.Clock();
    const pages = [ ];
    let cur_page = undefined;
    //#region init event link
    const OnChangePage = (target)=>{
        if(isNaN(target) || target % 1 !== 0 || target < 0 || target >= pages.length)
            return -1;
        pages[cur_page].event_link.Invoke('exit');
        cur_page = target;
        pages[cur_page].event_link.Invoke('enter');
    }
    const event_link = EVENTS.EventLink([
        { name:'change_page', handler:OnChangePage }
    ]);
    //#endregion
    //#region init pages
    pages.push(PAGES.StartPage(
        event_link,
        socket,
        client_data
    ));
    pages.push(PAGES.TestPage(
        event_link,
        socket,
        client_data
    ));
    cur_page = 0;
    //#endregion
    const renderer = new THREE.WebGLRenderer();
    //#region init renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.domElement.setAttribute('id', 'three-canvas');
    //#endregion
    const Update = ()=>{
        pages[cur_page].event_link.Invoke('update', clock.getDelta());
        renderer.render(pages[cur_page].scene, pages[cur_page].camera);
    }
    const Start = ()=>{
        pages[cur_page].event_link.Invoke('enter');
        document.body.appendChild(renderer.domElement);
        renderer.setAnimationLoop(Update);
    }
    return {
        Start: ()=>Start(),
    }
}

export default App
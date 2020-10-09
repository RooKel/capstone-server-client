//#region imports
import { WebGLRenderer, Clock } from 'three';
import { Page } from './src/Page.js'
import { EventQueue } from './src/EventQueue.js'
import * as MakePage from './src/MakePage/MakePage.js'
//#endregion

const App = ()=>{
    const renderer = new WebGLRenderer();
    const clock = new Clock();
    const pages = [ ];
    let cur_page = undefined;
    const events = EventQueue();
    const socket = io();
    let uid = undefined;

    //#region app event handlers
    const onWindowResize = ()=>{
        pages[cur_page].camera.aspect = window.innerWidth/window.innerHeight;
        pages[cur_page].camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }
    window.addEventListener('resize', onWindowResize);
    //#endregion
    //#region init App EventQueue
    events.on('change_room', (args)=>{
        if(args[0] >= pages.length && args[0] < 0)
            return;
        pages[cur_page].events.emit('exit');
        cur_page = args[0];
        pages[cur_page].events.emit('enter');
    });
    //#endregion
    //#region init renderer
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.setAttribute('id','canvas');
    document.body.appendChild(renderer.domElement);
    const Update = ()=>{
        if(!pages[cur_page]) return;
        pages[cur_page].events.emit('update', clock.getDelta());
        renderer.render(pages[cur_page].scene, pages[cur_page].camera);
    }
    renderer.setAnimationLoop(Update);
    //#endregion
    //#region init default pages
    
    let client_data = { uid : undefined };
    pages.push(MakePage.StartPage(Page(), socket, events, client_data));
    pages.push(MakePage.MainPage(Page(), socket, events, client_data));
    pages.push(MakePage.TestPage(Page(), socket, events, client_data));
    cur_page = 0;
    pages[cur_page].events.emit('enter');
    //#endregion

    return {}
}

export default App;
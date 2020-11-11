import EventLink from './EventLink.js'
import { WebGLRenderer, Clock } from 'three'
import StartPage from './Pages/StartPage.js'
import WorldPage from './Pages/WorldPage.js'

const App = ()=>{
    const socket = io();
    const client_data = { uid: undefined };
    const pages = [ ];
    let cur_page_ind = undefined;
    const renderer = new WebGLRenderer({ antialias: true });
    const clock = new Clock();
    const Update = ()=>{
        renderer.clear(0x000000, 0);
        const cur_page = pages[cur_page_ind];
        cur_page.event_link.Invoke('update', clock.getDelta());
        
        renderer.getContext().enable(renderer.getContext().DEPTH_TEST);
        renderer.render(cur_page.scene, cur_page.camera);
        renderer.getContext().disable(renderer.getContext().DEPTH_TEST);
        renderer.render(cur_page.ui_manager.scene, cur_page.ui_manager.camera);
    }
    //#region event link event handlers
    const OnChangePage = (to)=>{
        //console.log('App: change_page');
        pages[cur_page_ind].event_link.Invoke('exit');
        pages[to].event_link.Invoke('enter');
        cur_page_ind = to;
    }
    const OnCreateWorld = (path)=>{
        //console.log('App: create_world');
        pages.push(WorldPage(socket, client_data, event_link, path));
    }
    //#endregion
    const event_link = EventLink([
        { name:'change_page', handler:OnChangePage },
        { name:'create_world', handler:OnCreateWorld }
    ]);
    const Init = ()=>{
        renderer.autoClear = false;
        renderer.localClippingEnabled = true;
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.domElement.setAttribute('id', 'three_canvas');
        renderer.setAnimationLoop(Update);
        document.body.appendChild(renderer.domElement);
        
        pages.push(StartPage(socket, client_data, event_link));
        cur_page_ind = 0;
        pages[cur_page_ind].event_link.Invoke('enter');
    }
    return {
        Init: ()=>Init()
    }
}

export default App
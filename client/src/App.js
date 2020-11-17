import { Clock, WebGLRenderer } from 'three'
//#region import pages
import StartPage from './Pages/StartPage.js'
import WorldPage from './Pages/WorldPage.js'
//#endregion

const App = ()=>{
    const socket = io();
    const client_data = { uid:undefined };
    const pages = [ ];
    let cur_page_ind = undefined;
    const clock = new Clock();
    const renderer = new WebGLRenderer({ antialias: true });
    const sigs = {
        change_page: new signals.Signal()
    }
    //#region signal event handlers
    const OnChangePage = (to)=>{
        //console.log('App: change_page');
        pages[cur_page_ind].sigs.exit.dispatch();
        pages[to].sigs.enter.dispatch();
        cur_page_ind = to;
    }
    sigs.change_page.add(OnChangePage);
    //#endregion
    //#region init pages
    pages.push(StartPage(socket, client_data, sigs));
    pages.push(WorldPage(socket, client_data, sigs));
    cur_page_ind = 0;
    pages[cur_page_ind].sigs.enter.dispatch();
    //#endregion
    //#region init renderer
    renderer.autoClear = false;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.domElement.setAttribute('id', 'three_canvas');
    renderer.setAnimationLoop(()=>{
        renderer.clear();
        pages[cur_page_ind].sigs.update.dispatch(clock.getDelta());
        renderer.render(pages[cur_page_ind].scene, pages[cur_page_ind].camera);
        if(pages[cur_page_ind].canvas){
            renderer.getContext().disable(renderer.getContext().DEPTH_TEST);
            renderer.render(pages[cur_page_ind].canvas.scene, pages[cur_page_ind].canvas.camera);
            renderer.getContext().enable(renderer.getContext().DEPTH_TEST);
        }
    });
    //#endregion
    document.body.appendChild(renderer.domElement);
}

export default App
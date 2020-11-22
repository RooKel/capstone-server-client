import { Clock, WebGLRenderer } from 'three'
import { FileTransferManager } from './FileTransferManager.js'

import { StartPage } from './Pages/StartPage.js'
import { WorldPage } from './Pages/WorldPage.js'

const App = ()=>{
    const ftm = new FileTransferManager(null, 'ws://localhost:3000');
    ftm.listenFileDownload();
    const socket = io();
    const client_data = {
        uid: undefined,
        player_obj: undefined
    }
    const sigs = {
        create_inst: new signals.Signal(),
        change_page: new signals.Signal()
    }
    //#region signal event handlers
    const OnCreateInst = (wModel_id)=>{
        pages.push(WorldPage(socket, client_data, sigs, ftm));
    }
    const OnChangePage = (to)=>{
        pages[cur_page_ind].sigs.exit.dispatch();
        pages[to].sigs.enter.dispatch();
        cur_page_ind = to;
    }
    //#endregion
    sigs.create_inst.add(OnCreateInst);
    sigs.change_page.add(OnChangePage);
    //#region input event handlers
    const OnWindowResize = ()=>{
        renderer.setSize( window.innerWidth, window.innerHeight );
        pages[cur_page_ind].sigs.resize.dispatch();
    }
    window.addEventListener('resize', OnWindowResize);
    //#endregion
    //#region init pages
    const pages = [ StartPage(socket, client_data, sigs, ftm) ];
    let cur_page_ind = 0;
    pages[cur_page_ind].sigs.enter.dispatch();
    //#endregion
    const clock = new Clock();
    //#region init renderer
    const renderer = new WebGLRenderer();
    renderer.autoClear = false;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.domElement.setAttribute('id', 'three_canvas');
    renderer.setAnimationLoop(()=>{
        renderer.clear();
        const cur_page = pages[cur_page_ind];
        cur_page.sigs.update.dispatch(clock.getDelta());
        renderer.render(cur_page.scene, cur_page.camera);
        if(cur_page.canvas){
            renderer.getContext().disable(renderer.getContext().DEPTH_TEST);
            renderer.render(cur_page.canvas.scene, cur_page.canvas.camera);
            renderer.getContext().enable(renderer.getContext().DEPTH_TEST);
        }
    });
    //#endregion
    document.body.appendChild(renderer.domElement);
}

export { App }
import {WebGLRenderer, Clock} from 'three'
import {FileTransferManager} from './FileTransferManager.js'
import MyPeer from './MyPeer.js'
import {StartPage} from './Pages/StartPage.js'
import {WorldPage} from './Pages/WorldPage.js'

const App = ()=>{
    const renderer = new WebGLRenderer({antialias:true});
    const clock = new Clock();
    const client_data = {uid:undefined, user_name:undefined, avatar_id:undefined};
    const socket = io();
    const ftm = new FileTransferManager(null, 'ws://localhost:3000');
    const sigs = {
        change_page: new signals.Signal()
    };
    const pages = [StartPage(socket, ftm, client_data, sigs)];
    let cur_page_ind = 0;
    const myPeer = MyPeer(socket, null, null);

    socket.on('connect', ()=>{
        client_data.uid = socket.id;
        Start();
    });
    const Start = ()=>{
        ftm.listenFileDownload();
        pages[cur_page_ind].sigs.enter.dispatch();
        sigs.change_page.add((to, world_id)=>{
            pages[cur_page_ind].sigs.exit.dispatch();
            switch(to){
                case 'start':
                    pages[0].sigs.enter.dispatch();
                    cur_page_ind = 0;
                    break;
                case 'world':
                    if(pages[1]) pages.splice(1, 1);
                    pages.push(WorldPage(socket, ftm, client_data, sigs, world_id));
                    pages[1].sigs.enter.dispatch();
                    cur_page_ind = 1;
                    break;
            }
        });
        window.addEventListener('resize', ()=>{
            renderer.setSize( window.innerWidth, window.innerHeight );
            pages[cur_page_ind].sigs.resize.dispatch();
        });
        renderer.autoClear = false;
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.domElement.setAttribute('id', 'three-canvas');
        renderer.setAnimationLoop(()=>{
            renderer.clear();
            pages[cur_page_ind].sigs.update.dispatch(clock.getDelta());
            pages[cur_page_ind].sigs.render.dispatch(renderer);
        });
        document.body.appendChild(renderer.domElement);
    }
}

export {App}
//#region imports
import * as THREE from 'three'
import Page from './src/Page.js'
import * as TestPages from './src/PageInit/TestPages.js'
import EventChain from './src/Events/EventChain.js'
//#endregion

const App = ()=>{
    const clock = new THREE.Clock();
    const socket = io();
    const client_data = { uid:undefined };
    //#region init event chain
    const OnChangePage = (to)=>{
        console.log('App: change_page: ' + to);
        if(isNaN(to))
            return;
        if(to % 1 !== 0)
            return;
        if(to < 0 || to >= pages.length)
            return;
        pages[cur_page].event_chain.Invoke('dispose');
        cur_page = to;
        pages[cur_page].event_chain.Invoke('start');
    }
    const event_chain = EventChain([
        { name:'change_page', handler:OnChangePage }
    ]);
    //#endregion
    //#region init pages
    const pages = [ ];
    let cur_page = undefined;
    //TEST
    let start_page = Page(event_chain);
    let main_page = Page(event_chain);
    start_page.event_chain.AddChildren(TestPages.TestStartPage(event_chain, start_page, socket, client_data));
    main_page.event_chain.AddChildren(TestPages.TestMainPage(event_chain, main_page, socket, client_data));
    pages.push(start_page);
    pages.push(main_page);
    cur_page = 0;
    pages[cur_page].event_chain.Invoke('start');
    //#endregion
    //#region handle window resize
    const onWindowResize = ()=>{
        pages[cur_page].camera.aspect = window.innerWidth / window.innerHeight;
        pages[cur_page].camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }
    window.addEventListener('resize', onWindowResize);
    //#endregion
    //#region init renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.domElement.setAttribute('id', 'three-canvas');
    const Update = ()=>{
        pages[cur_page].event_chain.Invoke('update', clock.getDelta());
        renderer.render(pages[cur_page].scene, pages[cur_page].camera);
    }
    renderer.setAnimationLoop(Update);
    document.body.appendChild(renderer.domElement);
    //#endregion
}

export default App;
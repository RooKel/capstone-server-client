//#region imports
import { Clock, WebGLRenderer, LineSegments, LineBasicMaterial } from 'three'
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js';

import { Page } from './Page.js'
import { SyncEntitiesConst } from './SyncEntities.js'
import { InputManagerConst } from './InputManager.js'
//#endregion

const AnotherApp = ()=>{
    const renderer = new WebGLRenderer({antialias:true});
    let pages = new Array();
    let curPageInd = null;
    const clock = new Clock();
    let socket, uid;

    //#region event handlers
    const onWindowResize = ()=>{
        pages[curPageInd].resetCam();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }
    window.addEventListener('resize', onWindowResize);
    //#endregion

    const update = ()=>{
        pages[curPageInd].events.emit('update', clock.getDelta());
        renderer.render(pages[curPageInd].scene(), pages[curPageInd].camera());
    }
    const init = ()=>{
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.domElement.setAttribute('id', 'canvas');
        renderer.setAnimationLoop(update);
        document.body.appendChild(renderer.domElement);

        socket = io();
        socket.emit('login', true);
        socket.on('login_accept', (_uid)=>{
            pages[curPageInd].events.emit('exit');

            uid = _uid;
            console.log(uid);
            pages.push(SyncEntitiesConst(InputManagerConst(Page(), socket, uid), socket, uid));
            curPageInd = 1;
            pages[curPageInd].addObj(
                new LineSegments(
                    new BoxLineGeometry( 10, 10, 10, 10, 10, 10 ).translate( 0, 5, 0 ),
                    new LineBasicMaterial( { color: 0xFFFFFF } )
                )
            );
            pages[curPageInd].events.emit('enter');
        });

        pages.push(Page());
        curPageInd = 0;
        pages[curPageInd].events.emit('enter');
    }
    return {
        init: ()=>init(),
    }
}

export { AnotherApp }
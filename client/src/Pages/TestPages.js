import Page from './Page.js'
import EventLink from '../EventLink.js'
import InputCollector from '../InputCollector.js'
import UserManager from '../UserManager.js'
import * as CTRL from '../Controllers/Import.js'
import * as THREE from 'three'
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js'

import ThreeMeshUI from 'three-mesh-ui'
import FontJSON from '../../assets/Roboto-msdf.json'
import FontImage from '../../assets/Roboto-msdf.png'

const TestStartPage = (socket, client_data, app_event_link)=>{
    const page = Page();
    page.scene.background = new THREE.Color(0x000000);
    page.scene.add(
        new THREE.LineSegments(
            new BoxLineGeometry( 10, 10, 10, 10, 10, 10 ).translate( 0, 5, 0 ),
            new THREE.LineBasicMaterial( { color: 0xFFFFFF } )
        )
    );
    //#region init UI
    const raycaster = new THREE.Raycaster();
    //#region init container 1
    const container = new ThreeMeshUI.Block({
        width: 0.6,
		height: 0.5,
		padding: 0.05,
		alignContent: 'center',
		fontFamily: FontJSON,
        fontTexture: FontImage,
        borderRadius: 0.075
    });
    const HelloWorld = new ThreeMeshUI.Text({content:'Hello World!'});
    const hoveredStateAttributes = {
		state: "hovered",
		attributes: {
			offset: 0.035,
			backgroundColor: new THREE.Color( 0x999999 ),
			backgroundOpacity: 1,
			fontColor: new THREE.Color( 0xffffff )
		},
	};
	const idleStateAttributes = {
		state: "idle",
		attributes: {
			offset: 0.035,
			backgroundColor: new THREE.Color( 0x666666 ),
			backgroundOpacity: 0.3,
			fontColor: new THREE.Color( 0xffffff )
		},
    };
    const selectedAttributes = {
		offset: 0.02,
		backgroundColor: new THREE.Color( 0x777777 ),
		fontColor: new THREE.Color( 0x222222 )
	};
    const StartBtn = new ThreeMeshUI.Block({
        width: 0.4,
		height: 0.15,
		justifyContent: 'center',
		alignContent: 'center',
		offset: 0.05,
		margin: 0.02,
		borderRadius: 0.075
    });
    StartBtn.add(new ThreeMeshUI.Text({content:'Start'}));
    StartBtn.setupState({
        state: "selected",
		attributes: selectedAttributes,
		onSet: ()=> {
            input_collector.AddMsg('login', true);
        }
    });
    StartBtn.setupState( hoveredStateAttributes );
	StartBtn.setupState( idleStateAttributes );
    container.add(HelloWorld);
    container.position.x = -0.305;
    container.position.y = 1;
    container.position.z = 4;
    container.add(StartBtn);
    page.scene.add(container);
    const objsToTest = [ ];
    objsToTest.push(StartBtn);
    //#endregion
    //#region init container 2
    const container2 = new ThreeMeshUI.Block({
        width: 0.6,
		height: 0.5,
		padding: 0.05,
		alignContent: 'left',
		fontFamily: FontJSON,
        fontTexture: FontImage,
        borderRadius: 0.075
    });
    container2.setupState({
		state: "hidden-on",
		attributes: { hiddenOverflow: true }
    });
    container2.setupState({
		state: "hidden-off",
		attributes: { hiddenOverflow: false }
    });
    container2.setState( "hidden-on" );
    const textContainer = new ThreeMeshUI.Block({
		width: 1,
		height: 1,
		padding: 0.09,
		backgroundColor: new THREE.Color( 'blue' ),
		backgroundOpacity: 0.2,
		alignContent: 'left'
	});
    container2.add( textContainer );
    const text = new ThreeMeshUI.Text({
		content: "hiddenOverflow ".repeat( 28 ),
		fontSize: 0.059,
		fontFamily: FontJSON,
		fontTexture: FontImage
	});
	textContainer.add( text );
    container2.position.x = 0.305;
    container2.position.y = 1;
    container2.position.z = 4;
    page.scene.add(container2);
    //#endregion
    //#endregion
    page.camera.position.set(0,1,5);
    const input_collector = InputCollector(socket, client_data);
    //#region input event handlers
    let selectState = false;
    const mouse = new THREE.Vector2();
    mouse.x = mouse.y = undefined;
    const OnMouseMove = (e)=>{
        mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
	    mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
    }
    //#endregion
    //#region socket event handlers
    const OnLoginAccept = (uid)=>{
        client_data.uid = uid;
        app_event_link.Invoke('change_page', 1);
    }
    //#endregion
    //#region event link event handlers
    const OnEnter = ()=>{
        console.log('TestStartPage: enter');

        socket.on('login_accept', OnLoginAccept);
        document.addEventListener('mousemove', OnMouseMove);
        window.addEventListener( 'mousedown', ()=> { selectState = true });
        window.addEventListener( 'mouseup', ()=> { selectState = false });
    }
    function raycast() {
        return objsToTest.reduce( (closestIntersection, obj)=> {
            const intersection = raycaster.intersectObject( obj, true );
            if ( !intersection[0] ) return closestIntersection
            if ( !closestIntersection || intersection[0].distance < closestIntersection.distance ) {
                intersection[0].object = obj;
                return intersection[0]
            } else {
                return closestIntersection
            };
        }, null );
    
    };
    const OnUpdate = (delta)=>{
        if(mouse.x && mouse.y){
            raycaster.setFromCamera(mouse, page.camera);
            let intersect = raycast();
            if ( intersect && intersect.object.isUI ) {
                if ( selectState ) {
                    // Component.setState internally call component.set with the options you defined in component.setupState
                    intersect.object.setState( 'selected' );
                } else {
                    // Component.setState internally call component.set with the options you defined in component.setupState
                    intersect.object.setState( 'hovered' );
                };
            };
            // Update non-targeted buttons state
            objsToTest.forEach( (obj)=> {
                if ( (!intersect || obj !== intersect.object) && obj.isUI ) {
                    // Component.setState internally call component.set with the options you defined in component.setupState
                    obj.setState( 'idle' );
                };
            });
        }
        const y = (Math.cos( Date.now() / 2000 ) * 0.25);
        textContainer.position.y = y * 0.6;
        ThreeMeshUI.update();
    }
    const OnExit = ()=>{
        console.log('TestStartPage: exit');

        socket.off('login_accept', OnLoginAccept);
        document.removeEventListener('mousemove', OnMouseMove);
        window.removeEventListener( 'mousedown', ()=> { selectState = true });
        window.removeEventListener( 'mouseup', ()=> { selectState = false });
    }
    //#endregion
    const event_link = EventLink([
        {name:'enter',handler:OnEnter},
        {name:'update',handler:OnUpdate},
        {name:'exit',handler:OnExit}
    ]);
    event_link.AddLink(page.scene.event_link);
    event_link.AddLink(page.camera.event_link);
    event_link.AddLink(input_collector.event_link);
    Object.assign(page, {event_link:event_link});
    return page;
}
const TestWorldPage = (socket, client_data, app_event_link)=>{
    const page = Page();
    page.scene.background = new THREE.Color(0xFFFFFF);
    page.scene.add(
        new THREE.LineSegments(
            new BoxLineGeometry( 10, 10, 10, 10, 10, 10 ).translate( 0, 5, 0 ),
            new THREE.LineBasicMaterial( { color: 0x000000 } )
        )
    );
    page.camera.position.set(0,1,5);
    const input_collector = InputCollector(socket, client_data);
    const camera_ctrl = CTRL.TestCameraCtrl(socket, client_data, page.camera, input_collector);
    page.camera.event_link.AddLink(camera_ctrl.event_link);
    const user_manager = UserManager(socket, client_data, page.scene, camera_ctrl, page.camera, input_collector);
    //#region event link event handlers
    const OnEnter = ()=>{
        console.log('TestWorldPage: enter');
    }
    const OnUpdate = (delta)=>{

    }
    const OnExit = ()=>{
        console.log('TestWorldPage: exit');
    }
    //#endregion
    const event_link = EventLink([
        {name:'enter',handler:OnEnter},
        {name:'update',handler:OnUpdate},
        {name:'exit',handler:OnExit},
    ]);
    event_link.AddLink(page.scene.event_link);
    event_link.AddLink(page.camera.event_link);
    event_link.AddLink(user_manager.event_link);
    event_link.AddLink(input_collector.event_link);
    Object.assign(page, {event_link:event_link});
    return page;
}

export {
    TestStartPage,
    TestWorldPage
}
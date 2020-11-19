import {UIPanel, UIRow, UIBreak, UISelect, UIButton, UIText, UIInput} from './libs/ui.js';
import {AddAnimationStateCommand} from "./commands/AddAnimationStateCommand.js";
import {SetAnimationStateValueCommand} from "./commands/SetAnimationStateValueCommand.js";
import {RemoveAnimationStateCommand} from "./commands/RemoveAnimationStateCommand.js";


function SidebarAnimationStates( editor ) {

	var strings = editor.strings;

	var signals = editor.signals;

	var container = new UIPanel();
	container.setDisplay('none');

	container.add(new UIText( "STATES" ).setTextTransform('uppercase'));
	container.add( new UIBreak() );
	container.add( new UIBreak() );

	//

	var statesContainer = new UIRow();
	container.add(statesContainer);

	var newState = new UIButton("NEW");
	newState.onClick(function(){
		var cachedAnimations = editor.animations.get(editor.selected.uuid);
		if(cachedAnimations === undefined)	return;
		if(cachedAnimations.length == 0) 	return;
		var stateData = {state:'none', animation: cachedAnimations[0] ? cachedAnimations[0].name : "" };
		editor.execute(new AddAnimationStateCommand(editor, editor.selected, stateData))
	});

	container.add(newState);

	function update() {

		statesContainer.clear();
		statesContainer.setDisplay('none');

		var object = editor.selected;

		if( object === null ) return;
		var userData = object.userData;
		if( userData === undefined ) return;
		var statesData = object.userData.animSet;

		if(statesData !== undefined && statesData.length > 0) {

			statesContainer.setDisplay('block');
			let animationSelectOptions = [];

			var animations = editor.animations.get(object.uuid);
			var firstAnimation;
			if( animations !== undefined )
			{
				for (var animation of animations) {

					if(firstAnimation === undefined) firstAnimation = animation.name;

					animationSelectOptions[animation.name] = animation.name;

				}
			}

			for (var i = 0; i < statesData.length; i++)
			{
				( function ( object, stateData ) {

					var stateInput = new UIInput( stateData.state ).setWidth( '80px' ).setFontSize( '12px' );
					stateInput.onChange( function () {

						editor.execute( new SetAnimationStateValueCommand( editor, editor.selected, stateData, 'state', this.getValue() ) );

					} );
					statesContainer.add( stateInput );

					var animationSelect = new UISelect().setFontSize('12px');
					animationSelect.setMarginLeft( '4px' );
					animationSelect.setOptions(animationSelectOptions);
					animationSelect.setValue(firstAnimation);
					animationSelect.onChange(function(){

						editor.execute( new SetAnimationStateValueCommand( editor, editor.selected, stateData, 'animation', this.getValue() ) );

					})

					statesContainer.add(animationSelect);

					var removeButton = new UIButton( strings.getKey( 'sidebar/script/remove' ) );
					removeButton.setMarginLeft( '4px' );
					removeButton.onClick( function () {

						if ( confirm( 'Are you sure?' ) ) {

							editor.execute( new RemoveAnimationStateCommand( editor, editor.selected, stateData ) );

						}

					} );
					statesContainer.add( removeButton );

					statesContainer.add( new UIBreak() );

				} )( object, statesData[ i ] );
			}

		}

	}

	//	signals

	signals.objectSelected.add(function(object){
		if(null !== object && editor.camera !== object){
			container.setDisplay('block');

			update();
		}else{
			container.setDisplay('none');
		}
	})

	signals.animStateAdded.add(update);
	signals.animStateChanged.add(update);
	signals.animStateRemoved.add(update);

	return container;

}

export { SidebarAnimationStates };

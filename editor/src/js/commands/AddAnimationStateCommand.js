import { Command } from '../Command.js';

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @param state {state:'state name', animation: AnimationClip} object
 * @constructor
 */
function AddAnimationStateCommand( editor, object, state ) {

	Command.call( this, editor );

	this.type = 'AddAnimationStateCommand';
	this.name = 'Add AnimationState';

	this.object = object;
	this.state = state;

}

AddAnimationStateCommand.prototype = {

	execute: function () {
		let userData = this.editor.getUserData(this.object.uuid);
		if(userData.animSet === undefined){
			userData.animSet = [];
		}

		userData.animSet.push(this.state);

		this.editor.signals.animStateAdded.dispatch( this.state );

	},

	undo: function () {
		let userData = this.editor.getUserData(this.object.uuid);

		if(userData.animSet === undefined) return;

		var index = userData.animSet.indexOf( this.state );

		if ( index !== - 1 ) {

			userData.animSet.splice(index, 1);

		}

		this.editor.signals.animStateRemoved.dispatch( this.state );

	},

	toJSON: function () {

		var output = Command.prototype.toJSON.call( this );

		output.objectUuid = this.object.uuid;
		output.state = this.state;

		return output;

	},

	fromJSON: function ( json ) {

		Command.prototype.fromJSON.call( this, json );

		this.state = json.state;
		this.object = this.editor.objectByUuid( json.objectUuid );

	}

};

export { AddAnimationStateCommand };

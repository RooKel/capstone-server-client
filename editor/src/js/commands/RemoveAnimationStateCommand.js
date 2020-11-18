import { Command } from '../Command.js';

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @param state javascript object
 * @constructor
 */
function RemoveAnimationStateCommand(editor, object, state ) {

	Command.call( this, editor );

	this.type = 'RemoveAnimationStateCommand';
	this.name = 'Remove AnimationState';

	this.object = object;
	this.state = state;
	if ( this.object && this.state ) {

		this.index = this.editor.getUserData(this.object.uuid).animSet.indexOf(this.state);

	}

}

RemoveAnimationStateCommand.prototype = {

	execute: function () {

		if ( this.editor.getUserData( this.object.uuid ) === undefined ) return;

		if ( this.index !== - 1 ) {

			this.editor.getUserData( this.object.uuid ).animSet.splice( this.index, 1 );

		}

		this.editor.signals.animStateRemoved.dispatch( this.state );

	},

	undo: function () {

		if ( this.editor.getUserData( this.object.uuid ) === undefined ) {

			this.editor.getUserData( this.object.uuid ).animSet = [];

		}

		this.editor.getUserData( this.object.uuid ).animSet.splice( this.index, 0, this.state );

		this.editor.signals.animStateRemoved.dispatch( this.state );

	},

	toJSON: function () {

		var output = Command.prototype.toJSON.call( this );

		output.objectUuid = this.object.uuid;
		output.state = this.state;
		output.index = this.index;

		return output;

	},

	fromJSON: function ( json ) {

		Command.prototype.fromJSON.call( this, json );

		this.state = json.state;
		this.index = json.index;
		this.object = this.editor.objectByUuid( json.objectUuid );

	}

};

export { RemoveAnimationStateCommand };

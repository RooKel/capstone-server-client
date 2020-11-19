import { Command } from '../Command.js';

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @param state {state:'state name', animation: AnimationClip} object
 * @param attributeName string
 * @param newValue string, object
 * @constructor
 */
function SetAnimationStateValueCommand(editor, object, state, attributeName, newValue ) {

	Command.call( this, editor );

	this.type = 'SetAnimationStateValueCommand';
	this.name = 'Set AnimationState.' + attributeName;
	this.updatable = true;

	this.object = object;
	this.state = state;

	this.attributeName = attributeName;
	this.oldValue = ( state !== undefined ) ? state[ this.attributeName ] : undefined;
	this.newValue = newValue;

}

SetAnimationStateValueCommand.prototype = {

	execute: function () {

		this.state[ this.attributeName ] = this.newValue;

		this.editor.signals.animStateChanged.dispatch();

	},

	undo: function () {

		this.state[ this.attributeName ] = this.oldValue;

		this.editor.signals.animStateChanged.dispatch();

	},

	update: function ( cmd ) {

		this.newValue = cmd.newValue;

	},

	toJSON: function () {

		var output = Command.prototype.toJSON.call( this );

		output.objectUuid = this.object.uuid;
		output.index = this.object.userData.animSet.indexOf( this.state );
		output.attributeName = this.attributeName;
		output.oldValue = this.oldValue;
		output.newValue = this.newValue;

		return output;

	},

	fromJSON: function ( json ) {

		Command.prototype.fromJSON.call( this, json );

		this.oldValue = json.oldValue;
		this.newValue = json.newValue;
		this.attributeName = json.attributeName;
		this.object = this.editor.objectByUuid( json.objectUuid );
		this.script = this.editor.scripts[ json.objectUuid ][ json.index ];

	}

};

export { SetAnimationStateValueCommand };

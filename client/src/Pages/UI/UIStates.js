import { Color } from 'three'

const hoveredStateAttributes = {
    state: "hovered",
    attributes: {
        offset: 0.035,
        backgroundColor: new Color( 0x999999 ),
        backgroundOpacity: 1,
        fontColor: new Color( 0xffffff )
    }
};
const idleStateAttributes = {
    state: "idle",
    attributes: {
        offset: 0.035,
        backgroundColor: new Color( 0x666666 ),
        backgroundOpacity: 0.3,
        fontColor: new Color( 0xffffff )
    }
};
const selectedAttributes = {
    state: 'selected',
    attributes: {
        offset: 0.02,
        backgroundColor: new Color( 0x777777 ),
        fontColor: new Color( 0x222222 )
    }
};

export {
    hoveredStateAttributes,
    idleStateAttributes,
    selectedAttributes,
}
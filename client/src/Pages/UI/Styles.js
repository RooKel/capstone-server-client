import RobotoJSON from '../../../assets/Fonts/Roboto/Roboto-msdf.json'
import RobotoPNG from '../../../assets/Fonts/Roboto/Roboto-msdf.png'
const fontRoboto = {
    fontFamily: RobotoJSON,
    fontTexture:RobotoPNG 
}

const panelType1 = {
    width: 1.3, height: 1.05,
    padding: 0.03, margin: 0.01,
    backgroundOpacity: 0,
    contentDirection: 'column',
    alignContent: 'center',
    justifyContent: 'center'
}
const panelType1Header = {
    width: 1.3, height: 0.1,
    padding: 0.03, margin: 0.01,
}
const panelType1Body = {
    width: 1.3, height: 0.75,
    padding: 0.03, margin: 0.01,
}
const panelType1Footer = {
    width: 1.3, height: 0.125,
    margin: 0.01,
}

const display_block = {
    width: 1.0, height: 0.25,
    padding: 0.03, margin: 0.01,
    contentDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center'
}
const display_block_img = {
    width: 0.24, height: 0.24,
}
const display_block_text = {
    width: 0.72, height: 0.24,
    padding: 0.03, margin: 0.01,
    backgroundOpacity: 0,
    contentDirection: 'column',
    alignContent: 'left',
    justifyContent: 'center'
}

const buttonType1 = {
    width: 0.4, height: 0.1,
    padding: 0.03, margin: 0.01,
}

const loadingPanel = {
    width: 5, height: 5,
    backgroundOpacity: 1.0,
    alignContent: 'center',
    justifyContent: 'center'
}

export {
    fontRoboto,
    panelType1, panelType1Header, panelType1Body, panelType1Footer,
    buttonType1,
    display_block, display_block_img, display_block_text,
    loadingPanel,
}
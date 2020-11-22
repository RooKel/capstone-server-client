//#region import fonts
import RobotoJSON from './Fonts/Roboto/Roboto-msdf.json'
import RobotoPNG from './Fonts/Roboto/Roboto-msdf.png'
//#endregion
const font_roboto = {
    fontFamily: RobotoJSON,
    fontTexture: RobotoPNG
}

const panelType1 = {
    width: 1.2, height: 1,
    padding: 0.03, margin: 0.01
}
const panelType1_header = {
    width: 1.1, height: 0.1,
    padding: 0.03, margin: 0.01
}
const panelType1_content = {
    width: 1.1, height: 0.8,
    padding: 0.03, margin: 0.01
}

const panelType2 = {
    width: 1.2, height: 1,
    padding: 0.03, margin: 0.01
}
const panelType2_header = {
    width: 1.1, height: 0.1,
    padding: 0.03, margin: 0.01
}
const panelType2_content = {
    width: 1.1, height: 0.7,
    padding: 0.03, margin: 0.01
}
const panelType2_content_listElem = {
    width: 1.0, height: 0.2,
    padding: 0.03, margin: 0.01
}
const panelType2_content_listElem_img = {
    width: 0.2, height: 0.15,
    padding: 0.03, margin: 0.01
}
const panelType2_content_listElem_info = {
    width: 0.7, height: 0.15,
    padding: 0.03, margin: 0.01
}
const panelType2_footer = {
    width: 1.1, height: 0.1,
    padding: 0.03, margin: 0.01
}

const btnType1 = {
    width: 0.3, height: 0.075,
    padding: 0.03, margin: 0.01
}
const btnType2 = {
    width: 0.5, height: 0.1,
    padding: 0.03, margin: 0.01
}

const alignmentType1 = {
    contentDirection: 'column',
    alignContent: 'center',
    justifyContent: 'center'
}
const alignmentType2 = {
    contentDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center'
}
const alignmentType3 = {
    contentDirection: 'column',
    alignContent: 'center',
    justifyContent: 'start'
}
const alignmentType4 = {
    contentDirection: 'row',
    alignContent: 'center',
    justifyContent: 'start'
}

export {
    font_roboto,
    panelType1, panelType1_header, panelType1_content,
    panelType2, panelType2_header, panelType2_content, panelType2_footer,
    panelType2_content_listElem, panelType2_content_listElem_img, panelType2_content_listElem_info,
    btnType1, btnType2,
    alignmentType1, alignmentType2, alignmentType3, alignmentType4
}
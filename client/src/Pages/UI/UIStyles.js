import RobotoJSON from './Font/Roboto/Roboto-msdf.json'
import RobotoIMG from './Font/Roboto/Roboto-msdf.png'

const large_panel = {
    width: 1.0,
    height: 1.0,
    padding: 0.05,
    alignContent: 'center',
    borderRadius: 0.075
}
const small_panel = {
    width: 0.75,
    height: 0.75,
    padding: 0.05,
    alignContent: 'center',
    borderRadius: 0.075
}

const button_type1 = {
    width: 0.4,
    height: 0.15,
    justifyContent: 'center',
    alignContent: 'center',
    offset: 0.05,
    margin: 0.02,
    borderRadius: 0.075
}

const roboto_font = {
    fontFamily: RobotoJSON,
    fontTexture: RobotoIMG
}

export {
    large_panel, small_panel,
    button_type1,
    roboto_font
}
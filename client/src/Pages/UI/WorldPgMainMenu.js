import * as TMUI from 'three-mesh-ui'
import * as STY from './Styles.js'

const WorldPageMainMenu = (objs_to_test)=>{
    const panel = new TMUI.Block(Object.assign({}, STY.small_panel, STY.roboto_font));
    panel.add(new TMUI.Text({ content:'Hello World!' }));
    panel.position.set(0,0,-1);
    return panel;
}

export default WorldPageMainMenu
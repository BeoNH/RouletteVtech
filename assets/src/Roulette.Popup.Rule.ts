import Roulette from "./Roulette";
import Dialog from "./Roulette.Dialog";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupRule extends Dialog {

    public static show() {
        let node = cc.instantiate(Roulette.Ins.popupRule);
        node.parent = Roulette.Ins.popups;

        let comp = node.getComponent(PopupRule);
        comp.show();
    }
}

import Roulette from "./Roulette";
import Dialog from "./Roulette.Dialog";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupCoin extends Dialog {

    public static show() {
        let node = cc.instantiate(Roulette.Ins.popupCoin);
        node.parent = Roulette.Ins.popups;

        let comp = node.getComponent(PopupCoin);
        comp.show();
    }

    onClickPayment(){
        this.dismiss();
        Roulette.Ins.onClickPayment();
    }
}

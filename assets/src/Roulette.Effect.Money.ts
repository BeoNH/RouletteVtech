const { ccclass, property } = cc._decorator;

@ccclass
export default class EffectJackpot extends cc.Component {

    @property(cc.Node)
    bgCoin: cc.Node = null;
    @property(cc.Label)
    lblCoin: cc.Label = null;

    show(coin: number/*, onComplete: () => void*/) {
        this.node.active = true;
        // this.bgCoin.opacity = 0;
        // this.bgCoin.scale = 3;
        // this.lblCoin.node.active = false;
        // cc.Tween.stopAllByTarget(this.bgCoin);
        cc.tween(this.bgCoin)
        // .delay(0.3).to(0.3, { scale: 1, opacity: 255 }).call(() => {
        //     this.lblCoin.node.active = true;
        //     this.lblCoin.string = `${coin}`;
        // })
        .delay(4).call(() => {
            this.hide();
            // if (typeof onComplete == "function") onComplete();
        }).start();
    }

    hide() {
        cc.Tween.stopAllByTarget(this.bgCoin);
        cc.Tween.stopAllByTarget(this.lblCoin);
        this.node.active = false;
    }
}

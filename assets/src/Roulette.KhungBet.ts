const {ccclass, property} = cc._decorator;

@ccclass
export default class KhungBet extends cc.Component {
    
    @property(cc.Node)
    panel: cc.Node = null;
    @property(cc.Node)
    Layout: cc.Node = null;
    @property(cc.Label)
    LabelBet: cc.Label = null;
    @property(cc.Label)
    LabelCoin: cc.Label = null;

    start () {
        this.panel.active = true;
        this.panel.height = 310;
    }
    protected update(dt: number): void {
        this.checkTotalBet();
    }

    showMenu() {
        let isShow = !this.panel.active;
        cc.Tween.stopAllByTarget(this.panel);
        if (isShow) {
            this.panel.active = true;
            cc.tween(this.panel).to(0.3, { height: 310 }).start();
        } else {
            cc.tween(this.panel).to(0.3, { height: 0 }).call(() => {
                this.panel.active = false;
            }).start();
        }
    }

    checkTotalBet(): void{
        if(this.Layout.childrenCount == 0){
            this.LabelBet.string = `0 bet`;
            this.LabelCoin.string = `0`;
        }else{
            this.LabelBet.string = `${this.Layout.childrenCount} bet`;
            let a = 0
            for (let i = 0; i < this.Layout.childrenCount; i++) {
                a += parseInt(this.Layout.children[i].getChildByName("lbCoin").getComponent(cc.Label).string);
            }
            this.LabelCoin.string = `${a}`;
        }
    }
}

const { ccclass, property } = cc._decorator;

@ccclass
export default class Loading extends cc.Component {

    @property(cc.ProgressBar)
    progress: cc.ProgressBar = null;

    start() {
        this.progress.progress = 0;
        cc.director.preloadScene("Roulette", (c, t, i) => {
            cc.tween(this.progress).to(0.3, { progress: c / t }).start();
        }, () => {
            cc.tween(this.progress).to(0.3, { progress: 1 }).call(() => {
                cc.director.loadScene("Roulette");
            }).start();
        });
    }
}

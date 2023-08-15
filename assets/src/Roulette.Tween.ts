const { ccclass, property } = cc._decorator;

export class TweenListener {
    target: cc.Component = null;
    duration: number = 0;
    curDuration: number = 0;
    callback: (p: number) => void = null;
}

@ccclass
export default class Tween extends cc.Component {

    private static instance: Tween = null;
    private static getInstance(): Tween {
        if (this.instance == null) {
            let node = new cc.Node();
            node.name = "Tween";
            cc.game.addPersistRootNode(node);
            this.instance = node.addComponent(Tween);
        }
        return this.instance;
    }

    private static listeners = new Array<TweenListener>();

    private skeepFrame = false;
    private readonly countSkeep = 1;
    private curCountSkeep = 0;
    private delta = 0;

    update(dt: number) {
        if (this.skeepFrame) {
            this.curCountSkeep++;
            this.delta += dt;
            if (this.curCountSkeep >= this.countSkeep) {
                this.curCountSkeep = 0;
                this.skeepFrame = false;
            }
            return; //làm gián đoạn hàm update();
        }
        for (var i = 0; i < Tween.listeners.length; i++) {
            let listener = Tween.listeners[i];
            if (listener.target && listener.target instanceof cc.Component && listener.target.node) {
                listener.curDuration = Math.min(listener.duration, listener.curDuration + dt + this.delta);
                listener.callback(listener.curDuration / listener.duration);
                if (listener.curDuration >= listener.duration) {
                    Tween.listeners.splice(i--, 1);
                }
            } else {
                Tween.listeners.splice(i--, 1);
            }
        }

        this.skeepFrame = true;
        this.delta = 0;
    }

    static formatNumber(n: number, check: boolean): string {
        if(check){
            return n.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
        }
        else{
            return n.toString();
        }
    }

    static stringToInt(s: string): number {
        var n = parseInt(s.replace(/\./g, '').replace(/,/g, ''));
        if (isNaN(n)) n = 0;
        return n;
    }

    static numberTo(label: cc.Label, toNumber: number, check: boolean = false) {
        this.getInstance();
        let listener = null;
        for (var i = 0; i < Tween.listeners.length; i++) {
            let _listener = Tween.listeners[i];
            if (_listener.target == label) {
                listener = _listener;
                break;
            }
        }
        if (listener == null) {
            listener = new TweenListener();
            this.listeners.push(listener);
        }
        let startNumber = this.stringToInt(label.string);
        let distance = toNumber - startNumber;
        listener.curDuration = 0;
        if (distance !== 0 && Math.abs(distance) > 1) {
            listener.duration = 1 % Math.abs(distance);
        } else {
            listener.duration = 1;
        }
        listener.target = label;
        listener.callback = (p: number) => {
            label.string = this.formatNumber(parseInt("" + (startNumber + distance * p)), check);
        }
    }
}
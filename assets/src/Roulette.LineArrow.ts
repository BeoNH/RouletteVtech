import Roulette from "./Roulette";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    private collisionManager: cc.CollisionManager;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.collisionManager = cc.director.getCollisionManager();
        this.collisionManager.enabled = true;
    }

    start () {

    }

    onCollisionEnter(other: cc.BoxCollider, self: cc.Collider) {
        let numberCell = parseInt(other.node.getComponentInChildren(cc.Label).string);
        // let numberColor = other.node.getComponent(cc.BoxCollider).tag;
        Roulette.Ins.numberWin = numberCell;
    }
    onCollisionExit(){
        Roulette.Ins.numberWin = null;
    }
}

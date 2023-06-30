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

    onCollisionEnter(other: cc.Collider, self: cc.Collider) {
        let numberCell = parseInt(other.node.getComponentInChildren(cc.Label).string);
        Roulette.Ins.numberWin = numberCell;
        
        for (let i = 0; i < self.node.childrenCount; i++) {
            self.node.children[i].color = other.node.color;
        }
        Roulette.Ins.Line.children[0].color = other.node.color;
        Roulette.Ins.Line.children[1].color = other.node.color;
    }
}

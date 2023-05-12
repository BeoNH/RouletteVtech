const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("CustomUI/CascadeColor")
export default class CascadeColor extends cc.Component {

    onLoad() {
        for (let k in this.node.children) {
            this.setColor(this.node.children[k], this.node.color);
        }

        this.node.on(cc.Node.EventType.COLOR_CHANGED, () => {
            for (let k in this.node.children) {
                this.setColor(this.node.children[k], this.node.color);
            }
        });
    }

    private setColor(node: cc.Node, color: cc.Color) {
        node.color = color;
        if (node.childrenCount > 0) {
            for (let k in node.children) {
                this.setColor(node.children[k], color);
            }
        }
    }
}

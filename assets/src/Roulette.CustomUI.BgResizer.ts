const { ccclass, property } = cc._decorator;

@ccclass
export default class BgResizer extends cc.Component {
    @property
    designResolution: cc.Size = new cc.Size(1920, 1080);

    lastWitdh: number = 0;

    start() {
        this.updateSize();
    }

    update(dt: number) {
        this.updateSize();
    }

    updateSize() {
        var frameSize = cc.view.getFrameSize();
        if (this.lastWitdh !== frameSize.width) {

            this.lastWitdh = frameSize.width;

            if (this.designResolution.width / this.designResolution.height > frameSize.width / frameSize.height) {
                var height = this.designResolution.width * frameSize.height / frameSize.width;
                var width = height * this.designResolution.width / this.designResolution.height;
                
                var newDesignSize = cc.size(width,1080);
                this.node.setContentSize(newDesignSize);
                // cc.log("update node size: " + newDesignSize);
            } else {
                var width = this.designResolution.height * frameSize.width / frameSize.height;
                var height = width * this.designResolution.height / this.designResolution.width;
                var newDesignSize = cc.size(width,1080);

                this.node.setContentSize(newDesignSize);
                // cc.log("update node size: " + newDesignSize);
            }
        }
    }
}

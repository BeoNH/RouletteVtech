import NetworkClient from "./Roulette.NetworkClient";
import Configs from "./Roulette.Configs";
import { Utils } from "./Roulette.Configs";


const {ccclass, property} = cc._decorator;

declare class requestHeaders { }

enum GameState {
    Waiting = 0,
    Betting = 1,
    ShowingResult = 2,
    CalculatingResult = 3,
    Ending = 4
}

@ccclass
export default class Roulette extends cc.Component {
    public static Ins: Roulette;

    @property(cc.Node)
    Rolls: cc.Node = null;
    @property(cc.Node)
    CountDown: cc.Node = null;
    @property(cc.Node)
    Line: cc.Node = null;
    @property(cc.Node)
    Arrow: cc.Node = null;

    @property({ readonly: true, editorOnly: true, serializable: false })
    private HEADER: string = "HEADER"
    @property(cc.Label)
    NickName: cc.Label = null;
    @property(cc.Label)
    LabelJackpot: cc.Label = null;
    @property(cc.Prefab)
    LineView: cc.Prefab[] = [];
    @property(cc.Node)
    LayoutView: cc.Node = null;
    @property(cc.Label)
    LabelPutCoin: cc.Label = null;
    @property(cc.Button)
    BtnPutC: cc.Button = null;
    @property(cc.Button)
    BtnPut1: cc.Button = null;
    @property(cc.Button)
    BtnPut10: cc.Button = null;
    @property(cc.Button)
    BtnPut100: cc.Button = null;
    @property(cc.Button)
    BtnPut1k: cc.Button = null;

    @property({ readonly: true, editorOnly: true, serializable: false })
    private FOOTER: string = "FOOTER"
    @property(cc.Button)
    BtnBet: cc.Button[] = [];
    @property(cc.Node)
    LayoutBet: cc.Node[] = [];
    @property(cc.Prefab)
    ItemKhungBet: cc.Prefab = null;
    @property(cc.Label)
    LabelInGameCoin: cc.Label = null;
    @property(cc.Node)
    BgBet: cc.Node = null;


    private readonly dataBet = [0,1,10,100,1000];

    private rollTime: number = 7;
    private countTime: number = 20;
    private speed: number = 1;
    private cashWin: number[] = [0,0,0];
    private ACCESS_TOKEN: string = "";
    private data = {};

    public numberWin: number = null;


    onLoad() {
        Roulette.Ins =this;


        NetworkClient.getInstance().addOnClose(() => {
            console.log("Kết nối thất bại, thử lại . . .");
        }, this);

        NetworkClient.getInstance().addOnOpen(() => {
            if (Configs.Login.IsLogin) {
                console.log("Loging in...");
                switch (Configs.Login.LoginType) {
                    case Configs.LoginType.Gowin:
                        this.sendLoginGowin(true);
                        break;
                    case Configs.LoginType.Quick:
                        break;
                    default:
                        break;
                }
            } else {
                this.sendLoginGowin(false);
            }
        }, this);

        if (!NetworkClient.getInstance().isConnected()) {
            console.log("Connecting to server...");
            NetworkClient.getInstance().connect();
        }

        this.LabelInGameCoin.string = `${Configs.Login.CoinRoulette}`;
        this.NickName.string = Configs.Login.Nickname;

        NetworkClient.getInstance().request("rouletteJoin", {}, res => {
            NetworkClient.getInstance().request("rouletteGetState", {}, res => {
                console.log(res,"//////////////");
            },this);
        },this);
        
    }

    start () {
        this.loop();
        

    }

    protected update(dt: number): void {
        this.checkLineView();
    }

    public sendLoginGowin(isReconnect: boolean = false, cb: () => void = null) {
        if (typeof (requestHeaders) == "object" && requestHeaders["access-token"])
            this.ACCESS_TOKEN = requestHeaders["access-token"];

        if (!this.ACCESS_TOKEN) {
            this.ACCESS_TOKEN = Utils.urlParam("token");
        }

        if (!this.ACCESS_TOKEN) {
            console.log("Login failure, invalid token!, please try again later.");
            return;
        } 

        NetworkClient.getInstance().request("gowinLogin", {
            "accessToken": this.ACCESS_TOKEN,
            "language": "my"
        }, (res) => {
            console.log(res);
            if (!res["ok"]) {
                let msg = "";
                if (typeof res["msg"] == "string") {
                    msg = res["msg"];
                } else {
                    msg = `Error ${res["err"]}, please try again later.`;
                }

                if (isReconnect) {
                    Configs.Login.clear();
                    cc.director.loadScene("Roulette");
                }

                return;
            }
            this.callbackLogined(res, Configs.LoginType.Gowin, isReconnect);
            if (cb != null) cb();
        }, this);
    }

    public callbackLogined(res: any, loginType: Configs.LoginType, isReconnect: boolean) {
        Configs.Login.LoginType = loginType;
        Configs.Login.IsLogin = true;
        Configs.Login.CoinRoulette= res["cash"];
        Configs.Login.UserId = res["userId"];
        Configs.Login.Nickname = res["nickname"];

        if (!isReconnect) {
            if (Configs.Login.Nickname == "") {
                Configs.Login.Nickname = `test_${res["userId"]}`
            } else {
                cc.director.loadScene("Roulette");
            }
        }
    }



    onSpin(): void{
        let start = this.Rolls.position.x;
        let end = start + 567;
        this.speed = end / 1134;

        this.interactableButtons(false);

        cc.tween(this.Rolls)
        .to(this.speed, {position: cc.v3(-567)})
        .call(()=> {
            this.Rolls.position = cc.v3(567);
            this.onSpin();
        })
        .start();
    }

    countDown(): void{
        this.Rolls.stopAllActions();
        this.interactableButtons(true);
        this.CountDown.active = true;
        this.BgBet.active = false;

        this.updateLineView();

        let a = this.CountDown.children[1].getComponent(cc.Label);
        this.countTime = 20;
        this.lineTime();
        this.Arrow.opacity = 100;
        this.schedule(()=>{
            this.countTime -= 0.016667;
            a.string = `${this.countTime.toFixed(2)}`;
            if(this.countTime <= 0){
                this.Arrow.opacity = 255;
                this.CountDown.active = false;
                this.BgBet.active = true;
                this.BgBet.position.x = 700;
                this.Line.width = 1178;
                this.unscheduleAllCallbacks();
                this.loop();
            }
        },0.01)
        
    }

    loop(): void{
        this.scheduleOnce(()=>{
            this.speed = 1;
            this.onSpin();
            this.scheduleOnce(()=>{
                this.clearData();
                this.countDown();
            },this.rollTime)
        },1)
    }

    lineTime(): void{
        cc.tween(this.Line)
        .to(this.countTime, {width: 0})
        .start();
    }

    private interactableButtons(interactable: boolean) {
        for (let i = 0; i < this.BtnBet.length; i++) {
            this.BtnBet[i].interactable = interactable;
        }
        this.BtnPutC.interactable = interactable;
        this.BtnPut1.interactable = interactable;
        this.BtnPut10.interactable = interactable;
        this.BtnPut100.interactable = interactable;
        this.BtnPut1k.interactable = interactable;

    }

    onClickBet(event: cc.Event.EventTouch, customEventData: string): void{
        let a = parseInt(this.LabelInGameCoin.string) - parseInt(this.LabelPutCoin.string);
        if(a<0){
            console.log("NAP THEM TIEN DI !!!!!");
        }else{
            let item = cc.instantiate(this.ItemKhungBet);
            item.getChildByName(`lbName`).getComponent(cc.Label).string = `${this.NickName.string}`;
            item.getChildByName(`lbCoin`).getComponent(cc.Label).string = `${this.LabelPutCoin.string}`;
            switch (customEventData) {
                case "x2":
                    this.checkLayoutBet(item, 2);
                    break;
                case "x14":
                    this.checkLayoutBet(item, 1);
                    break;
                default:
                    this.checkLayoutBet(item, 0);
                    break;
            }
            this.LabelInGameCoin.string = `${a}`;
        }

    }

    checkLayoutBet(data: cc.Node, idx: number): void{
        if(this.LayoutBet[idx].childrenCount == 0){
            data.parent = this.LayoutBet[idx];
            this.cashWin[idx]= parseInt(data.getChildByName(`lbCoin`).getComponent(cc.Label).string);
        }else{
            for (let i = 0; i < this.LayoutBet[idx].childrenCount; i++) {
                let a = this.LayoutBet[idx].children[i];
                let b = data.getChildByName(`lbName`).getComponent(cc.Label).string;
                let c = a.getChildByName(`lbName`).getComponent(cc.Label).string
                if(b == c){
                    let d = parseInt(a.getChildByName(`lbCoin`).getComponent(cc.Label).string);
                    d += parseInt(data.getChildByName(`lbCoin`).getComponent(cc.Label).string);
                    a.getChildByName(`lbCoin`).getComponent(cc.Label).string = `${d}`;
                }
                else{
                    data.parent = this.LayoutBet[idx];
                }      
                this.cashWin[idx]= parseInt(a.getChildByName(`lbCoin`).getComponent(cc.Label).string);
            }
        }
    }

    clearData(): void{
        for (let i = 0; i < this.LayoutBet.length; i++) {
            this.LayoutBet[i].removeAllChildren();
        }
    }

    updateLineView(): void{
        let a = 0;
        if ([1, 2, 3, 4, 5, 6, 7].includes(this.numberWin)) {
            a = 2;
        } else if ([8, 9, 10, 11, 12, 13, 14].includes(this.numberWin)) {
            a = 0;
        } else if ([0].includes(this.numberWin)) {
            a = 1;
        }
        this.CheckWin(a);
        let line = cc.instantiate(this.LineView[a]);
        line.parent = this.LayoutView;
    }

    checkLineView(): void{
        if(this.LayoutView.childrenCount > 100){
            let item = this.LayoutView.children[0];
            item.removeFromParent();
            item.destroy();
        }
    }

    onClickPut(event: cc.Event.EventTouch, customEventData: string) {
        switch (customEventData) {
            case "1":
                this.LabelPutCoin.string = `${this.dataBet[1]}`;
                break;
            case "10":
                this.LabelPutCoin.string = `${this.dataBet[2]}`;
                break;
            case "100":
                this.LabelPutCoin.string = `${this.dataBet[3]}`;
                break;
            case "1000":
                this.LabelPutCoin.string = `${this.dataBet[4]}`;
                break;
            default:
                this.LabelPutCoin.string = `${this.dataBet[0]}`;
                break;
        }
    }

    CheckWin(idx: number) {
        let a = parseInt(this.LabelInGameCoin.string);
        if(idx == 1){
            this.LabelInGameCoin.string = `${a+this.cashWin[idx]*14}`;
        }else{
            this.LabelInGameCoin.string = `${a+this.cashWin[idx]*2}`;
        }
        this.cashWin = [0,0,0];
    }
}

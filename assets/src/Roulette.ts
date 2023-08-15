import NetworkClient from "./Roulette.NetworkClient";
import Configs from "./Roulette.Configs";
import { Utils } from "./Roulette.Configs";
import PopupRule from "./Roulette.Popup.Rule";
import EffectJackpot from "./Roulette.Effect.Money";
import PopupCoin from "./Roulette.Popup.GetCoin";
import Tween from "./Roulette.Tween";


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
    loading: cc.Node = null;
    @property(cc.Node)
    loadingIcon: cc.Node = null;
    @property(cc.Label)
    loadingLabel: cc.Label = null;

    @property(cc.Node)
    Rolls: cc.Node = null;
    @property(cc.Node)
    CountDown: cc.Node = null;
    // @property(cc.Node)
    // Line: cc.Node = null;
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
    PreviousRollView: cc.Node = null;
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
    @property(cc.Node)
    BgWin: cc.Node = null;

    @property({ readonly: true, editorOnly: true, serializable: false })
    private POPUP: string = "FOOTER"
    @property(cc.Node)
    popups: cc.Node = null;
    @property(cc.Prefab)
    popupRule:cc.Prefab = null;
    @property(cc.Prefab)
    popupCoin:cc.Prefab = null;

    @property(EffectJackpot)
    effectJP: EffectJackpot = null;


    private readonly dataBet = [0,10000,10,100,1000];

    private gamestate: GameState = GameState.Waiting;
    private countTime: number = 0;
    private speed: number = 1;
    private ACCESS_TOKEN: string = "";
    
    public numberWin: number = null;

    private result: number = null; // Ô trúng thưởng (0-Xam, 1-Xanh, 2-Đỏ)
    private number_result: number = null; // Số trúng thưởng.

    private timeOutLoading: any = null;
    private isPageVisible: boolean = true;


    onLoad() {
        Roulette.Ins =this;


        NetworkClient.getInstance().addOnClose(() => {
            //ket noi that bai, thu lai . . .
            this.showErrLoading("ချိတ်ဆက်မှု မအောင်မြင်ပါ၊ ထပ်စမ်းကြည့်ပါ။ . . .");
        }, this);

        NetworkClient.getInstance().addOnOpen(() => {
            if (Configs.Login.IsLogin) {
                this.showErrLoading("Loging in...");
                switch (Configs.Login.LoginType) {
                    case Configs.LoginType.Gowin:
                        this.sendLoginGowin(true);
                        break;
                }
            } else {
                this.showLoading(false);
                this.sendLoginGowin(false);
            }
            
            // console.log("GetState_Open-------------------------------------");
            this.getGameState();
        }, this);

        if (!NetworkClient.getInstance().isConnected()) {
            this.showErrLoading("Connecting to server...");
            NetworkClient.getInstance().connect();
        }

        this.clearData();
        this.NickName.string = Configs.Login.Nickname;
        
        NetworkClient.getInstance().request("rouletteJoin", {}, res => {
            if (!res["ok"]) {
                console.error("roulette", "!res.ok");
                return;
            }

            NetworkClient.getInstance().request("rouletteResultHistory", {}, res => {
                for (let i = 0; i < res[`data`].length; i++) {
                    let id = res[`data`][`${i}`];
                    let line = cc.instantiate(this.LineView[id]);
                    line.parent = this.PreviousRollView;
                    line.setSiblingIndex(0);                     
                }
            },this);
        },this);


        NetworkClient.getInstance().addListener((route, res) => {
            switch (route) {
                case `OnRouletteJoin`:
                    break;
                case `OnRouletteLeave`:
                    break;
                case `OnRouletteBet`:
                    
                    let item = cc.instantiate(this.ItemKhungBet);
                    item.getChildByName(`lbName`).getComponent(cc.Label).string = `${res[`nickName`]}`;
                    item.getChildByName(`lbCoin`).getComponent(cc.Label).string = `${res[`amount`]}`;
                    switch (res[`slotId`]) {
                        case 2:
                            this.checkLayoutBet(item, 2);
                            break;
                        case 1:
                            this.checkLayoutBet(item, 1);
                            break;
                        case 0:
                            this.checkLayoutBet(item, 0);
                            break;
                    }
                    break;
                case `OnRouletteState`:
                    this.gamestate = res[`state`];
                    this.countTime =  res["start"] + res["length"];

                    switch (this.gamestate) {
                        case GameState.Waiting://0
                            break;
                        case GameState.Betting://1
                            this.clearData();
                            this.onBetting();
                            
                            break;
                        case GameState.ShowingResult://2
                            this.CountDown.active = false;
                            this.resetView();
                            this.onSpin();
                            this.result = res[`result`][`0`];
                            this.number_result = res[`number_result`]
                            break;
                        case GameState.CalculatingResult://3
                            this.BgBet.active = false;
                            break;
                        case GameState.Ending://4
                            this.BgWin.children[this.result].active = true
                            this.updateLineView();
                            break;
                    }
                    break;
                case `OnRouletteWin`:
                case `OnRouletteWinJackPot`:
                    let data = res[`${this.result}`];
                    if (!data || data.length === 0) {
                        return;
                    }
                    let newCoin = Configs.Login.CoinRoulette;
                    data.forEach(e2 => {
                        if (e2["userId"] == Configs.Login.UserId) {
                            newCoin = e2["cash"];
                            if(route === `OnRouletteWinJackPot`){
                                this.scheduleOnce(()=>{
                                    this.effectJP.show(e2[`win`]);
                                },1);
                            }
                        }
                    });
                        Configs.Login.CoinRoulette = newCoin;
                    break;
            }
        },this);

        // NetworkClient.getInstance().addOnOpen(() => {
        //     this.getGameState();
        // }, this);
        document.addEventListener("visibilitychange", () => {
            this.isPageVisible = document.visibilityState === "visible";
            if (this.isPageVisible) {
                // Tab đã được xem lại, thực hiện reload game tại đây
                // console.log("GetState_Tap-------------------------------------");
                this.getGameState();
            }
        });
        
    }
    
    start () {
        // console.log("GetState_Start-------------------------------------");
        this.getGameState();
    }
    
    protected update(dt: number): void {
        this.LabelInGameCoin.string = `${Configs.Login.CoinRoulette}`;
        
        this.checkLineView(); //hiển thị số lượng dòng bet

        let time = (this.countTime - NetworkClient.serverCurrentTimeMillis())/1000;
        switch (this.gamestate) {
            case GameState.Betting:
                if(this.countTime > 0){
                    if(time > 0){
                        this.CountDown.children[1].getComponent(cc.Label).string = `${time < 10 ? "0" : ""}${time.toFixed(2)}`;
                    }
                }
                break;
            case GameState.CalculatingResult:
                if(this.number_result == this.numberWin){
                    this.Rolls.stopAllActions();
                }
            break;
        }
        
        NetworkClient.getInstance().addListener((route, res) => {
            if(route == "OnRouletteUpdatejp"){
                // this.LabelJackpot.string = res[`jp`];
                Tween.numberTo(this.LabelJackpot, res[`jp`]);
            }
        },this);
    }

    showLoading(isShow: boolean, timeOut: number = 15) {
        // this.loadingLabel.string = "လုဒ်တင်လုပ်နေသည်....";
        if (this.timeOutLoading != null) clearTimeout(this.timeOutLoading);
        if (isShow) {
            if (timeOut > 0) {
                this.timeOutLoading = setTimeout(() => {
                    this.showLoading(false);
                }, timeOut * 1000);
            }
            this.loading.active = true;
        } else {
            this.loading.active = false;
        }
        this.loadingIcon.stopAllActions();
        this.loadingIcon.runAction(cc.repeatForever(cc.rotateBy(1, 360)));
    }

    showErrLoading(msg?: string) {
        this.showLoading(true, -1);
        this.loadingLabel.string = msg ? msg : "Loss of connection, retrying ...";
    }

    public sendLoginGowin(isReconnect: boolean = false, cb: () => void = null) {
        if (typeof (requestHeaders) == "object" && requestHeaders["access-token"])
            this.ACCESS_TOKEN = requestHeaders["access-token"];

        if (!this.ACCESS_TOKEN) {
            this.ACCESS_TOKEN = Utils.urlParam("token");
            if(Utils.urlParam("token") == null || Utils.urlParam("token") == ""){
                this.ACCESS_TOKEN = Utils.urlParam("accessToken");
            }
        }

        if (!this.ACCESS_TOKEN) {
            console.log("Login failure, invalid token!, please try again later.");
            return;
        } 

        NetworkClient.getInstance().request("gowinLogin", {
            "accessToken": this.ACCESS_TOKEN,
            "language": "my"
        }, (res) => {
            this.showLoading(false);
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


    getGameState(): void{
        // NetworkClient.getInstance().request("rouletteJoin", {}, res => {
        //     if (!res["ok"]) {
        //         console.error("roulette", "!res.ok","GetState");
        //         return;
        //     }
            NetworkClient.getInstance().request("rouletteGetState", {}, res => {
                if (!res["ok"] || res["data"]["numberOfPlayer"] <= 0) {
                return;
            }
                let data = res["data"];
                this.gamestate = data[`state`];
                this.countTime =  data["start"] + data["length"];
                this.result = data[`result`][`0`];
                this.number_result = data[`number_result`];
                this.LabelJackpot.string = data[`jp`];

                if(this.gamestate !== GameState.ShowingResult){
                    this.showResult(this.number_result);
                }

                switch (this.gamestate) {
                    case GameState.Betting://1
                        this.onBetting();
                        break;
                    case GameState.ShowingResult://2
                        this.CountDown.active = false;
                        this.resetView();
                        this.Rolls.stopAllActions();
                        this.onSpin();
                        break;
                    case GameState.CalculatingResult:
                        this.BgWin.children[this.result].active = true;
                        break;
                }
            },this);
        // },this);
    }

    onSpin(): void{
        let start = this.Rolls.position.x;
        let end = start + 690;
        this.speed = end / 1380;

        this.interactableButtons(false);

        cc.tween(this.Rolls)
        .to(this.speed, {position: cc.v3(-690)})
        .call(()=> {
            this.Rolls.position = cc.v3(690);
            this.onSpin();
        })
        .start();
    }

    showResult(node: number){
        let taget = this.Rolls.getChildByName(`Item ${node}`).position;

        cc.tween(this.Rolls)
        .to(0, {position: cc.v3(-taget.x)})
        .start();
    }

    onBetting(): void{
        this.CountDown.active = true;
        this.Arrow.opacity = 100;
        this.turnOffBgWin();
        this.Rolls.stopAllActions();

        this.interactableButtons(true);
        // this.lineTime();
    }

    resetView(): void{
        this.Arrow.opacity = 255;
        this.BgBet.active = true;
        // this.Line.width = 1178;
    }

    // lineTime(): void{
    //     let time = (this.countTime - NetworkClient.serverCurrentTimeMillis())/1000;

    //     cc.tween(this.Line)
    //     .to(time, {width: 0})
    //     .start();
    // }

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

    checkLayoutBet(data: cc.Node, idx: number): void{
        if(this.LayoutBet[idx].childrenCount == 0){
            data.parent = this.LayoutBet[idx];
        }else{
            for (let i = 0; i < this.LayoutBet[idx].childrenCount; i++) {
                let a = this.LayoutBet[idx].children[i];
                let b = data.getChildByName(`lbName`).getComponent(cc.Label).string;
                let c = a.getChildByName(`lbName`).getComponent(cc.Label).string
                if(b == c){
                    let d = parseInt(a.getChildByName(`lbCoin`).getComponent(cc.Label).string);
                    d += parseInt(data.getChildByName(`lbCoin`).getComponent(cc.Label).string);
                    a.getChildByName(`lbCoin`).getComponent(cc.Label).string = `${d}`;
                    return;
                }      
            }
            data.parent = this.LayoutBet[idx];
        }
    }

    clearData(): void{
        if(this.LayoutBet == null) return;
        for (let i = 0; i < this.LayoutBet.length; i++) {
            this.LayoutBet[i].removeAllChildren();
        }
    }

    updateLineView(): void{
        let line = cc.instantiate(this.LineView[this.result]);
        line.parent = this.PreviousRollView;
    }

    checkLineView(): void{
        if(this.PreviousRollView.childrenCount > 100){
            let item = this.PreviousRollView.children[0];
            item.removeFromParent();
            item.destroy();
        }
    }
    
    turnOffBgWin(): void{
        for (let i = 0; i < this.BgWin.childrenCount; i++) {
            this.BgWin.children[i].active = false;
        }
    }

    
    onClickBet(event: cc.Event.EventTouch, customEventData: string): void{

        let betMoney = parseInt(this.LabelPutCoin.string);
        if(betMoney == 0) return;

        NetworkClient.getInstance().request("rouletteBet", {
            "amount": betMoney,
            "slotId" : customEventData,
        }, res => {
            if (!res["ok"]) 
            {
                if(this.gamestate == GameState.Betting){
                    PopupCoin.show();
                }
                return;
            }

            let item = cc.instantiate(this.ItemKhungBet);
            item.getChildByName(`lbName`).getComponent(cc.Label).string = `${this.NickName.string}`;
            item.getChildByName(`lbCoin`).getComponent(cc.Label).string = `${this.LabelPutCoin.string}`;

            switch (customEventData) {
                case "2":
                    this.checkLayoutBet(item, 2);
                    break;
                case "1":
                    this.checkLayoutBet(item, 1);
                    break;
                case "0":
                    this.checkLayoutBet(item, 0);
                    break;
            }
            Configs.Login.CoinRoulette = res[`cash`];
        },this);
    }

    onClickPut(event: cc.Event.EventTouch, customEventData: string) {
        switch (customEventData) {
            case "10k":
                this.LabelPutCoin.string = `${this.dataBet[1]}`;
                break;
            case "10":
                this.LabelPutCoin.string = `${this.dataBet[2]}`;
                break;
            case "100":
                this.LabelPutCoin.string = `${this.dataBet[3]}`;
                break;
            case "1k":
                this.LabelPutCoin.string = `${this.dataBet[4]}`;
                break;
            default:
                this.LabelPutCoin.string = `${this.dataBet[0]}`;
                break;
        }
    }

    onClickPayment(){
        // window.location.href = "https://gowin.asia/payment";
        cc.sys.openURL("https://gowin.asia/payment");
        // window.parent.postMessage({ action: 'changeLocation', url: "https://gowin.asia/payment" }, '*');
    }

    onClickRule() {
        PopupRule.show();
    }
}

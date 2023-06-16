const { ccclass, property } = cc._decorator;
export class Utils {
    static urlParam(name: string) {
        var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.search);
        return (results !== null) ? results[1] || "" : "";
    }
}

namespace Configs {
    export class Connect {
        static IsDebug = Utils.urlParam("debug");
        static IsUseWSS: boolean = true;

        static Host: string = Connect.IsDebug ? "api-slot5.gowin.asia" : "api-slot5.gowin.asia";//debug
        static Port: number = Connect.IsDebug ? 2088 : 2088;
    }

    export enum LoginType {
        Normal,
        Quick,
        Gowin,
    }

    export class Login {
        static LoginType: LoginType = LoginType.Normal;
        static IsLogin: boolean = false;

        static CoinRoulette: number = 0;
        static UserId: number = 0;
        static Nickname: string = "";


        static clear() {
            this.IsLogin = false;

            this.CoinRoulette = 0;
            this.UserId = 0;
        }
    }
}
export default Configs;
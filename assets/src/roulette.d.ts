declare function md5(v:string);
declare class base64 {
    static encode(v:string);
    static decode(v:string);
}

declare class msgpack {
    static encode(v:string):Uint8Array;
    static encode(v:any):Uint8Array;
    static decode(v:any):any;
}
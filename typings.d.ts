declare module 'uuid' {
    export function v4(): string;
}

declare module 'on-headers' {
    function onHeaders(res: any, listener: Function): void;
    namespace onHeaders {}
    export = onHeaders;
}

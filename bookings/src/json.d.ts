declare type JSONValue =
    | string
    | number
    | boolean
    | JSONObject
    | JSONArray
    | null;

declare interface JSONObject {
    [x: string]: JSONValue;
}

declare type JSONArray = JSONValue[]

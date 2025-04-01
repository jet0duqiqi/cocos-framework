export default class StringUtil
{
    public static trim(str: String): void {
        str = str.replace(/^\s*/g, "");
        str = str.replace(/\s*$/g, "");
    }
    public static format(str: String, ...args): String {
        for (var i: number = 0; i < args.length; i++) {
            str = str.replace(new RegExp("\\{" + i + "\\}", "gm"), args[i]);
        }
        return str;
    }
}
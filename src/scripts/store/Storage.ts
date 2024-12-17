export default class Storage {

    private key: string;

    constructor(key: string) {
        this.key = key;
    }

    protected read(): Record<string, any> {
        return JSON.parse(window.localStorage.getItem(this.key) || "{}");
    }

    protected write(data: any) {
        window.localStorage.setItem(this.key, JSON.stringify(data));
    }

    set(key: string, value: any) {

        const data = this.read();
        data[key] = value;
        this.write(data);

    }

    get(key: string) {
        return this.read()[key];
    }

}

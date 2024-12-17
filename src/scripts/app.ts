import Store from "./store/Store";
import Observer from "./Observer";
import Storage from "./store/Storage";
import infoTokens from "./store/slices/infotokens/slice";

const store = new Store({
    observer: new Observer(),
    storage: new Storage("pg"),
});

store.addSlice(infoTokens);

console.log({ store });

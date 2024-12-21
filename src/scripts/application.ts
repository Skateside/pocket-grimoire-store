import App from "./App";
import Observer from "./Observer";
import Store from "./store/Store";
import Storage from "./store/Storage";
import infoTokensSlice from "./store/slices/infotokens/slice";
import infoTokensComponent from "./components/infoTokens";

const application = new App({
    store: new Store({
        observer: new Observer(),
        storage: new Storage("pg"),
    }),
});

application
    .addSlice(infoTokensSlice)
    .addComponent(infoTokensComponent)
    .run();

console.log({ application });

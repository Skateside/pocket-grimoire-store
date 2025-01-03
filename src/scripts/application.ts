import App from "./App";
import Observer from "./Observer";
import Store from "./store/Store";
import Storage from "./store/Storage";
import infoTokensSlice from "./store/slices/infotokens/slice";
import rolesSlice from "./store/slices/roles/slice";
import infoTokensComponent from "./components/infoTokens";
import scriptsComponent from "./components/scripts";

const application = new App({
    store: new Store({
        observer: new Observer(),
        storage: new Storage("pg"),
    }),
});

application
    .addSlice(infoTokensSlice)
    .addSlice(rolesSlice)
    .addComponent(infoTokensComponent)
    .addComponent(scriptsComponent)
    .run();

console.log({ application });

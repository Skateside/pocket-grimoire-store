import App from "./App";
import Observer from "./Observer";
import Store from "./store/Store";
import Storage from "./store/Storage";
import infoTokensSlice from "./store/slices/infotokens/slice";
import rolesSlice from "./store/slices/roles/slice";
import infoTokensComponent from "./components/infoTokens";
import scriptsComponent from "./components/scripts";
import rolesComponent from "./components/roles";

// Since this is called "game", there can be another one called "sheet" etc.

const game = new App({
    store: new Store({
        observer: new Observer(),
        storage: new Storage("pg"),
    }),
});

game
    .addSlice(infoTokensSlice)
    .addSlice(rolesSlice)
    .addComponent(infoTokensComponent)
    .addComponent(scriptsComponent)
    .addComponent(rolesComponent)
    .run();

console.log({ game });
(window as any).game = game;

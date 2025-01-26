import App from "./App";
import Observer from "./Observer";
import Store from "./store/Store";
import Storage from "./store/Storage";
// Slices
import i18nSlice from "./store/slices/i18n/slice";
import infoTokensSlice from "./store/slices/infotokens/slice";
import rolesSlice from "./store/slices/roles/slice";
// Components
import gameComponent from "./components/game";
import infoTokenDialog from "./components/info-token-dialog";
import infoTokenForm from "./components/info-token-form";
import infoTokenList from "./components/info-token-list";
import infoTokenTrigger from "./components/info-token-trigger";
import roleToken from "./components/role-token";

// Since this is called "game", there can be another one called "sheet" etc.

const game = new App({
    store: new Store({
        observer: new Observer(),
        storage: new Storage("pg"),
    }),
});

game
    .addSlices([
        i18nSlice,
        infoTokensSlice,
        rolesSlice,
    ])
    .registerComponents([
        gameComponent,
        infoTokenDialog,
        infoTokenForm,
        infoTokenList,
        infoTokenTrigger,
        roleToken,
    ])
    .render("game");

(window as any).game = game; // DEBUG

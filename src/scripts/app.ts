import store from "./store";
import infoTokens from "./Store/slices/infotokens/slice";

store.addSlice(infoTokens);

console.log({ store });

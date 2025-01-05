import type { II18nData } from "../store/slices/i18n/types";
import type { IInfoToken } from "../store/slices/infotokens/types";
import type { IRoleCoreTeam, IRole, IRoleScript } from "../store/slices/roles/types";

// TODO: Put this into a slice of some kind.
type IGame = Record<number, Record<IRoleCoreTeam, number>>;

declare global {
    interface Window {
        PG: {
            game: IGame,
            i18n: II18nData,
            infoTokens: IInfoToken[],
            roles: IRole[],
            scripts: Record<string, IRoleScript>,
        },
    }
}

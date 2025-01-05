import type {
    IAppGetSlice,
} from "../types/app";
import type {
    IRoleScript,
} from "../store/slices/roles/types";
// import {
//     findOrDie,
//     renderTemplate,
// } from "../utilities/dom";

export default function roles(getSlice: IAppGetSlice) {

    const rolesSlice = getSlice("roles");
    // const i18nSlice = getSlice("i18n");
    // const { trans } = getSlice("i18n").references;

    // drawRoles(rolesSlice.references.getScript(), i18nSlice.references.trans);
    drawRoles(rolesSlice.references.getScript());

}

// const drawRoles = (script: IRoleScript, trans: (key: string) => string) => {
const drawRoles = (script: IRoleScript) => {

    if (!script.length) {
        return;
    }

    // return trans("abc");

}; 

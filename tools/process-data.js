import path from "path";
// import file from "fs";
import {
    readdir,
    readFile,
    writeFile,
} from "fs/promises";
import { styleText } from "util";

const getPathName = (pathName) => {

    const { dirname } = import.meta;
    const parts = pathName.split("/");

    if (parts[0] === ".") {
        parts[0] = dirname;
    } else if (parts[0] === "..") {
        parts.unshift(dirname);
    }

    return path.join(...parts);

};

const rawFiles = Object.entries({
    infoTokens: "info-tokens.json",
    jinxes: "jinxes.json",
    nightOrder: "night-order.json",
    roles: "roles.json",
    scripts: "scripts.json",
}).reduce((files, [name, fileName]) => {

    const pathName = getPathName(`../data/raw/${fileName}`);

    files[name] = readFile(pathName, { encoding: "utf8" });

    return files;

}, Object.create(null));



readdir(getPathName("../data/locales")).then((dirs) => {
    // console.log(dirs);

    let complete = 0;
    const { length } = dirs;

    for (const dir of dirs) {

        const localeFiles = Object.entries({
            infoTokens: "info-tokens.json",
            jinxes: "jinxes.json",
            roles: "roles.json",
            scripts: "scripts.json",
        }).reduce((files, [name, fileName]) => {

            const pathName = getPathName(`../data/locales/${dir}/${fileName}`);

            files[name] = readFile(pathName, { encoding: "utf8" });
        
            return files;
        

        }, Object.create(null));

        Promise.all([
            createInfoTokens([
                rawFiles.infoTokens,
                localeFiles.infoTokens,
            ]),
            createRoles([
                rawFiles.roles,
                rawFiles.jinxes,
                rawFiles.nightOrder,
                localeFiles.roles,
                localeFiles.jinxes,
            ]),
            createScripts([
                rawFiles.scripts,
                localeFiles.scripts,
            ]),
        ]).then(([
            infoTokens,
            roles,
            scripts,
        ]) => {

            writeFile(
                getPathName(`../public/assets/data/${dir}.js`),
                writeAllData({
                    infoTokens,
                    roles,
                    scripts,
                }),
            ).then(() => {

                complete += 1;
                console.log(
                    styleText(
                        ["green"],
                        `File written for "${dir}" - ${complete}/${length}`
                    ),
                );

            });

        });

    }

});

const writeData = (property, data, isDebug = false) => {

    const space = (
        isDebug
        ? " "
        : ""
    );
    const indent = (
        isDebug
        ? "    "
        : ""
    );

    return [
        "PG.",
        property,
        space,
        "=",
        space,
        JSON.stringify(data, null, indent),
    ].join("");

};

const writeAllData = (data, isDebug = false) => {

    const seperator = (
        isDebug
        ? ";\n"
        : ";"
    );
    const tail = (
        isDebug
        ? ";\n"
        : ""
    );

    return Object
        .entries(data)
        .map(([property, data]) => writeData(property, data, isDebug))
        .join(seperator) + tail;

};

const processFiles = (promises) => Promise.all(promises).then((strings) => [
    ...strings.map((string) => JSON.parse(string)),
]);

const createInfoTokens = (tokenFiles) => processFiles(tokenFiles).then(([
    rawInfo,
    localeInfo,
]) => new Promise((resolve, reject) => {

    Object.entries(localeInfo).forEach(([id, text]) => {

        const token = rawInfo.find((token) => token.id === id);

        if (!token) {
            return reject(new ReferenceError(`Cannot find token "${id}" in`));
        }

        token.text = text;

    });

    resolve(rawInfo);

}));

const createRoles = (roleFiles) => processFiles(roleFiles).then(([
    rawRoles,
    rawJinxes,
    nightOrder,
    localeRoles,
    localeJinxes,
]) => new Promise((resolve, reject) => {

    rawRoles.forEach((role) => {

        Object.assign(
            role,
            localeRoles.find(({ id }) => id === role.id) || {},
        );

        role.firstNight = Math.max(0, nightOrder.firstNight.indexOf(role.id));
        role.otherNight = Math.max(0, nightOrder.otherNight.indexOf(role.id));

        const jinxData = rawJinxes.find(({ id }) => id === role.id);

        if (!jinxData) {
            return;
        }

        const jinxes = [];

        jinxData.jinx.forEach(({ id, reason }) => {

            const localeJinx = localeJinxes.find((jinx) => (
                jinx.target === role.id
                && jinx.trick === id
            ));

            jinxes.push({ id, reason: localeJinx?.reason || reason });

        });

        role.jinxes = jinxes;

    });

    resolve(rawRoles);

}));

const createScripts = (scriptFiles) => processFiles(scriptFiles).then(([
    rawScripts,
    localeScripts,
]) => new Promise((resolve, reject) => {

    Object.entries(rawScripts).forEach(([id, script]) => {

        const metaIndex = script.findIndex((entry) => (
            typeof entry === "object"
            && entry.id === "_meta"
        ));
        const metaEntry = script[metaIndex] || {};

        metaEntry.id = "_meta";
        metaEntry.author = localeScripts.author;
        metaEntry.name = localeScripts.scripts[id] || "";

        if (metaIndex === -1) {
            script.unshift(metaEntry);
        }

    });

    resolve(rawScripts);

}));

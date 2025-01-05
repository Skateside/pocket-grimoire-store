import path from "path";
import {
    readdir,
    readFile,
    writeFile,
} from "fs/promises";
import { styleText } from "util";

/**
 * Takes a path name and runs in through {@link path} - adding the directory
 * name of this file, if necessary.
 *
 * @param {String} pathName Path name to properly parse.
 * @returns {String} Properly formatted path name,
 */
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

/**
 * Writes out the given data as part of a `PG` object. In debug mode, whitespace
 * is added to make the output more readable.
 *
 * @param {String} property Property to write.
 * @param {Array|Object} data Data to write.
 * @param {Boolean} [isDebug=false] Optional debug flag - defaults to `false`.
 * @returns {String} Written data.
 */
const writeData = (property, data, isDebug = false) => {

    const space = (
        isDebug
        ? " "
        : ""
    );
    const indent = (
        isDebug
        ? 4
        : 0
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

/**
 * Writes the given data. In debug mode, more whitespace is added. See
 * {@link writeData}.
 *
 * @param {Object} data Data to write.
 * @param {Boolean} [isDebug=false] Optional debug flag - defaults to `false`.
 * @returns {String} Written data.
 */
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

/**
 * Takes an array of promises and returns a single promise that resolves when
 * all the given promises have been resolves and their contents parsed as JSON.
 * This is mainly a helper function to remove some biolerplate for the "create"
 * functions.
 *
 * @param {Promise[]} promises Promises to resolve.
 * @returns {Promise} A promise that resolves with JSON from the other promises.
 */
const processFiles = (promises) => Promise.all(promises).then((strings) => [
    ...strings.map((string) => JSON.parse(string)),
]);

/**
 * Creates the localised info tokens.
 *
 * @param {Promise[]} tokenFiles Files needed to process the info tokens.
 * @returns {Promise} A promise that resolves with localised info tokens.
 */
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

/**
 * Creates the localised roles (including jinxes).
 *
 * @param {Promise[]} roleFiles Files needed to process the roles.
 * @returns {Promise} A promise that resolves with localised roles.
 */
const createRoles = (roleFiles) => processFiles(roleFiles).then(([
    rawRoles,
    images,
    universalRoles,
    localeRoles,
    localeJinxes,
]) => new Promise((resolve, reject) => {

    rawRoles.push(...universalRoles);
    rawRoles.forEach((role) => {

        Object.assign(
            role,
            images.find(({ id }) => id === role.id) || {},
            localeRoles.find(({ id }) => id === role.id) || {},
        );

        if (!role.jinxes?.length) {
            return;
        }

        const jinxes = localeJinxes.filter(({ target }) => target === role.id);

        if (!jinxes) {
            return;
        }

        role.jinxes = role.jinxes.map(({ id, reason }) => ({
            id,
            reason: jinxes.find(({ trick }) => trick === id)?.reason || reason,
        }));

    });

    resolve(rawRoles.sort((a, b) => a.id.localeCompare(b.id)));

}));

/**
 * Creates the localised scripts.
 *
 * @param {Promise[]} scriptFiles Files needed to process the scripts.
 * @returns {Promise} A promise that resolves with localised scripts.
 */
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

/**
 * Creates the localised translations (i18n = internationalisation).
 * 
 * @param {Promise[]} i18nFiles Files needed to process the texts. 
 * @returns {Promise} A promise that resolves the with localised texts.
 */
const createI18n = (i18nFiles) => processFiles(i18nFiles).then(([
    localeI18n,
]) => new Promise((resolve, reject) => {
    resolve(localeI18n);
}));

/*
Process the data.
*/

// Start by reading all the locales that we have saved in "data/locales/"

readdir(getPathName("../data/locales")).then((dirs) => {

    // When we have them all, get the files in "data/raw/" - they're the base of
    // the data, the files in "data/locales/" will agument that data to localise
    // it all.

    const rawFiles = Object.entries({
        images: "images.json",
        infoTokens: "info-tokens.json",
        roles: "roles.json",
        scripts: "scripts.json",
        universal: "universal.json",
    }).reduce((files, [name, fileName]) => {

        const pathName = getPathName(`../data/raw/${fileName}`);

        files[name] = readFile(pathName, { encoding: "utf8" });

        return files;

    }, Object.create(null));

    // Keep a track of how many locales have been processed - it makes it easy
    // to see how much progress has been made.

    let complete = 0;
    const { length } = dirs;

    for (const dir of dirs) {

        // Get the files from the current locale.

        const localeFiles = Object.entries({
            i18n: "i18n.json",
            infoTokens: "info-tokens.json",
            jinxes: "jinxes.json",
            roles: "roles.json",
            scripts: "scripts.json",
        }).reduce((files, [name, fileName]) => {

            const pathName = getPathName(`../data/locales/${dir}/${fileName}`);

            files[name] = readFile(pathName, { encoding: "utf8" });

            return files;

        }, Object.create(null));

        // Pass the information to our "create" functions, allowing them to be
        // read asynchronously.

        Promise.all([
            createInfoTokens([
                rawFiles.infoTokens,
                localeFiles.infoTokens,
            ]),
            createRoles([
                rawFiles.roles,
                rawFiles.images,
                rawFiles.universal,
                localeFiles.roles,
                localeFiles.jinxes,
            ]),
            createScripts([
                rawFiles.scripts,
                localeFiles.scripts,
            ]),
            createI18n([
                localeFiles.i18n,
            ]),
        ]).then(([
            infoTokens,
            roles,
            scripts,
            i18n,
        ]) => {

            // Write the locale file, telling the console when it's done.

            const isDebug = process.argv.includes("--debug");

            writeFile(
                getPathName(`../public/assets/data/${dir}.js`),
                writeAllData({
                    infoTokens,
                    roles,
                    scripts,
                    i18n,
                }, isDebug),
            ).then(() => {

                complete += 1;
                console.log(
                    "File written for "
                    + styleText(["green"], dir)
                    + (
                        isDebug
                        ? ` - ${complete}/${length}`
                        : ""
                    )
                );

            });

        });

    }

});

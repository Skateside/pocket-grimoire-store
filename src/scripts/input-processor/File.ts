import type {
    IRoleScript,
} from "../store/slices/roles/types";
import type {
    IInputProcessorResponse,
} from "./types";
import InputProcessor from "./InputProcessor";
import {
    readUTF8,
} from "../utilities/strings";

export default class File extends InputProcessor<HTMLInputElement> {

    process() {

        return new Promise<IInputProcessorResponse>((resolve, reject) => {

            const reader = new FileReader();

            reader.addEventListener("load", ({ target }) => {

                try {

                    // Accented characters were getting mangled. This fix allows
                    // them to be included. Noticed when trying to upload a
                    // homebrew Spanish script.
                    const json = JSON.parse(readUTF8(target?.result as string)) as IRoleScript;
                    resolve({
                        success: true,
                        message: json,
                    });

                } catch (error) {
                    reject(error);
                }


            });

            const file = this.input.files?.[0];

            if (file) {
                reader.readAsText(file);
            }

        });

    }

}

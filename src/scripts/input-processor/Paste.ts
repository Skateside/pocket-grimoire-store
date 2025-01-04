import type {
    IRoleScript,
} from "../store/slices/roles/types";
import InputProcessor from "./InputProcessor";

export default class Paste extends InputProcessor<HTMLTextAreaElement> {

    process() {

        return new Promise<IRoleScript>((resolve, reject) => {

            try {

                const json = JSON.parse(this.input.value);
                resolve(json);

            } catch (error) {
                reject(error);
            }

        });

    }

}

import type {
    IInputProcessorResponse,
} from "./types";
import type {
    IRoleScript,
} from "../store/slices/roles/types";
import InputProcessor from "./InputProcessor";

export default class Paste extends InputProcessor<HTMLTextAreaElement> {

    process() {

        return new Promise<IInputProcessorResponse>((resolve, reject) => {

            try {

                const json = JSON.parse(this.input.value) as IRoleScript;
                resolve({
                    success: true,
                    message: json,
                });

            } catch (error) {
                reject(error);
            }

        });

    }

}

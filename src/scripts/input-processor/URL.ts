import type {
    IInputProcessorResponse,
} from "./types";
import InputProcessor from "./InputProcessor";

export default class URL extends InputProcessor<HTMLInputElement> {

    process() {

        const { href } = window.location;

        if (!(/^https?:$/).test((new window.URL(href)).protocol)) {
            return Promise.reject(this.input.dataset.errorOffline || "offline");
        }

        return new Promise<IInputProcessorResponse>((resolve, reject) => {

            const url = new window.URL("/url-proxy.php", href);
            url.searchParams.append("url", this.input.value);

            fetch(url)
                .then(
                    (response) => response.json(),
                    (error) => reject(error.message),
                )
                .then((json) => resolve(json));

        });

    }

}

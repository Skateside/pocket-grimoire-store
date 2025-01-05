import type { IRoleScript } from "../store/slices/roles/types";

export type IInputProcessorResponse = {
    success: false,
    message: string,
} | {
    success: true,
    message: IRoleScript,
};

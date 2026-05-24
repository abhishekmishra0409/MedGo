import { toast } from "react-toastify";

const notifyOptions = {
    success: { type: "success" },
    error: { type: "error" },
    warning: { type: "warning" },
    info: { type: "info" },
};

export const notify = {
    success: (message, options = {}) => toast.success(message, { ...notifyOptions.success, ...options }),
    error: (message, options = {}) => toast.error(message, { ...notifyOptions.error, ...options }),
    warning: (message, options = {}) => toast.warning(message, { ...notifyOptions.warning, ...options }),
    info: (message, options = {}) => toast.info(message, { ...notifyOptions.info, ...options }),
};

export default notify;

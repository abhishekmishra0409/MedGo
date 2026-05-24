import toast from "react-hot-toast";

export const notify = {
    success: (message, options = {}) => toast.success(message, options),
    error: (message, options = {}) => toast.error(message, options),
    warning: (message, options = {}) => toast(message, { icon: "!", ...options }),
    info: (message, options = {}) => toast(message, { icon: "i", ...options }),
};

export default notify;

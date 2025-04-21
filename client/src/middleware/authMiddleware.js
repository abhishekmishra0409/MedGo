import { toast } from "react-toastify";

const authMiddleware = (store) => (next) => (action) => {
    const state = store.getState();
    const isAuthenticated = state.auth.isAuthenticated;

    // List of actions that require authentication
    const protectedActions = [
        "cart/addCartItem/pending",
        "cart/addCartItem/rejected",
    ];

    // If the action is a protected one and the user is not authenticated
    if (protectedActions.includes(action.type) && !isAuthenticated) {
        toast.warning("Please login to access this page");
        return;
    }

    // Continue if authenticated or not a protected action
    return next(action);
};


export default authMiddleware;
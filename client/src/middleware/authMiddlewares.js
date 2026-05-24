const authMiddlewares = () => (next) => (action) => {
    // Auth feedback is handled at the route/thunk level with toast IDs so
    // one user action cannot create duplicate notifications.
    return next(action);
};


export default authMiddlewares;

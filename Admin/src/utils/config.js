const getTokenFromLocalStorage = localStorage.getItem("userToken")

const config = {
    headers: {
        Authorization: `Bearer ${
            getTokenFromLocalStorage !== null ? getTokenFromLocalStorage : ""
        }`,
        Accept: "application/json",
    },
};

export default config;
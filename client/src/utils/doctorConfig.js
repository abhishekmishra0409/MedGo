const getTokenFromLocalStorage = localStorage.getItem("doctorToken")

const doctorConfig = {
    headers: {
        Authorization: `Bearer ${
            getTokenFromLocalStorage !== null ? getTokenFromLocalStorage : ""
        }`,
        Accept: "application/json",
    },
};

export default doctorConfig;
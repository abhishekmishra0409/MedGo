import { createAuthConfig } from "./api.js";

const doctorConfig = () => createAuthConfig("doctorToken");

export default doctorConfig;

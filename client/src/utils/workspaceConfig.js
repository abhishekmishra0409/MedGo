import { createAuthConfig } from "./api.js";

// The /clinics/me/* endpoints are shared by clinic-owner accounts and
// doctor-owners (a doctor whose clinicRole is 'owner'). Only one workspace
// session is ever live in a given browser, so whichever token is present wins.
const workspaceConfig = () => createAuthConfig(localStorage.getItem("ownerToken") ? "ownerToken" : "doctorToken");

export default workspaceConfig;

import axios from "axios";
import { base_url } from "../../utils/baseURL";
import config from "../../utils/config.js";

// Get all clinic/hospital owner accounts (admin only)
const getAllOwners = async () => {
    const response = await axios.get(`${base_url}users/admin/owners`, config());
    return response.data;
};

const updateOwnerApproval = async ({ id, approvalStatus, approvalNotes = "" }) => {
    const response = await axios.patch(
        `${base_url}users/admin/owners/${id}/approval`,
        { approvalStatus, approvalNotes },
        config()
    );
    return response.data;
};

export const ownerService = {
    getAllOwners,
    updateOwnerApproval,
};

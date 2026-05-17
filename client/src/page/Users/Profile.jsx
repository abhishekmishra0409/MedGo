import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import CommonProfile from "../../component/Profile/CommonProfile.jsx";
import { getUserData, updateUser } from "../../features/User/UserSlice.js";
import { authService } from "../../features/User/UserService.js";

const Profile = () => {
    const dispatch = useDispatch();
    const { profile, user, isLoading } = useSelector((state) => state.auth);
    const currentProfile = profile || user?.data || user || {};

    useEffect(() => {
        dispatch(getUserData());
    }, [dispatch]);

    const handleSave = async (payload) => {
        const result = await dispatch(updateUser(payload));
        if (updateUser.fulfilled.match(result)) {
            dispatch(getUserData());
            return true;
        }

        return false;
    };

    const handleUploadAvatar = async (file) => {
        const response = await authService.uploadDoctorProfileImage(file);
        return response?.data?.url;
    };

    return (
        <CommonProfile
            profile={currentProfile}
            roleLabel="Patient"
            isLoading={isLoading}
            onSave={handleSave}
            onUploadAvatar={handleUploadAvatar}
        />
    );
};

export default Profile;

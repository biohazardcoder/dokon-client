import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getPending, getError, getUserInfo } from "@/toolkits/user-toolkit";
import { Fetch } from "./Fetch";

const UserAuthHandler = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        const getMyData = async () => {
            try {
                dispatch(getPending());
                const response = (await Fetch.get(`/admin/me`)).data;
                if (response) {
                    dispatch(getUserInfo(response.data));
                } else {
                    dispatch(getError("No user data available"));
                }
            } catch (error: any) {
                dispatch(getError(error.response?.data || "Unknown Token"));
            }
        };
        getMyData();
    }, [dispatch]);

    return null;
};

export default UserAuthHandler;

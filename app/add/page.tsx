"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getPartnerPending,
  getPartnerSuccess,
  getPartnerError,
} from "../../toolkits/PartnersSlicer";
import { Fetch } from "@/middlewares/Fetch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Menu from "@/components/models/menu";
import { getError, getPending, getUserInfo } from "@/toolkits/user-toolkit";
import { useRouter } from "next/navigation";

const Page = () => {
  const dispatch = useDispatch();
  const router = useRouter()
  
  const { data,isError,isAuth } = useSelector((state: any) => state.user) || {};
  
  useEffect(() => {
    if (!isAuth) {
      router.push("/auth") 
    }
  }, [router, isAuth])
  

  const [loading, setLoading] = useState(false)
  const [partnerData, setPartnerData] = useState({
    admin: "",
    shopName: "",
    address: "",
    phoneNumber: "",
  });

   const GetUserData = async () => {
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
          console.log(error);
        }
      };

    useEffect(() => {
      GetUserData();
    }, []);

  useEffect(() => {
    if (data?._id) {
      setPartnerData((prev) => ({ ...prev, admin: data._id }));
    }
  }, [data?._id]);


  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setPartnerData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFormSubmit = async (e: any) => {
    setLoading(true)
    e.preventDefault();
    dispatch(getPartnerPending());
    try {
      const response = await Fetch.post("/partner/create", {
        admin: partnerData.admin,
        shopName: partnerData.shopName,
        address: partnerData.address,
        phoneNumber: partnerData.phoneNumber,
      });
      dispatch(getPartnerSuccess(response.data));
      GetUserData()
      router.replace("./")
    } catch (error: any) {
      dispatch(getPartnerError(error.response.data.message));
      console.log(error.message); 
    }finally{
      setLoading(false)
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form
        onSubmit={handleFormSubmit}
        className="w-full max-w-md h-auto p-4 rounded-lg flex flex-col gap-5"
      >
        <h1 className="text-center text-2xl font-semibold mb-3">
          Xaridor qo'shish
        </h1>
       {isError ?  <h1 className="text-red-500 text-center">
          {isError.message}
        </h1> : ""}
        <Input
          type="text"
          name="shopName"
          className="py-6"
          value={partnerData.shopName}
          onChange={handleInputChange}
          placeholder="Xaridor ismi"
          maxLength={35}
          required
        />
        <Input
          type="text"
          name="address"
          className="py-6"
          value={partnerData.address}
          onChange={handleInputChange}
          placeholder="Xaridor Manzili"
          maxLength={40}
          required
        />
        <Input
          type="text"
          name="phoneNumber"
          className="py-6"
          value={partnerData.phoneNumber}
          onChange={handleInputChange}
          placeholder="Xaridor raqami"
          maxLength={15}
          required
        />

        <div className="flex flex-col gap-2">
          <Button disabled={loading || isError} type="submit" className="w-full text-lg py-5">
            {loading ? "Yaratilmoqda..." : "Yaratish"}
          </Button>
        </div>
      </form>
      <Menu/>
    </div>
  );
};

export default Page;

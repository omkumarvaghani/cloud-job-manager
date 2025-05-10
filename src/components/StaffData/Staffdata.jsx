import React, { createContext, useState, useContext, useEffect } from "react";
import AxiosInstance from "../../Views/AxiosInstance";

const StaffContext = createContext();

export const useStaffContext = () => {
  return useContext(StaffContext);
};

export const StaffProvider = ({ children }) => {
  const [staffData, setStaffData] = useState(undefined);

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const response = await AxiosInstance.get(
          `${process.env.REACT_APP_BASE_API}/worker/get/${localStorage.getItem(
            "CompanyId"
          )}`
        );
        setStaffData(response?.data?.data?.permissions);
      } catch (error) {
        // console.error("Error fetching staff data:", error);
      }
    };

    fetchStaffData();
  }, []);

  return (
    <StaffContext.Provider value={{ staffData, setStaffData }}>
      {children}
    </StaffContext.Provider>
  );
};

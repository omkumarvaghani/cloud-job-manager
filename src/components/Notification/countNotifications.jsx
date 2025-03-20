import { useState, useEffect } from "react";
import AxiosInstance from "../../Views/AxiosInstance";
import { handleAuth } from "../Login/Auth";
import { useLocation, useNavigate } from "react-router-dom";
import sendToast from "../Toast/sendToast";

const useCountNotifications = () => {  
  const [notifications, setNotifications] = useState(0);
  const [tokenDecode, setTokenDecode] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        const res = await handleAuth(navigate, location);
        setTokenDecode(res.data.companyId);
      } catch (error) {
        console.error("Error fetching token data:", error); 
      }
    };

    fetchTokenData();
  }, [navigate, location]);

  useEffect(() => {
    if (tokenDecode) {
      const fetchNotifications = async () => {
        try {
          const response = await AxiosInstance.get(`/notifications/${localStorage.getItem("CompanyId")}`);

          // ${
          //   localStorage.getItem("CompanyId") 
          // }

          if (response.status === 200) {
            setNotifications(response?.data.count);
          }
        } catch (error) {
          sendToast("Unable to connect to the server. Please try again later.");
        }
      };

      fetchNotifications();
    }
  }, [tokenDecode, navigate]);

  return notifications;
};

export default useCountNotifications;

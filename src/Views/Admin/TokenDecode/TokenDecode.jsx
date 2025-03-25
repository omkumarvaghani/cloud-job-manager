import React, { useEffect, useState } from "react";
import axios from "axios";

function TokenDecode() {
  const [tokenDecode, setTokenDecode] = useState(null);

  const fetchTokenData = async () => {
    try {
      const baseUrl = process.env.REACT_APP_BASE_API;
      const token =
        localStorage?.getItem("adminToken") ||
        localStorage?.getItem("workerToken");

      if (!token) {
        console.error("Token not found in localStorage");
        return;
      }

      const res = await axios.post(`${baseUrl}/v1/auth/token_data`, {
        token,
      }); 
      if (res?.data) {
        setTokenDecode(res?.data?.data);
      }
    } catch (error) {
      console.error("Error:", error?.message);
    }
  };

  useEffect(() => {
    fetchTokenData();
  }, []);

  return { tokenDecode };
}

export default TokenDecode;

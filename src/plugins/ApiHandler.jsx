import axios from "axios";
import AxiosInstance from "./axios";
import interceptors from "./axios";

export const getTokenizationKey = async (Company_Id) => {
  try {
    const response = await AxiosInstance.get(
      `nmi/nmi_public_key/${Company_Id}`
    );
    return response?.data;
  } catch (error) {
    throw error;
  }
};
export const getTokenizationKeyCustomer = async (CustomerId) => {
  try {
    const response = await AxiosInstance.get(
      `nmi/nmi_public_key_customer/${CustomerId}`
    );
    return response?.data;
  } catch (error) {
    throw error;
  }
};
export const addCardDetails = async (payload) => {
  try {
    const response = await AxiosInstance.post(`nmi/add-customer-card`, payload);
    return response?.data;
  } catch (error) {
    throw error;
  }
};
// Get customer vault ID
export const getCustomerVaultId = async (CustomerId) => {
  try {
    const response = await AxiosInstance.get(
      `nmi/getCreditCards/${CustomerId}`
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get card details
export const getCardDetails = async (payload) => {
  try {
    const response = await AxiosInstance.post(
      `nmi/get-billing-customer-vault`,
      payload
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get recurring cards
export const getRecurringCards = async (id) => {
  try {
    const response = await AxiosInstance.get(
      `/recurring-payment/recurring-payments/${id}`
    );

    return response.data;
  } catch (error) {
    if (typeof error === "string") throw error;
    else if (Object.keys(error).length) throw JSON.stringify(error);
    else throw "Network problem";
  }
};

// Add recurring cards
export const addRecurringCards = async (data) => {
  try {
    const response = await AxiosInstance.post(
      `recurring-payment/add-cards`,
      data
    );
    return response.data;
  } catch (error) {
    if (typeof error === "string") throw error;
    else if (Object.keys(error).length) throw JSON.stringify(error);
    else throw "Network problem";
  }
};

// export const updateRecurringCard = async (recurringId, data) => {
//   try {
//     const response = await AxiosInstance.put(
//       `recurring-payment/${recurringId}`,
//       data
//     );
//     return response.data;
//   } catch (error) {
//     if (typeof error === "string") throw error;
//     else if (Object.keys(error).length) throw JSON.stringify(error);
//     else throw "Network problem";
//   }
// };

export const updateRecurringCard = async (recurringId, data) => {
  // Type checking
  if (typeof recurringId !== 'string' || !recurringId) {
    throw new Error("Invalid recurringId provided.");
  }
  if (typeof data !== 'object' || data === null) {
    throw new Error("Invalid data provided.");
  }

  try {
    const response = await AxiosInstance.put(
      `recurring-payment/${recurringId}`,
      data
    );
    return response.data;
  } catch (error) {
    // Improved error handling
    if (error.response) {
      console.error("Error Response:", error.response.data);
      throw new Error(`Error ${error.response.status}: ${error.response.data.message || 'An error occurred'}`);
    } else if (error.request) {
      console.error("Error Request:", error.request);
      throw new Error("No response received from the server.");
    } else {
      console.error("Error Message:", error.message);
      throw new Error(`Error: ${error.message}`);
    }
  }
};


//-------------------------------------------------------------------------

export const getCardType = async (cc_bin, cc_type) => {
  const options = {
    method: "POST",
    url: `https://bin-ip-checker.p.rapidapi.com/?bin=${cc_bin}`,

    headers: {
      "content-type": "application/json",
      "X-RapidAPI-Key": "1bd772d3c3msh11c1022dee1c2aep1557bajsn0ac41ea04ef7",
      "X-RapidAPI-Host": "bin-ip-checker.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    return response.data.BIN.type || cc_type;
  } catch (error) {
    return cc_type;
  }
};

// Update Card transaction type (credit/debit)
export const getRentalOwnerCardTypeSettings = async (CustomerId) => {
  try {
    const response = await interceptors.get(
      `customer/payment_settings/${CustomerId}`
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCardLogo = async (cc_type) => {
  try {
    const res = await axios.get(
      `https://logo.clearbit.com/${cc_type.toLowerCase().replace(" ", "")}.com`
    );
    return res.config.url || "";
  } catch (error) {
    return "";
  }
};

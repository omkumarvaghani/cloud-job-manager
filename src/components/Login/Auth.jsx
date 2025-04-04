import AxiosInstance from "../../Views/AxiosInstance";

const getToken = () => {
  const tokens = ["adminToken", "workerToken", "customerToken"];
  for (const token of tokens) {
    const value = localStorage.getItem(token);
    if (value) return value;
  }
  return null;
};

const handleAuth = async (navigate, location, redirectPath = "/auth/login") => {
  const token = getToken();
  console.log(token, "token");
  if (!token) {
    console.error("Token not found in localStorage");
    navigate(redirectPath, { state: { error: "Token not found" } });
    return;
  }

  try {
    const res = await AxiosInstance.post(`/v1/auth/token_data`, { token });
    if (res.data.statusCode != "200") {
      localStorage.clear();
      navigate(redirectPath, {
        state: { error: "Invalid token or unauthorized access" },
      });
      return;
    }
    console.log(res, "res123456u");
    const {
      Role,
      AdminId,
      CustomerId,
      CompanyId,
      CompanyName,
      WorkerId,
      IsPlanActive,
    } = res.data.data;
    const state = { Role, id: null, navigats: [] };

    switch (Role) {
      case "Admin": 
        if (!window.location.pathname.includes("/superadmin")) {
          localStorage.setItem("admin_id", AdminId);
          state.redirect = "/superadmin/index";
          state.navigats = ["/index"];
        }
        break;
      case "Customer":
        if (!window.location.pathname.includes("/customer")) {
          localStorage.setItem("CustomerId", CustomerId);
          state.redirect = "/customers/index";
          state.navigats = ["/index"];
        }
        break;

      case "Company":
        if (!window.location.pathname.includes(`/${CompanyName}`)) {
          localStorage.setItem("CompanyId", CompanyId);
          state.redirect = `/${CompanyName}/index`;
          state.navigats = ["/index"];
        } else if (!IsPlanActive) {
          if (!location.state?.navigats?.includes("/account-billing")) {
            state.redirect = `/${CompanyName}/account-billing`;
            state.navigats = ["/index", "/account-billing"];
          }
        }
        break;

      case "Worker":
        if (!window.location.pathname.includes(`/staff-member`)) {
          localStorage.setItem("worker_id", WorkerId);
          state.redirect = `/staff-member/index`;
          state.navigats = ["/index"];
        }
        break;

      default:
        console.error("Unrecognized Role");
        // localStorage.clear();
        // navigate(redirectPath);
        return;
    }

    return res.data;
  } catch (error) {
    console.error("Error:", error.message);
    if (error.response && error.response.status === 401) {
      // localStorage.clear();
      // navigate(redirectPath, { state: { error: "Unauthorized access" } });
    } else {
      // navigate(redirectPath, {
      //   state: { error: "An unexpected error occurred" },
      // });
    }
  }
};

export { handleAuth };

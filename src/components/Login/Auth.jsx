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

  if (!token) {
    console.error("Token not found in localStorage");
    navigate(redirectPath, { state: { error: "Token not found" } });
    return;
  }

  try {
    const res = await AxiosInstance.post(`/company/token_data`, { token });
    if (res.data.statusCode !== 200) {
      localStorage.clear();
      navigate(redirectPath, {
        state: { error: "Invalid token or unauthorized access" },
      });
      return;
    }

    const {
      role,
      superAdminId,
      CustomerId,
      companyId,
      companyName,
      WorkerId,
      IsPlanActive,
    } = res.data.data;
    const state = { role, id: null, navigats: [] };

    switch (role) {
      case "Superadmin":
        if (!window.location.pathname.includes("/superadmin")) {
          localStorage.setItem("admin_id", superAdminId);
          state.redirect = "/superadmin/index";
          state.navigats = ["/index"];
        }
        break;

      case "customer":
        if (!window.location.pathname.includes("/customer")) {
          localStorage.setItem("CustomerId", CustomerId);
          state.redirect = "/customers/index";
          state.navigats = ["/index"];
        }
        break;

      case "Company":
        if (!window.location.pathname.includes(`/${companyName}`)) {
          localStorage.setItem("CompanyId", companyId);
          state.redirect = `/${companyName}/index`;
          state.navigats = ["/index"];
        } else if (!IsPlanActive) {
          if (!location.state?.navigats?.includes("/account-billing")) {
            state.redirect = `/${companyName}/account-billing`;
            state.navigats = ["/index", "/account-billing"];
          }
        }
        break;

      case "worker":
        if (!window.location.pathname.includes(`/staff-member`)) {
          localStorage.setItem("worker_id", WorkerId);
          state.redirect = `/staff-member/index`;
          state.navigats = ["/index"];
        }
        break;

      default:
        console.error("Unrecognized role");
        localStorage.clear();
        navigate(redirectPath);
        return;
    }

    return res.data;
  } catch (error) {
    console.error("Error:", error.message);
    if (error.response && error.response.status === 401) {
      localStorage.clear();
      navigate(redirectPath, { state: { error: "Unauthorized access" } });
    } else {
      navigate(redirectPath, {
        state: { error: "An unexpected error occurred" },
      });
    }
  }
};

export { handleAuth };

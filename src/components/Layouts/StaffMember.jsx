import React, { useEffect, useRef, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import routes from "../../routes";
import Sidebar from "../Sidebar";
import { MainNav } from "../MuiTable";
import { useMediaQuery } from "@mui/material";
import AxiosInstance from "../../Views/AxiosInstance";
import { Grid } from "@mui/material";

const StaffMember = () => {
  const mainContent = useRef(null);
  const location = useLocation();
  const [isSidebarClosed, setIsSidebarClosed] = useState(false);
  const [isSidebarDisplay, setIsSidebarDisplay] = useState(true);
  const isMediumScreen = useMediaQuery("(max-width:767px)");

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    mainContent.current.scrollTop = 0;
  }, [location]);

  const baseUrl = process.env.REACT_APP_BASE_API;
  const [staffData, setStaffData] = useState(undefined);
  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        let response;   
        // const response = await AxiosInstance.get(
        //   `${baseUrl}/worker/get/${localStorage.getItem("worker_id")}`
        // );
        setStaffData(response?.data?.data?.permissions);
      } catch (error) {}
    };
    if (location.pathname.includes("/staff-member")) {
      fetchStaffData();
    }
  }, []);

  const [routesData, setRoutesData] = useState([]);
  useEffect(() => {
    if (staffData) {
      const filterRoutes = () => {
        const data = routes.filter(
          (item) => item.layout === "/staff-member" && item.isDisplay
        );
        const quotes =
          staffData?.Quotes &&
          Object.entries(staffData?.Quotes).every(([key, value]) => !value);
        const contract =
          staffData?.Contract &&
          Object.entries(staffData?.Contract).every(([key, value]) => !value);
        const invoice =
          staffData?.Invoice &&
          Object.entries(staffData?.Invoice).every(([key, value]) => !value);
        const schedule =
          staffData?.Schedule &&
          Object.entries(staffData?.Schedule).every(([key, value]) => !value);
        const appoinment =
          staffData?.Appoinment &&
          Object.entries(staffData?.Appoinment).every(([key, value]) => !value);

        const customer =
          staffData?.CustomersProperties &&
          Object.entries(staffData?.CustomersProperties).every(
            ([key, value]) => !value
          );

        const newRoutes = data.filter((item) => {
          if (item.path === "/WorkerQuotes" && !quotes) {
            return item;
          } else if (item.path === "/workercustomer" && !customer) {
            return item;
          } else if (item.path === "/WorkerSchedule" && !schedule) {
            return item;
          } else if (item.path === "/workercontract" && !contract) {
            return item;
          } else if (item.path === "/workerinvoice" && !invoice) {
            return item;
          } else if (item.path === "/WorkerAppoinments" && !appoinment) {
            return item;
          } else if (item.path === "/index") {
            return item;
          }
        });
        setRoutesData(newRoutes);
      };
      filterRoutes();
    }
  }, [staffData]);

  const getRoutes = (routes) => {
    return routes?.map((prop, key) => {
      if (prop.layout === "/staff-member" && !prop.isCollapse) {
        return (
          <Route path={prop.path} element={prop.component} key={key} exact />
        );
      } else {
        if (prop.children) {
          return prop.children?.map((item) => {
            return (
              <Route
                path={item.path}
                element={item.component}
                key={key}
                exact
              />
            );
          });
        }
      }
    });
  };

  return (
    <Grid
      style={{
        backgroundColor: "#fff",
        width: "100vw",
        height: "100vh",
        overflow: "auto",
      }}
    >
      <Sidebar
        layout="/staff-member"
        isSidebarClosed={isSidebarClosed}
        setIsSidebarClosed={setIsSidebarClosed}
        isSidebarDisplay={isSidebarDisplay}
        setIsSidebarDisplay={setIsSidebarDisplay}
        routesData={routesData}
      />

      <MainNav
        isSidebarDisplay={isSidebarDisplay}
        setIsSidebarDisplay={setIsSidebarDisplay}
        isSidebarClosed={isSidebarClosed}
      />
      <Grid
        className="main-content"
        style={{
          marginLeft: !isMediumScreen
            ? isSidebarClosed
              ? "150px"
              : "300px"
            : "15px",
        }}
        ref={mainContent}
      >
        <Grid style={{ width: "95%" }}>
          <Routes>
            {getRoutes(routes)}
            <Route
              path="*"
              element={<Navigate to="/staff-member/index" replace />}
            />
          </Routes>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default StaffMember;

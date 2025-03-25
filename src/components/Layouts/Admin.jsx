import React, { useEffect, useRef, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";
import routes from "../../routes";
import Sidebar from "../Sidebar";
import { MainNav } from "../MuiTable";
import { useMediaQuery } from "@mui/material";
import "./style.css";
import { Grid } from "@mui/material";
    
const Admin = () => {
  const mainContent = useRef(null);
  const { CompanyName } = useParams();
  const location = useLocation();
  const [isSidebarClosed, setIsSidebarClosed] = useState(false);
  const [isSidebarDisplay, setIsSidebarDisplay] = useState(true);
  const isMediumScreen = useMediaQuery("(max-width:767px)");

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    if (mainContent.current) {
      mainContent.current.scrollTop = 0;
    }
  }, [location]);
  
  const getRoutes = (routes) => {
    return routes?.map((prop, key) => {
      if (
        prop.layout === `/:CompanyName` || 
        prop.layout === `/${CompanyName}`
      ) {
        if (prop?.children) {
          return prop?.children?.map((item, index) => (
            <>
              <Route
                path={`${item?.path}`}
                element={item?.component}
                key={index}
              />
            </>
          ));
        } else {
          return <Route path={prop.path} element={prop?.component} key={key} />;
        }
      } else return null;
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
        layout={`/:CompanyName`}
        isSidebarClosed={isSidebarClosed}
        setIsSidebarClosed={setIsSidebarClosed}
        isSidebarDisplay={isSidebarDisplay}
        setIsSidebarDisplay={setIsSidebarDisplay}
      />
      <MainNav
        isSidebarClosed={isSidebarClosed}
        isSidebarDisplay={isSidebarDisplay}
        setIsSidebarDisplay={setIsSidebarDisplay}
      />
      <Grid
        className="main-content invoicePaidSlip "
        style={{
          marginLeft: !isMediumScreen
            ? isSidebarClosed
              ? "100px"
              : "260px"
            : "15px",
        }}
        ref={mainContent}
      >
        <Grid style={{ width: "98%" }} className="customerDetail_paid">
          <Routes>
            {getRoutes(routes)} 
            <Route
              path="*"
              element={<Navigate to={`/${CompanyName}/index`} replace />}
            />
          </Routes>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Admin;

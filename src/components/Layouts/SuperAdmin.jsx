import React, { useEffect, useRef, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import routes from "../../routes";
import Sidebar from "../Sidebar";
import { MainNav } from "../MuiTable";
import { useMediaQuery } from "@mui/material";
import { Grid } from "@mui/material";


const SuperAdmin = () => {
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
 
  const getRoutes = (routes) => {
    return routes?.map((prop, key) => {
      if (prop.layout === "/superadmin" && !prop.isCollapse) {
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
        layout="/superadmin"
        isSidebarClosed={isSidebarClosed}
        setIsSidebarClosed={setIsSidebarClosed}
        isSidebarDisplay={isSidebarDisplay}
        setIsSidebarDisplay={setIsSidebarDisplay}
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
              element={<Navigate to="/superadmin/index" replace />}
            />
          </Routes>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default SuperAdmin;

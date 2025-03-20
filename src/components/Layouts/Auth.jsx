import React, { useEffect, useRef } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import routes from "../../routes";
import { Grid } from "@mui/material";


const Auth = () => {
  const mainContent = useRef(null);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    mainContent.current.scrollTop = 0;
  }, [location]);

  const getRoutes = (routes) => {
    return routes?.map((prop, key) => {
      if (prop.layout === "/auth") {
        return (
          <Route path={prop.path} element={prop.component} key={key} exact />
        );
      } else {
        return null;
      }
    });
  };

  return (
    <Grid>
      <Grid className="main-content" ref={mainContent}>
        <Grid style={{ width: "100%" }}>
          <Routes>
            {getRoutes(routes)}
            <Route path="*" element={<Navigate to="/auth/login" replace />} />
          </Routes>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Auth;

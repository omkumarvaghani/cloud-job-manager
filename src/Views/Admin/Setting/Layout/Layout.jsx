// import React, { useEffect } from "react";
// import { useSelector } from "react-redux";
// import ColorPicker from "./ColorPicker";
// import SettingSidebar from "../../../../components/Setting/SettingSidebar";
// // import User from "./components/User";

// function Layout() {
//   const theme = useSelector((state) => state.theme.theme);
//   const customColors = useSelector((state) => state.theme.customColors);

//   // useEffect(() => {
//   //   document.body.className = theme === "light" ? "light-theme" : "dark-theme";
//   // }, [theme]);

//   return (
//     <Grid className="d-flex">
//       <Grid className=" col-2 h-100">
//         <SettingSidebar />
//       </Grid>
//       <Grid
//         style={{
//           backgroundColor: customColors.backgroundColor,
//           color: customColors.textColor,
//           height: "100vh",
//         }}
//       >
//         <h1>Theme and Custom Color Switcher</h1>
//         <ColorPicker />
//       </Grid>
//     </Grid>
//   );
// }

// export default Layout;

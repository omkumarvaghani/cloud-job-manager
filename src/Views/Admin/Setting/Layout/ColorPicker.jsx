// import React from "react";
// import { useDispatch } from "react-redux";
// import { setCustomColor } from "./themeActions";
// import { Grid } from "@mui/material";
// import { Row, Col } from "react-bootstrap"; 
// React Bootstrap components


// const ColorPicker = () => {
//   const dispatch = useDispatch();

//   const handleColorChange = (colorType) => (event) => {
//     const colorValue = event.target.value;
//     dispatch(setCustomColor(colorType, colorValue));
//   };

//   return (
//     <Grid>
//       <h3>Select Custom Colors:</h3>
//       <Grid style={{ marginBottom: "1rem" }}>
//         <label htmlFor="background-color-picker">Background Color:</label>
//         <input
//           id="background-color-picker"
//           type="color"
//           onChange={handleColorChange("backgroundColor")}
//           aria-label="Pick background color"
//           style={{ marginLeft: "1rem", cursor: "pointer" }}
//         />
//       </Grid>
//       <Grid>
//         <label htmlFor="text-color-picker">Text Color:</label>
//         <input
//           id="text-color-picker"
//           type="color"
//           onChange={handleColorChange("textColor")}
//           aria-label="Pick text color"
//           style={{ marginLeft: "1rem", cursor: "pointer" }}
//         />
//       </Grid>
//     </Grid>
//   );
// };

// export default ColorPicker;

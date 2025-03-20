// const initialState = {
//     theme: "light",
//     customColors: {
//       backgroundColor: "#ffffff",
//       textColor: "#000000",
//     },
//   };
  
//   const themeReducer = (state = initialState, action) => {
//     switch (action.type) {
//       case "CHANGE_THEME":
//         return { ...state, theme: action.payload }  ;
//       case "SET_CUSTOM_COLOR":
//         return {
//           ...state,
//           customColors: {
//             ...state.customColors,
//             [action.payload.colorType]: action.payload.colorValue,
//           },
//         };
//       default:
//         return state;
//     }
//   };
  
//   export default themeReducer;
  
// import React, { useState } from "react";
// import { postFile } from "../../../../components/Files/Functions";
// import {
//   Button,
//   Dialog,
//   DialogContent,
//   DialogTitle,
//   FormControl,
//   FormGroup,
//   Grid,
//   Typography,
//   DialogActions,
// } from "@mui/material";
// import { Form, Formik } from "formik";
// import InputDropdown from "../../../../components/InputFields/InputDropdown";
// import InputText from "../../../../components/InputFields/InputText";
// import AxiosInstance from "../../../AxiosInstance";
// import * as Yup from "yup";

// import BlueButton from "../../../../components/Button/BlueButton";
// import showToast from "../../../../components/Toast/Toster";
// import WhiteButton from "../../../../components/Button/WhiteButton";

// const AddItems = ({
//   modelOpen,
//   setModelOpen,
//   setSelectedProductAndService,
//   selectedProductAndService,
//   productsAndService,
//   setShowUnitsSection,
//   setShowHoursSection,
//   setSelectedUnitsAndHours,
//   showHoursSection,
//   showUnitsSection,
//   selectedProduct,
//   selectedUnitsAndHours,
//   UnitsAndHours,
//   selectedAdminId,
//   CompanyId,
//   getData,
//   showSquaresSection,
//   setShowSquaresSection,
//   inputValue,
//   handleSelectChange,
//   index,
//   setNew = false,
//   handleFileChange,
//   uploadFile,
//   file,
//   error,
//   closePreviewModal,
//   previewFile,
//   handleDragOver,
//   handleDrop,
//   handleFilePreview,
//   handleRemoveFile,
//   previewModalOpen
// }) => {
//   return (
//     <Dialog fullWidth open={modelOpen} onClose={() => setModelOpen(false)}>
//       <DialogTitle>{"Materials & Labor Form "}</DialogTitle>
//       <DialogContent dividers>
//         <Formik
//           initialValues={{
//             Type: selectedProduct ? selectedProduct.Type : "",
//             Name: selectedProduct
//               ? selectedProduct.Name
//               : inputValue
//               ? inputValue
//               : "",
//             Description: selectedProduct ? selectedProduct.Description : "",
//             Unit: selectedProduct ? selectedProduct.Unit : "",
//             CostPerUnit: selectedProduct ? selectedProduct.CostPerUnit : "",
//             Hour: selectedProduct ? selectedProduct.Hour : "",
//             CostPerHour: selectedProduct ? selectedProduct.CostPerHour : "",
//             Square: selectedProduct ? selectedProduct.Square : "",
//             CostPerSquare: selectedProduct ? selectedProduct.CostPerSquare : "",
//             Attachment: selectedProduct ? selectedProduct.Attachment : "",
//             UnitsAndHoursType: selectedProduct
//               ? selectedProduct.Unit && selectedProduct.CostPerUnit
//                 ? "Unit"
//                 : selectedProduct.Square && selectedProduct.CostPerSquare
//                 ? "Sq. Ft."
//                 : selectedProduct.Hour && selectedProduct.CostPerHour
//                 ? "Hour"
//                 : ""
//               : "",
//           }}
//           validationSchema={Yup.object().shape({
//             Type: Yup.string().required("Type is required"),
//             Name: Yup.string().required("Name is required"),
//             Description: Yup.string().required("Description is required"),
//             CostPerUnit:
//               showUnitsSection &&
//               Yup.number().required("Cost per Unit  required"),
//             CostPerHour:
//               showHoursSection &&
//               Yup.number().required("Cost per Hour required"),
//             CostPerSquare:
//               showSquaresSection &&
//               Yup.number().required("Cost per square foot required"),
//           })}
//           onSubmit={async (values, { resetForm }) => {
//             if (!values.UnitsAndHoursType) {
//               return;
//             }
//             try {
//               if (values.Attachment && typeof values.Attachment !== "string") {
//                 try {
//                   const uploadedFilePath = await uploadFile(values.Attachment);
//                   values["Attachment"] = uploadedFilePath;
//                 } catch (error) {
//                   console.error("Error uploading file:", error);
//                   showToast.error("Error uploading file.");
//                   return;
//                 }
//               }

//               values["companyId"] = CompanyId || " ";

//               const object = {
//                 Type: values.Type,
//                 Name: values.Name,
//                 Description: values.Description,
//                 Attachment: file,
//                 AddedAt : new Date(),
//                 companyId: CompanyId,
//                 ...(values.UnitsAndHoursType === "Unit"
//                   ? {
//                       CostPerUnit: values.CostPerUnit,
//                       Unit: values.Unit || 1,
//                       CostPerSquare: null,
//                       Square: null,
//                       CostPerHour: null,
//                       Hour: null,
//                     }
//                   : values.UnitsAndHoursType === "Sq. Ft."
//                   ? {
//                       CostPerSquare: values.CostPerSquare,
//                       Square: values.Square || 1,
//                       CostPerHour: null,
//                       Hour: null,
//                       CostPerUnit: null,
//                       Unit: null,
//                     }
//                   : {
//                       CostPerHour: values.CostPerHour,
//                       Hour: values.Hour || 1,
//                       CostPerUnit: null,
//                       Unit: null,
//                       CostPerSquare: null,
//                       Square: null,
//                     }),
//               };

//               let res;
//               if (!selectedProduct) {
//                 res = await AxiosInstance.post(`/product`, object);

//                 if (res.data.statusCode === 200) {
//                   if (setNew) {
//                     handleSelectChange(index, res.data.data);
//                   }
//                 }
//               } else {
//                 res = await AxiosInstance.put(
//                   `/product/product/${selectedAdminId}`,
//                   object
//                 );
//               }

//               if (res.data.statusCode === 200) {
//                 setModelOpen(false);
//                 getData();
//                 setSelectedUnitsAndHours("");
//                 setTimeout(() => {
//                   showToast.success(res.data.message);
//                 }, 500);
//                 resetForm(values);
//               } else if (res.data.statusCode === 201) {
//                 getData();
//                 setSelectedUnitsAndHours("");
//                 setTimeout(() => {
//                   showToast.error(res.data.message);
//                 }, 500);
//               } else {
//                 setTimeout(() => {
//                   showToast.error(
//                     res.data.message || "An unexpected error occurred"
//                   );
//                 }, 500);
//               }
//             } catch (error) {
//               console.error("Submission error:", error);
//               showToast.error(
//                 error.response?.data?.message ||
//                   error.message ||
//                   "An error occurred"
//               );
//             }
//           }}
//         >
//           {({
//             values,
//             errors,
//             touched,
//             handleBlur,
//             handleChange,
//             setFieldValue,
//           }) => (
//             <Form>
//               <Grid className="form-wrap">
//                 <FormControl fullWidth>
//                   <InputDropdown
//                     options={productsAndService}
//                     value={selectedProductAndService || null}
//                     onChange={(_, newValue) => {
//                       setSelectedProductAndService(newValue);
//                       handleChange({
//                         target: {
//                           name: "Type",
//                           value: newValue ? newValue.Type : "",
//                         },
//                       });
//                     }}
//                     label="Type"
//                     inputValue={values?.Type}
//                     onTextFieldChange={handleChange}
//                     name="Type"
//                     onBlur={handleBlur}
//                     type="text"
//                     getOptionLabel={(option) => option.Type || ""}
//                     filterOptions={(options, state) => {
//                       return options.filter((option) =>
//                         option.Type.toLowerCase().includes(
//                           state.inputValue.toLowerCase()
//                         )
//                       );
//                     }}
//                     error={touched?.Type && Boolean(errors?.Type)}
//                     helperText={touched?.Type && errors?.Type}
//                   />
//                 </FormControl>
//               </Grid>
//               <Grid>
//                 <InputText
//                   value={values.Name}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                   name="Name"
//                   label="Name"
//                   type="text"
//                   className="text-blue-color w-100 m-0 mb-4 productFormName"
//                   error={touched?.Name && Boolean(errors?.Name)}
//                   helperText={touched?.Name && errors?.Name}
//                 />
//               </Grid>
//               <Grid>
//                 <FormGroup>
//                   <InputText
//                     id="exampleText"
//                     placeholder="Description"
//                     name="Description"
//                     label="Description"
//                     type="textarea"
//                     value={values.Description}
//                     onBlur={handleBlur}
//                     onChange={handleChange}
//                     className="text-blue-color w-100 m-0 mb-4"
//                     style={{ marginTop: 0 }}
//                     error={touched?.Description && Boolean(errors?.Description)}
//                     helperText={touched?.Description && errors?.Description}
//                   />
//                 </FormGroup>
//               </Grid>
//               <Grid>
//                 <FormControl fullWidth required>
//                   <InputDropdown
//                     inputValue={values?.UnitsAndHoursType}
//                     onTextFieldChange={handleChange}
//                     options={UnitsAndHours}
//                     value={selectedUnitsAndHours || null}
//                     onChange={(_, newValue) => {
//                       setSelectedUnitsAndHours(newValue);
//                       setShowUnitsSection(newValue?.Type === "Unit");
//                       setShowHoursSection(newValue?.Type === "Hour");
//                       setShowSquaresSection(newValue?.Type === "Sq. Ft.");
//                       handleChange({
//                         target: {
//                           name: "UnitsAndHoursType",
//                           value: newValue ? newValue.Type : "",
//                         },
//                       });
//                     }}
//                     label="Cost Type"
//                     name="UnitsAndHoursType"
//                     getOptionLabel={(option) => option.Type || ""}
//                     filterOptions={(options, state) => {
//                       return options.filter((option) =>
//                         option.Type.toLowerCase().includes(
//                           state.inputValue.toLowerCase()
//                         )
//                       );
//                     }}
//                     error={
//                       touched?.UnitsAndHoursType &&
//                       (!selectedUnitsAndHours ||
//                         Boolean(errors?.UnitsAndHoursType))
//                     }
//                     helperText={
//                       touched?.UnitsAndHoursType && !selectedUnitsAndHours
//                         ? "This field is required"
//                         : touched?.UnitsAndHoursType &&
//                           errors?.UnitsAndHoursType
//                         ? errors.UnitsAndHoursType
//                         : ""
//                     }
//                   />
//                 </FormControl>
//               </Grid>

//               {showUnitsSection && (
//                 <Grid className="d-flex w-100 gap-2">
//                   <InputText
//                     value={values.CostPerUnit}
//                     onBlur={handleBlur}
//                     onChange={(e) => {
//                       const value = e.target.value;
//                       if (/^\d*\.?\d*$/.test(value)) {
//                         handleChange({
//                           target: {
//                             name: "CostPerUnit",
//                             value: Math.max(0, Number(value)),
//                           },
//                         });
//                       }
//                     }}
//                     name="CostPerUnit"
//                     placeholder="$0.00"
//                     label="Cost"
//                     type="number"
//                     className="w-100 accountInformationInputTop"
//                     error={touched?.CostPerUnit && Boolean(errors?.CostPerUnit)}
//                     helperText={touched?.CostPerUnit && errors?.CostPerUnit}
//                   />
//                 </Grid>
//               )}

//               {showHoursSection && (
//                 //2529 Sq. Ft. lable
//                 <Grid className="d-flex gap-2 w-100">
//                   <InputText
//                     value={values.CostPerHour}
//                     onBlur={handleBlur}
//                     onChange={(e) => {
//                       const value = e.target.value;
//                       // Allow only numeric values including decimals
//                       if (/^\d*\.?\d*$/.test(value)) {
//                         // Use your original handleChange logic
//                         handleChange({
//                           target: {
//                             name: "CostPerHour",
//                             value: Math.max(0, Number(value)),
//                           },
//                         });
//                       }
//                     }}
//                     name="CostPerHour"
//                     placeholder="$0.00"
//                     label="Cost"
//                     type="number"
//                     className="w-100 accountInformationInputTop"
//                     error={touched.CostPerHour && Boolean(errors.CostPerHour)}
//                     helperText={touched.CostPerHour && errors.CostPerHour}
//                   />
//                 </Grid>
//               )}
//               {showSquaresSection && (
//                 <Grid className="d-flex gap-2 w-100 ">
//                   <InputText
//                     value={values.CostPerSquare}
//                     onBlur={handleBlur}
//                     onChange={(e) => {
//                       const value = e.target.value;
//                       if (/^\d*\.?\d*$/.test(value)) {
//                         handleChange({
//                           target: {
//                             name: "CostPerSquare",
//                             value: Math.max(0, Number(value)),
//                           },
//                         });
//                       }
//                     }}
//                     name="CostPerSquare"
//                     placeholder="$0.00"
//                     label="Cost"
//                     type="number"
//                     className="w-100 accountInformationInputTop"
//                     error={
//                       touched.CostPerSquare && Boolean(errors.CostPerSquare)
//                     }
//                     helperText={touched.CostPerSquare && errors.CostPerSquare}
//                   />
//                 </Grid>
//               )}
//               {/* <Grid className="product-items-attach">
//                 <Grid
//                   className="file-upload"
//                   onDragOver={handleDragOver}
//                   onDrop={handleDrop}
//                   style={{
//                     borderRadius: "10px",
//                     padding: "20px",
//                     textAlign: "center",
//                     backgroundColor: "#f9f9f9",
//                   }}
//                 >
//                   <input
//                     type="file"
//                     id="file-input"
//                     style={{ display: "none" }}
//                     onChange={handleFileChange}
//                   />
//                   <label
//                     htmlFor="file-input"
//                     className="text-blue-color"
//                     style={{
//                       cursor: "pointer",
//                       display: "block",
//                       padding: "13px",
//                       borderRadius: "10px",
//                       textAlign: "center",
//                     }}
//                   >
//                     <span className="mb-2">Add Receipt</span>
//                     <br /> or drag an image here to upload
//                   </label>
//                 </Grid>
//                 {file && (
//                   <Grid
//                     style={{
//                       marginTop: "15px",
//                       padding: "10px",
//                       border: "1px solid #ccc",
//                       borderRadius: "10px",
//                       backgroundColor: "#fff",
//                       display: "flex",
//                       justifyContent: "space-between",
//                       alignItems: "center",
//                       overflow: "hidden",
//                       overflowX: "auto",
//                       scrollbarWidth: "thin",
//                     }}
//                   >
//                     <Typography style={{ margin: 0 }}>
//                       <strong className="text-blue-color">
//                         Selected File:
//                       </strong>{" "}
//                       <a
//                         onClick={() => handleFilePreview(file)}
//                         style={{
//                           textDecoration: "none",
//                           color: "#e88c44",
//                           cursor: "pointer",
//                         }}
//                       >
//                         {file.split("/").pop()}
//                       </a>
//                     </Typography>
//                     <button
//                       onClick={handleRemoveFile}
//                       style={{
//                         border: "none",
//                         background: "none",
//                         cursor: "pointer",
//                         fontSize: "20px",
//                         color: "red",
//                         marginLeft: "10px",
//                       }}
//                     >
//                       &times;
//                     </button>
//                   </Grid>
//                 )}
//                 <Dialog
//                   open={previewModalOpen}
//                   onClose={closePreviewModal}
//                   fullWidth
//                   maxWidth="md"
//                 >
//                   <DialogTitle>
//                     <Typography className="text-blue-color">
//                       File Preview
//                     </Typography>
//                   </DialogTitle>
//                   <DialogContent style={{ textAlign: "center" }}>
//                     {previewFile?.endsWith(".pdf") ? (
//                       <iframe
//                         src={previewFile}
//                         style={{ width: "100%", height: "600px" }}
//                         title="File Preview"
//                       />
//                     ) : (
//                       <img
//                         src={previewFile}
//                         alt="Preview"
//                         style={{
//                           maxWidth: "100%",
//                           maxHeight: "600px",
//                           borderRadius: "10px",
//                         }}
//                       />
//                     )}
//                   </DialogContent>
//                   <DialogActions>
//                     <Button
//                       onClick={closePreviewModal}
//                       className="bg-blue-color"
//                     >
//                       Close
//                     </Button>
//                   </DialogActions>
//                 </Dialog>

//                 {error && (
//                   <Grid style={{ color: "red", marginTop: "10px" }}>
//                     {error}
//                   </Grid>
//                 )}
//               </Grid> */}
//               <Grid className="product-items-attach">
//   <Grid
//     className="file-upload"
//     onDragOver={handleDragOver}
//     onDrop={handleDrop}
//     style={{
//       borderRadius: "10px",
//       padding: "20px",
//       textAlign: "center",
//       backgroundColor: "#f9f9f9",
//     }}
//   >
//     <input
//       type="file"
//       id="file-input"
//       style={{ display: "none" }}
//       onChange={handleFileChange}
//       accept=".pdf,.jpg,.jpeg,.png,.webp,.xls,.xlsx,.doc,.docx"
//     />
//     <label
//       htmlFor="file-input"
//       className="text-blue-color"
//       style={{
//         cursor: "pointer",
//         display: "block",
//         padding: "13px",
//         borderRadius: "10px",
//         textAlign: "center",
//       }}
//     >
//       <span className="mb-2">Add Receipt</span>
//       <br /> or drag an image here to upload
//     </label>
//   </Grid>
//   {file && (
//     <Grid
//       style={{
//         marginTop: "15px",
//         padding: "10px",
//         border: "1px solid #ccc",
//         borderRadius: "10px",
//         backgroundColor: "#fff",
//         display: "flex",
//         justifyContent: "space-between",
//         alignItems: "center",
//         overflow: "hidden",
//         overflowX: "auto",
//         scrollbarWidth: "thin",
//       }}
//     >
//       <Typography style={{ margin: 0 }}>
//         <strong className="text-blue-color">Selected File:</strong>{" "}
//         <a
//           onClick={() => handleFilePreview(file)}
//           style={{
//             textDecoration: "none",
//             color: "#e88c44",
//             cursor: "pointer",
//           }}
//         >
//           {file.name}
//         </a>
//       </Typography>
//       <button
//         onClick={handleRemoveFile}
//         style={{
//           border: "none",
//           background: "none",
//           cursor: "pointer",
//           fontSize: "20px",
//           color: "red",
//           marginLeft: "10px",
//         }}
//       >
//         &times;
//       </button>
//     </Grid>
//   )}
//   <Dialog
//     open={previewModalOpen}
//     onClose={closePreviewModal}
//     fullWidth
//     maxWidth="md"
//   >
//     <DialogTitle>
//       <Typography className="text-blue-color">File Preview</Typography>
//     </DialogTitle>
//     <DialogContent style={{ textAlign: "center" }}>
//       {previewFile?.endsWith(".pdf") ? (
//         <iframe
//           src={previewFile}
//           style={{ width: "100%", height: "600px" }}
//           title="File Preview"
//         />
//       ) : (
//         <img
//           src={previewFile}
//           alt="Preview"
//           style={{
//             maxWidth: "100%",
//             maxHeight: "600px",
//             borderRadius: "10px",
//           }}
//         />
//       )}
//     </DialogContent>
//     <DialogActions>
//       <Button onClick={closePreviewModal} className="bg-blue-color">
//         Close
//       </Button>
//     </DialogActions>
//   </Dialog>
//   {error && (
//     <Grid style={{ color: "red", marginTop: "10px" }}>{error}</Grid>
//   )}
// </Grid>

//               {/* <DisplayImage
//                 files={!values.Attachment ? [] : [values.Attachment]}
//                 setFiles={(value) => setFieldValue("Attachment", value[0])}
//                 IsDeleted={true}
//               /> */}
//               <Grid className="d-flex gap-2 mt-4 justify-content-between">
//                 <WhiteButton
//                   className="mt-3 text-blue-color border-blue-color"
//                   onClick={() => setModelOpen(false)}
//                   label="Cancel"
//                 />
//                 <BlueButton label={selectedProduct ? "Update" : "Add"} />
//               </Grid>
//             </Form>
//           )}
//         </Formik>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default AddItems;

import React, { useState } from "react";
import { postFile } from "../../../../components/Files/Functions";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormGroup,
  Grid,
  Typography,
  DialogActions,
} from "@mui/material";
import { Form, Formik } from "formik";
import InputDropdown from "../../../../components/InputFields/InputDropdown";
import InputText from "../../../../components/InputFields/InputText";
import AxiosInstance from "../../../AxiosInstance";
import * as Yup from "yup";
import DollerInput from "../../../../components/InputFields/Doller";
import BlueButton from "../../../../components/Button/BlueButton";
import showToast from "../../../../components/Toast/Toster";
import WhiteButton from "../../../../components/Button/WhiteButton";

import { WhiteLoaderComponent } from "../../../../components/Icon/Index";

const AddItems = ({
  modelOpen,
  setModelOpen,
  setSelectedProductAndService,
  selectedProductAndService,
  productsAndService,
  setShowUnitsSection,
  setShowHoursSection,
  setSelectedUnitsAndHours,
  showHoursSection,
  showUnitsSection,
  selectedProduct,
  selectedUnitsAndHours,
  UnitsAndHours,
  selectedAdminId,
  CompanyId,
  getData,
  showSquaresSection,
  setShowSquaresSection,
  inputValue,
  handleSelectChange,
  index,
  setNew = false,
  handleFileChange,
  uploadFile,
  file,
  error,
  closePreviewModal,
  previewFile,
  handleDragOver,
  handleDrop,
  handleFilePreview,
  handleRemoveFile,
  previewModalOpen,
  setShowFixedSection,
  showFixedSection,
  setLineItems,
  setInputValue,
  setSearchInput
}) => {
  const [loading, setLoading] = useState(false);
  return (
    <Dialog
      fullWidth
      open={modelOpen}
      onClose={() => {
        handleRemoveFile();
        setModelOpen(false);
      }}
    >
      <DialogTitle className="text-blue-color borerBommoModel">
        {"Materials & Labor Form "}
      </DialogTitle>
      <DialogContent dividers>
        <Formik
          initialValues={{
            Type: selectedProduct ? selectedProduct.Type : "",
            Name: selectedProduct
              ? selectedProduct.Name
              : inputValue
              ? inputValue
              : "",
            Description: selectedProduct ? selectedProduct?.Description : "",
            Unit: selectedProduct ? selectedProduct.Unit : "",
            Fixed: selectedProduct ? selectedProduct.Fixed : "",
            CostPerFixed: selectedProduct ? selectedProduct?.CostPerFixed : "",
            CostPerUnit: selectedProduct ? selectedProduct?.CostPerUnit : "",
            Hourly: selectedProduct ? selectedProduct.Hourly : "",
            CostPerHour: selectedProduct ? selectedProduct?.CostPerHour : "",
            Square: selectedProduct ? selectedProduct.Square : "",
            CostPerSquare: selectedProduct
              ? selectedProduct?.CostPerSquare
              : "",
            Attachment: selectedProduct ? selectedProduct?.Attachment : "",
            UnitsAndHoursType: selectedProduct
              ? selectedProduct?.Unit && selectedProduct?.CostPerUnit
                ? "Unit"
                : selectedProduct?.Square && selectedProduct?.CostPerSquare
                ? "Sq. Ft."
                : selectedProduct?.Hourly && selectedProduct?.CostPerHour
                ? "Hourly"
                : selectedProduct?.Fixed && selectedProduct?.CostPerFixed
                ? "Fixed"
                : ""
              : "",
          }}
          validationSchema={Yup.object().shape({
            Type: Yup.string().required("Type is required"),
            Name: Yup.string().required("Name is required"),
            Description: Yup.string().required("Description is required"),
            CostPerUnit:
              showUnitsSection &&
              Yup.number().required("Cost per Unit  required"),
            CostPerFixed:
              showFixedSection &&
              Yup.number().required("Cost per Fixed  required"),
            CostPerHour:
              showHoursSection &&
              Yup.number().required("Cost per Hourly required"),
            CostPerSquare:
              showSquaresSection &&
              Yup.number().required("Cost per square foot required"),
          })}
          onSubmit={async (values, { resetForm }) => {
            if (!values?.UnitsAndHoursType) {
              return;
            }

            setLoading(true);

            try {
              if (
                values?.Attachment &&
                typeof values?.Attachment !== "string"
              ) {
                try {
                  const uploadedFilePath = await uploadFile(values?.Attachment);
                  values["Attachment"] = uploadedFilePath;
                } catch (error) {
                  console.error("Error uploading file:", error);
                  showToast.error("Error uploading file.");
                  setLoading(false); // Ensure loading is reset on error
                  return;
                }
              }

              values["companyId"] = CompanyId || " ";

              const object = {
                Type: values?.Type,
                Name: values?.Name,
                Description: values?.Description,
                Attachment: values?.Attachment,
                AddedAt: new Date(),
                companyId: CompanyId,
                ...(values?.UnitsAndHoursType === "Unit"
                  ? {
                      CostPerUnit: values?.CostPerUnit,
                      Unit: values?.Unit || 1,
                      CostPerFixed: null,
                      Fixed: null,
                      CostPerSquare: null,
                      Square: null,
                      CostPerHour: null,
                      Hourly: null,
                    }
                  : values?.UnitsAndHoursType === "Sq. Ft."
                  ? {
                      CostPerSquare: values?.CostPerSquare,
                      Square: values?.Square || 1,
                      CostPerHour: null,
                      Hourly: null,
                      CostPerUnit: null,
                      Unit: null,
                      CostPerFixed: null,
                      Fixed: null,
                    }
                  : values?.UnitsAndHoursType === "Fixed"
                  ? {
                      CostPerSquare: null,
                      Square: null,
                      CostPerHour: null,
                      Hourly: null,
                      CostPerUnit: null,
                      Unit: null,
                      CostPerFixed: values?.CostPerFixed,
                      Fixed: values?.Fixed || 1,
                    }
                  : {
                      CostPerHour: values?.CostPerHour,
                      Hourly: values?.Hourly || 1,
                      CostPerUnit: null,
                      Unit: null,
                      CostPerSquare: null,
                      Square: null,
                      CostPerFixed: null,
                      Fixed: null,
                    }),
              };

              let res;
              if (!selectedProduct) {
                res = await AxiosInstance.post(`/materialslabor`, object);
                if (res?.data?.statusCode === 200) {
                  if (setNew) {
                    handleSelectChange(index, res?.data?.data);
                  }
                }

              } else {
                res = await AxiosInstance.put(
                  `/materialslabor/product/${selectedAdminId}`,
                  object
                );
              }

              if (res?.data?.statusCode === 200) {
                setModelOpen(false);
                getData();
                setSelectedUnitsAndHours("");
                setTimeout(() => {
                  showToast.success(res?.data?.message);
                }, 500);
                resetForm(values);
                handleRemoveFile();
                setInputValue("");
                setSearchInput("");
              } else if (res?.data?.statusCode === 201) {
                getData();
                setSelectedUnitsAndHours("");
                setTimeout(() => {
                  showToast.error(res?.data?.message);
                }, 500);
              } else {
                setTimeout(() => {
                  showToast.error(
                    res?.data?.message || "An unexpected error occurred"
                  );
                }, 500);
              }
            } catch (error) {
              console.error("Submission error:", error);
              showToast.error(
                error?.response?.data?.message ||
                  error?.message ||
                  "An error occurred"
              );
            } finally {
              setLoading(false);
            }
          }}
        >
          {({
            values,
            errors,
            touched,
            handleBlur,
            handleChange,
            setFieldValue,
          }) => (
            <Form>
              <Grid className="form-wrap">
                <FormControl fullWidth>
                  <InputDropdown
                    options={productsAndService}
                    value={selectedProductAndService || null}
                    onChange={(_, newValue) => {
                      setSelectedProductAndService(newValue);
                      setSelectedUnitsAndHours(null);
                      setShowFixedSection(null);
                      setShowSquaresSection(null);
                      setShowHoursSection(null);
                      setShowUnitsSection(null);
                      handleChange({
                        target: {
                          name: "Type",
                          value: newValue ? newValue?.Type : "",
                        },
                      });
                    }}
                    label="Type"
                    inputValue={values?.Type}
                    onTextFieldChange={handleChange}
                    name="Type"
                    onBlur={handleBlur}
                    type="text"
                    getOptionLabel={(option) => option?.Type || ""}
                    filterOptions={(options, state) => {
                      return options?.filter((option) =>
                        option?.Type?.toLowerCase().includes(
                          state?.inputValue?.toLowerCase()
                        )
                      );
                    }}
                    error={touched?.Type && Boolean(errors?.Type)}
                    helperText={touched?.Type && errors?.Type}
                  />
                </FormControl>
              </Grid>
              <Grid>
                <InputText
                  value={values?.Name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="Name"
                  label="Name"
                  type="text"
                  className="text-blue-color w-100 m-0 mb-4 productFormName"
                  error={touched?.Name && Boolean(errors?.Name)}
                  helperText={touched?.Name && errors?.Name}
                />
              </Grid>
              <Grid>
                <FormGroup>
                  <InputText
                    id="exampleText"
                    placeholder="Enter description"
                    name="Description"
                    label="Description"
                    type="textarea"
                    value={values?.Description}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    className="text-blue-color w-100 m-0 mb-4"
                    style={{ marginTop: 0 }}
                    error={touched?.Description && Boolean(errors?.Description)}
                    helperText={touched?.Description && errors?.Description}
                  />
                </FormGroup>
              </Grid>
              <Grid>
                <FormControl fullWidth required>
                  <InputDropdown
                    inputValue={values?.UnitsAndHoursType}
                    onTextFieldChange={handleChange}
                    options={UnitsAndHours}
                    value={selectedUnitsAndHours || null}
                    onChange={(_, newValue) => {
                      setSelectedUnitsAndHours(newValue);
                      setShowUnitsSection(newValue?.Type === "Unit");
                      setShowHoursSection(newValue?.Type === "Hourly");
                      setShowSquaresSection(newValue?.Type === "Sq. Ft.");
                      setShowFixedSection(newValue?.Type === "Fixed");
                      handleChange({
                        target: {
                          name: "UnitsAndHoursType",
                          value: newValue ? newValue.Type : "",
                        },
                      });
                    }}
                    label="Cost Type"
                    name="UnitsAndHoursType"
                    getOptionLabel={(option) => option.Type || ""}
                    filterOptions={(options, state) => {
                      return options?.filter((option) =>
                        option?.Type?.toLowerCase().includes(
                          state.inputValue?.toLowerCase()
                        )
                      );
                    }}
                    error={
                      touched?.UnitsAndHoursType &&
                      (!selectedUnitsAndHours ||
                        Boolean(errors?.UnitsAndHoursType))
                    }
                    helperText={
                      touched?.UnitsAndHoursType && !selectedUnitsAndHours
                        ? "This field is required"
                        : touched?.UnitsAndHoursType &&
                          errors?.UnitsAndHoursType
                        ? errors?.UnitsAndHoursType
                        : ""
                    }
                  />
                </FormControl>
              </Grid>
              {showUnitsSection && (
                <Grid className="d-flex w-100 gap-2">
                  <DollerInput
                    value={values?.CostPerUnit}
                    onBlur={handleBlur}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*\.?\d*$/.test(value)) {
                        handleChange({
                          target: {
                            name: "CostPerUnit",
                            value: Math.max(0, Number(value)),
                          },
                        });
                      }
                    }}
                    name="CostPerUnit"
                    placeholder="Enter Unit"
                    label="Cost"
                    type="number"
                    className="w-100 accountInformationInputTop"
                    error={touched?.CostPerUnit && Boolean(errors?.CostPerUnit)}
                    helperText={touched?.CostPerUnit && errors?.CostPerUnit}
                  />
                </Grid>
              )}

              {showHoursSection && (
                <Grid className="d-flex gap-2 w-100">
                  <DollerInput
                    value={values?.CostPerHour}
                    onBlur={handleBlur}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*\.?\d*$/.test(value)) {
                        handleChange({
                          target: {
                            name: "CostPerHour",
                            value: Math.max(0, Number(value)),
                          },
                        });
                      }
                    }}
                    name="CostPerHour"
                    placeholder="Enter Hour"
                    label="Cost"
                    type="number"
                    className="w-100 accountInformationInputTop"
                    error={touched?.CostPerHour && Boolean(errors?.CostPerHour)}
                    helperText={touched?.CostPerHour && errors?.CostPerHour}
                  />
                </Grid>
              )}
              {showSquaresSection && (
                <Grid className="d-flex gap-2 w-100 ">
                  <DollerInput
                    value={values?.CostPerSquare}
                    onBlur={handleBlur}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*\.?\d*$/.test(value)) {
                        handleChange({
                          target: {
                            name: "CostPerSquare",
                            value: Math?.max(0, Number(value)),
                          },
                        });
                      }
                    }}
                    name="CostPerSquare"
                    placeholder="Enter Square"
                    label="Cost"
                    type="number"
                    className="w-100 accountInformationInputTop"
                    error={
                      touched?.CostPerSquare && Boolean(errors?.CostPerSquare)
                    }
                    helperText={touched?.CostPerSquare && errors?.CostPerSquare}
                  />
                </Grid>
              )}
              {showFixedSection && (
                <Grid className="d-flex gap-2 w-100 ">
                  <DollerInput
                    value={values?.CostPerFixed}
                    onBlur={handleBlur}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*\.?\d*$/.test(value)) {
                        handleChange({
                          target: {
                            name: "CostPerFixed",
                            value: Math?.max(0, Number(value)),
                          },
                        });
                      }
                    }}
                    name="CostPerFixed"
                    placeholder="Enter Fixed"
                    label="Cost"
                    type="number"
                    className="w-100 accountInformationInputTop"
                    error={
                      touched?.CostPerFixed && Boolean(errors?.CostPerFixed)
                    }
                    helperText={touched?.CostPerFixed && errors?.CostPerFixed}
                  />
                </Grid>
              )}

              <Grid className="product-items-attach">
                <Grid
                  className="file-upload"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  style={{
                    borderRadius: "10px",
                    padding: "20px",
                    textAlign: "center",
                    backgroundColor: "#f9f9f9",
                    marginTop: "10px",
                  }}
                >
                  <input
                    type="file"
                    id="file-input"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png"
                  />
                  <label
                    htmlFor="file-input"
                    className="text-blue-color"
                    style={{
                      cursor: "pointer",
                      display: "block",
                      // padding: "13px",
                      borderRadius: "10px",
                      textAlign: "center",
                    }}
                  >
                    <span className="mb-2">Add Receipt</span>
                    <br /> or drag an image here to upload
                  </label>
                </Grid>
                {file && (
                  <Grid
                    style={{
                      marginTop: "15px",
                      padding: "10px",
                      border: "1px solid #ccc",
                      borderRadius: "10px",
                      backgroundColor: "#fff",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      overflow: "hidden",
                      overflowX: "auto",
                      scrollbarWidth: "thin",
                    }}
                  >
                    <Typography style={{ margin: 0 }}>
                      <strong className="text-blue-color">
                        Selected File:
                      </strong>{" "}
                      <a
                        onClick={() => handleFilePreview(file)}
                        style={{
                          textDecoration: "none",
                          color: "#e88c44",
                          cursor: "pointer",
                        }}
                      >
                        {file.split("/").pop()}
                      </a>
                    </Typography>
                    <button
                      onClick={handleRemoveFile}
                      style={{
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        fontSize: "20px",
                        color: "red",
                        marginLeft: "10px",
                      }}
                    >
                      &times;
                    </button>
                  </Grid>
                )}
                <Dialog
                  open={previewModalOpen}
                  onClose={closePreviewModal}
                  fullWidth
                  maxWidth="sm"
                >
                  <DialogTitle>
                    <Typography className="text-blue-borerBommoModel ">
                      File Preview
                    </Typography>
                  </DialogTitle>
                  <DialogContent style={{ textAlign: "center" }}>
                    {previewFile?.endsWith(".pdf") ? (
                      <iframe
                        src={previewFile}
                        style={{ width: "100%", height: "600px" }}
                        title="File Preview"
                      />
                    ) : (
                      <img
                        src={previewFile}
                        alt="Preview"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "600px",
                          borderRadius: "10px",
                        }}
                      />
                    )}
                  </DialogContent>
                  <DialogActions>
                    <Button
                      onClick={closePreviewModal}
                      className="bg-blue-color text-white"
                    >
                      Close
                    </Button>
                  </DialogActions>
                </Dialog>

                {error && (
                  <Grid style={{ color: "red", marginTop: "10px" }}>
                    {error}
                  </Grid>
                )}
              </Grid>
              <Grid className="d-flex gap-2 mt-4 justify-content-between productBtnNavigate">
                <WhiteButton
                  className="mt-3 text-blue-color border-blue-color"
                  onClick={() => {
                    handleRemoveFile();
                    setModelOpen(false);
                    setSelectedUnitsAndHours("");
                  }}
                  label="Cancel"
                />
                <BlueButton
                  label={
                    loading ? (
                      <WhiteLoaderComponent
                        height="20"
                        width="20"
                        padding="20"
                        loader={loading}
                      />
                    ) : selectedProduct ? (
                      "Update"
                    ) : (
                      "Add"
                    )
                  }
                  className="addProdyuctBtn"
                  disabled={loading} // Button disabled hoga jab loading true ho
                  // onClick={() => {
                  //   if (!loading) {
                  //     // Your click handler logic here
                  //     setLoading(true); // Set loading to true on click
                  //     // Perform your add/update operation
                  //     // After operation is complete, set loading to false
                  //     // setLoading(false);
                  //   }
                  // }}
                />
              </Grid>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};
export default AddItems;

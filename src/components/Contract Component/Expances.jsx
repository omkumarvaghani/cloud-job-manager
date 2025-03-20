import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Typography,
  Grid,
} from "@mui/material";
import dayjs from "dayjs";

import { Button, Card, Col, Input, Label } from "reactstrap";
import { Country, State, City } from "country-state-city";
import { useFormik } from "formik";
import * as Yup from "yup";
// import "./style.scss";
import AxiosInstance from "../../Views/AxiosInstance";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import InputText from "../InputFields/InputText";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import InputDropdown from "../InputFields/InputDropdown";
import showToast from "../Toast/Toster";
import WhiteButton from "../Button/WhiteButton";
import BlueButton from "../Button/BlueButton";
import { WhiteLoaderComponent } from "../Icon/Index";
import { Navigate, useHref, useLocation } from "react-router-dom";
import { handleAuth } from "../Login/Auth";
import DollerInput from "../InputFields/Doller";

// 2529 CompanyId get
const Expances = ({
  open,
  setOpen,
  data,
  ContractId,
  fetchData,
  CompanyId,
  ExpenseId,
  setExpenseId,
}) => {
  const baseUrl = process.env.REACT_APP_BASE_API;
  const [selectedPerson, setselectedPerson] = useState(null);
  const cdnUrl = process.env.REACT_APP_CDN_API;
  const cdnShowUrl = `${cdnUrl}/upload`;

  const fetchExpanceData = async () => {
    try {
      if (!ExpenseId || !ContractId) {
        console.error("ExpenseId or ContractId is missing!");
        return;
      }
      const expenseRes = await AxiosInstance.get(
        `/expenses/expenses/${ExpenseId}/${ContractId}`
      );
      formik.setValues({
        ItemName: expenseRes?.data?.data?.ItemName,
        Description: expenseRes?.data?.data?.Description,
        Date: expenseRes?.data?.data?.Date,
        Total: expenseRes?.data?.data?.Total,
        Attachment: expenseRes?.data?.data?.Attachment,
        WorkerId: expenseRes?.data?.data?.WorkerId,
        ContractId: expenseRes?.data?.data?.ContractId,
      });
      const person = teamData.find(
        (teamMember) =>
          teamMember?.WorkerId === expenseRes?.data?.data?.WorkerId
      );
      setselectedPerson(person || null);
      if (expenseRes?.data?.data?.Attachment) {
        setFile(expenseRes?.data?.data?.Attachment);
      } else {
        setFile("");
      }
    } catch (error) {
      console.error("Error: ", error?.message);
    }
  };

  useEffect(() => {
    fetchExpanceData();
  }, [ExpenseId]);
  const formik = useFormik({
    initialValues: {
      ItemName: "",
      AccountingCode: "",
      WorkerId: "",
      ContractId: "",
      Description: "",
      Date: dayjs(),
      Total: "",
      Attachment: "",
      ReimburseTo: "",
    },
    validationSchema: Yup.object({
      ItemName: Yup.string().required("Item Name is required"),
      Date: Yup.string().required("Date is required"),
      Total: Yup.string().required("Total is required"),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const CompanyId =
          localStorage.getItem("CompanyId") || tokenDecode?.companyId;

        values["ContractId"] = ContractId;
        values["CompanyId"] = CompanyId;
        values["Attachment"] = file;

        values["id"] = ExpenseId;

        const response = await AxiosInstance[values?.id ? "put" : "post"](
          `${baseUrl}/expenses${
            values?.id ? `/${values?.id}/${values?.ContractId}` : ""
          }`,
          values
        );

        if (response?.data?.statusCode === 200) {
          showToast.success(response?.data?.message);
          setOpen(false);
          fetchData();
        } else {
          showToast.error(response?.data?.message);
        }
      } catch (error) {
        if (error?.response?.status === 400) {
          const errorMessages = error?.response?.data?.errors || [];
          errorMessages.forEach((message) => {
            const fieldName = message.split(" ")[0];
            const userFriendlyFieldName =
              fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
            showToast.warning(`${userFriendlyFieldName}: ${message}`);
            formik.setFieldError(fieldName, message);
          });
        } else {
          console.error("Error: ", error);
          showToast.error("An error occurred while submitting the form.");
        }
      } finally {
        setLoading(false);
      }

      formik.resetForm();
      handleRemoveFile();
      setExpenseId("");
      setselectedPerson(null);
      setOpen({ isOpen: false, propertyData: null });
    },
  });
  useEffect(() => {
    if (open?.propertyData) {
      formik.setValues(open?.propertyData);
      if (open?.propertyData?.Attachment) {
        setFile(open?.propertyData?.Attachment);
      } else {
        setFile("");
      }
    } else {
      formik.resetForm();
      handleRemoveFile();
    }
  }, [open?.propertyData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "Country") {
      formik.setFieldValue(name, value.name);
    } else {
      formik.setFieldValue(name, type === "checkbox" ? checked : value);
    }
  };

  // const [selectedPerson, setselectedPerson] = useState(null);
  const [teamData, setTeamData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tokenDecode, setTokenDecode] = useState({});
  const location = useLocation();
  const fetchDatas = async () => {
    try {
      const res = await handleAuth(Navigate, location);
      setTokenDecode(res?.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchDatas();
  }, []);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        const companyId =
          localStorage?.getItem("CompanyId") || tokenDecode?.companyId;

        if (!companyId) {
          console.error(
            "CompanyId is not found in localStorage or tokenDecode."
          );
          return;
        }

        const response = await AxiosInstance.get(`/worker/${companyId}`);
        if (response?.status === 200) {
          setTeamData(response?.data?.data);
        } else {
          console.error("Error fetching team data:", response);
        }
      } catch (error) {
        console.error("Error fetching team data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [tokenDecode]);
  //2529 CompanyId
  const [file, setFile] = useState();
  const [error, setError] = useState("");
  const [imageLoader, setImageLoader] = useState(false);

  // const allowedFileTypes = ["image/jpeg", "image/png", "application/pdf"];

  // const handleFileChange = (event) => {
  //   const selectedFile = event.target.files[0];
  //   if (selectedFile) {
  //     if (allowedFileTypes.includes(selectedFile.type)) {
  //       uploadImage(selectedFile);
  //     } else {
  //       setError(
  //         "Unsupported file type. Please upload a JPEG, PNG, or PDF file."
  //       );
  //       setFile(null);
  //     }
  //   }
  // };

  const uploadImage = async (file) => {
    setImageLoader(true);
    try {
      // setLoading(true);
      const formData = new FormData();
      formData.append("files", file);

      const response = await AxiosInstance.post(`${cdnUrl}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response?.data?.files?.length > 0) {
        const imagePath = response?.data?.files[0]?.filename;
        setFile(imagePath);
        setError("");
      } else {
        throw new Error("No file returned from CDN.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("There was an issue uploading the file. Please try again.");
      setFile(null);
    } finally {
      // setLoading(false);
      setImageLoader(false);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event?.dataTransfer?.files[0];
    if (droppedFile) {
      if (allowedFileTypes?.includes(droppedFile?.type)) {
        uploadImage(droppedFile);
      } else {
        setError(
          "Unsupported file type. Please upload a PDF, JPEG, or PNG file."
        );
        setFile(null);
        setFile("");
      }
    }
  };
  const handleRemoveFile = () => {
    setFile(null);
    setFile("");
    setError("");
  };

  const allowedFileTypes = [
    "image/jpeg",
    "image/png",
    // "image/webp",
    // "application/pdf",
    // "application/msword",
    // "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  // const handleFileChange = (event) => {
  //   const file = event?.target?.files[0];
  //   if (!file) return;

  //   if (allowedFileTypes.includes(file.type)) {
  //     setFile(file?.name);
  //     setError("");
  //   } else {
  //     setFile(null);
  //     setError("Invalid file type. Please upload a valid file.");
  //   }
  // };
  const handleFileChange = (event) => {
    const selectedFile = event?.target?.files[0];
    if (selectedFile) {
      if (allowedFileTypes?.includes(selectedFile?.type)) {
        uploadImage(selectedFile);
      } else {
        setError("Unsupported file type. Please upload a JPEG, PNG, file.");
        setFile(null);
      }
    }
  };

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const handleFilePreview = (filePath) => {
    if (!filePath) {
      console.error("No file to preview");
      return;
    }
    const fullPath = `${cdnShowUrl}/${filePath}`;
    setPreviewFile(fullPath);
    setPreviewModalOpen(true);
  };

  const closePreviewModal = () => {
    setPreviewFile(null);
    setPreviewModalOpen(false);
  };
  const handleDialogClose = () => {
    formik.resetForm();
    setExpenseId("");
    setselectedPerson(null);
    setFile("");
    setOpen({ isOpen: false, propertyData: null });
  };

  return (
    <Dialog
      fullWidth
      open={open?.isOpen}
      onClose={handleDialogClose}
      // onClose={() => setOpen({ isOpen: false, propertyData: null })}
      className="client"
    >
      <DialogTitle className="borerBommoModel">
        <Grid className=" d-flex justify-content-start align-items-center">
          <h4
            className="text-blue-color text-property"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "42px",
              margin: "0 10px",
              fontWeight: "bold",
              fontSize: "18px",
            }}
          >
            New Time Expense
          </h4>
        </Grid>
      </DialogTitle>
      <Divider
        style={{ height: "1px", backgroundColor: "rgba(42, 79, 97, 0.8)" }}
      />
      <DialogContent>
        <form onSubmit={formik?.handleSubmit}>
          <Grid className="mb-2">
            <Grid>
              <InputText
                value={formik?.values?.ItemName}
                onChange={handleChange}
                onBlur={formik?.handleBlur}
                error={
                  formik?.touched?.ItemName && Boolean(formik?.errors?.ItemName)
                }
                helperText={
                  formik?.touched?.ItemName && formik?.errors.ItemName
                }
                name="ItemName"
                placeholder="Enter item name"
                label="Item Name"
                type="text"
                className="text-blue-color w-100 mb-2 mx-0"
                fieldHeight="56px"
              />
            </Grid>
          </Grid>
          <Grid></Grid>
          <Grid className="col-12">
            <InputText
              value={formik?.values?.Description}
              onChange={handleChange}
              onBlur={formik?.handleBlur}
              error={
                formik?.touched?.Description &&
                Boolean(formik?.errors?.Description)
              }
              helperText={
                formik?.touched?.Description && formik?.errors?.Description
              }
              name="Description"
              id="title"
              placeholder="Enter description address "
              label="Description"
              type="text"
              className="text-blue-color w-100 border-blue-color"
              fieldHeight="56px"
            />
          </Grid>
          <Grid className="col-12 time-compo my-2">
            <LocalizationProvider
              dateAdapter={AdapterDayjs}
              style={{ maxWidth: "100%" }}
            >
              <DemoContainer components={["DatePicker"]}>
                <DatePicker
                  label="Date"
                  value={
                    formik?.values?.Date &&
                    dayjs(formik?.values?.Date).isValid()
                      ? dayjs(formik?.values?.Date)
                      : null
                  }
                  className="text-blue-color"
                  onChange={(value) =>
                    formik.setFieldValue(
                      "Date",
                      value && dayjs(value).isValid()
                        ? value?.toISOString()
                        : null
                    )
                  }
                  sx={{
                    "& .MuiInputBase-root": {
                      borderRadius: "8px",
                    },
                    "& .MuiInputBase-input": {
                      color: "#063164",
                    },
                    "& .MuiInputLabel-root": {
                      color: "#063164",
                    },
                    "& .MuiSvgIcon-root": {
                      color: "#063164",
                    },
                  }}
                />
              </DemoContainer>
            </LocalizationProvider>
          </Grid>

          <Grid className="mb-2">
            <Grid>
              <DollerInput
                value={formik?.values?.Total}
                // onChange={handleChange}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*\.?\d*$/.test(value)) {
                    handleChange({
                      target: {
                        name: "Total",
                        value: Math?.max(0, Number(value)),
                      },
                    });
                  }
                }}
                onBlur={formik?.handleBlur}
                error={formik?.touched?.Total && Boolean(formik?.errors?.Total)}
                helperText={formik?.touched?.Total && formik?.errors?.Total}
                name="Total"
                placeholder="Total"
                label="Total"
                type="number"
                className="text-blue-color w-100 mb-2 mx-0"
                fieldHeight="56px"
              />
            </Grid>
          </Grid>
          <Grid className="col-12 text-blue-color">
            {/* <FormControl fullWidth>
              <InputDropdown
                onChange={(_, newValue) => {
                  const selectedPersonId = newValue ? newValue?.WorkerId : "";
                  formik.setFieldValue("WorkerId", selectedPersonId);
                  setselectedPerson(newValue);
                }}
                textFieldProps={formik?.getFieldProps("WorkerId")}
                options={teamData}
                value={selectedPerson || null}
                inputValue={selectedPerson ? selectedPerson?.FullName : ""}
                onTextFieldChange={formik?.handleChange}
                onBlur={formik?.handleBlur}
                getOptionLabel={(option) => option?.FullName || ""}
                error={
                  formik?.touched?.WorkerId && Boolean(formik?.errors?.WorkerId)
                }
                helperText={
                  formik?.touched?.WorkerId && formik?.errors?.WorkerId
                }
                filterOptions={(options, state) => {
                  return options?.filter((option) =>
                    option?.FullName?.toLowerCase()?.includes(
                      state?.inputValue?.toLowerCase() || ""
                    )
                  );
                }}
                name="WorkerId"
                label="Employee"
                type="text"
              />
            </FormControl> */}
            <FormControl fullWidth>
              <InputDropdown
                onChange={(_, newValue) => {
                  const selectedPersonId = newValue ? newValue?.WorkerId : "";
                  formik.setFieldValue("WorkerId", selectedPersonId);
                  setselectedPerson(newValue);
                }}
                textFieldProps={formik?.getFieldProps("WorkerId")}
                options={teamData}
                value={selectedPerson || null}
                inputValue={
                  selectedPerson
                    ? `${selectedPerson?.FirstName} ${selectedPerson?.LastName}`
                    : ""
                }
                onTextFieldChange={formik?.handleChange}
                onBlur={formik?.handleBlur}
                getOptionLabel={(option) =>
                  `${option?.FirstName} ${option?.LastName}`.trim()
                }
                error={
                  formik?.touched?.WorkerId && Boolean(formik?.errors?.WorkerId)
                }
                helperText={
                  formik?.touched?.WorkerId && formik?.errors?.WorkerId
                }
                filterOptions={(options, state) => {
                  return options?.filter((option) =>
                    `${option?.FirstName} ${option?.LastName}`
                      .toLowerCase()
                      .includes(state?.inputValue?.toLowerCase() || "")
                  );
                }}
                name="WorkerId"
                label="Employee"
                type="text"
              />
            </FormControl>
          </Grid>
          <Grid>
            <Grid
              className="file-upload"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              style={{
                borderRadius: "10px",
                padding: "20px",
                textAlign: "center",
                backgroundColor: "#f9f9f9",
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
                  padding: "13px",
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
                  <strong className="text-blue-color">Selected File:</strong>{" "}
                  <a
                    onClick={() => handleFilePreview(file)}
                    style={{
                      textDecoration: "none",
                      color: "#e88c44",
                      cursor: "pointer",
                    }}
                  >
                    {file?.split("/").pop()}
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
              <DialogTitle className="borerBommoModel">
                <Typography className="text-blue-color">
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
              <Grid style={{ color: "red", marginTop: "10px" }}>{error}</Grid>
            )}
          </Grid>
        </form>
      </DialogContent>
      <DialogActions className=" justify-content-between mx-3 mb-2 ">
        <WhiteButton
          className="cancelButton"
          style={{
            backgroundColor: "#fff",
            border: "1px solid rgba(6, 49, 100, 0.8)",
            color: "rgba(6, 49, 100, 1)",
            // marginLeft:"10px"
          }}
          onClick={() => {
            formik.resetForm();
            setExpenseId("");
            setselectedPerson(null);
            setFile("");
            setFile(null);
            setOpen({ isOpen: false, propertyData: null });
          }}
          label="Cancel"
        />
        <BlueButton
          className="bg-button-blue-color createButton  my-1"
          onClick={() => {
            setselectedPerson(null);
            formik.handleSubmit();
          }}
          label={
            loading ? (
              <WhiteLoaderComponent
                height="20"
                width="20"
                padding="20"
                loader={loading}
              />
            ) : (
              "Save Expenses"
            )
          }
        />
      </DialogActions>
    </Dialog>
  );
};

export default Expances;

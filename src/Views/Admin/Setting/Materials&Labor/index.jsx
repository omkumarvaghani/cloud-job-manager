import React, { useState, useEffect } from "react";
import {
  Autocomplete,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  TextField,
} from "@mui/material";
import {
  JobberTable,
  JobberSearch,
  JobberPagination,
  NavigatorNav,
  JobberSorting,
} from "../../../../components/MuiTable/index.jsx";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import IconButton from "@mui/material/IconButton";
import Edit from "../../../../assets/image/icons/edit.svg";
import Delete from "../../../../assets/image/icons/delete.svg";
import swal from "sweetalert";
import "./style.css";
import moment from "moment";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Label,
  ListInlineItem,
  Navbar,
} from "reactstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { Circles } from "react-loader-spinner";
import SettingSidebar from "../../../../components/Setting/SettingSidebar.jsx";
import { Link, useParams } from "react-router-dom";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Paper from "@mui/material/Paper";
import MenuList from "@mui/material/MenuList";
import List from "@mui/material/MenuItem";
import SwipeableDrawer from "./Drawer.jsx";
import MenuIcon from "@mui/icons-material/Menu";
import { Gridider } from "@mui/material";
import AxiosInstance from "../../../AxiosInstance.jsx";
import CombinedComponent from "./Drawer.jsx";
import SettingDropdown from "./SettingComponent.jsx";
import InputText from "../../../../components/InputFields/InputText.jsx";
import { SingleFileUpload } from "../../../../components/Files/index.jsx";
import { DisplayImage } from "../../../../components/Files/DisplayFiles.jsx";
import InputDropdown from "../../../../components/InputFields/InputDropdown.jsx";
import { postFile } from "../../../../components/Files/Functions.jsx";
import AddItems from "./AddItems.jsx";
import sendSwal from "../../../../components/Swal/sendSwal.jsx";
import {
  DeleteIcone,
  EditIcon,
  LoaderComponent,
} from "../../../../components/Icon/Index.jsx";
import { Grid } from "@mui/material";
import { Row, Col } from "react-bootstrap"; // React Bootstrap components
import { Typography } from "@mui/material";

import BlueButton from "../../../../components/Button/BlueButton.jsx";
import showToast from "../../../../components/Toast/Toster.jsx";
import { handleAuth } from "../../../../components/Login/Auth.jsx";

const MaterialsLabor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [modelOpen, setModelOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedAdminId, setSelectedAdminId] = useState("");
  console.log(selectedAdminId, "selectedAdminId");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [productAndService, setProductAndService] = useState([]);
  const [loader, setLoader] = useState(true);
  const [countData, setCountData] = useState(0);
  const CompanyId = localStorage.getItem("CompanyId");
  const [showSquaresSection, setShowSquaresSection] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [file, setFile] = useState();
  const [error, setError] = useState("");
  const [imageLoader, setImageLoader] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [tokenDecode, setTokenDecode] = useState({});
  const [inputValue, setInputValue] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [DateDecode, setDateDecode] = useState({});
  const fetchData = async () => {
    try {
      const res = await handleAuth(navigate, location);
      setTokenDecode(res.data);
      setDateDecode(res.themes);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const [dateFormat, setDateFormat] = useState("MM-DD-YYYY");
  useEffect(() => {
    const handleDateFormat = () => {
      if (DateDecode?.Format) {
        setDateFormat(DateDecode?.Format);
      } else {
        setDateFormat("MM-DD-YYYY");
      }
    };

    handleDateFormat();
  }, [DateDecode]);
  const [sortField, setSortField] = useState("asc");
  const [sortOrder, setSortOrder] = useState("desc");
  const getData = async () => {
    try {
      const res = await AxiosInstance.get(`/v1/material/get/${CompanyId}`, {
        params: {
          pageSize: rowsPerPage,
          pageNumber: page,
          search: search || "",
          selectedStatus: selectedStatus || "",
          sortField: sortField,
          sortOrder: sortOrder,
        },
      });
      console.log(res, "resresres");
      setProductAndService(res?.data?.data);
      setCountData(res?.data?.count);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    getData();
  }, [rowsPerPage, page, search, selectedStatus, sortField, sortOrder]);
  const handleDropdownSelect = (status) => {
    setSelectedStatus(status);
  };

  const dropdownOptions = [
    { text: "All" },
    { text: "Unit" },
    { text: "Hourly" },
    { text: "SqFt" },
    { text: "Fixed" },
  ];
  const allowedFileTypes = [
    "image/jpeg",
    "image/png",
    // "application/pdf",
    // "application/msword",
    // "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    // "application/vnd.ms-excel",
    // "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  const cdnUrl = process.env.REACT_APP_CDN_API;
  const cdnShowUrl = `${cdnUrl}/upload`;

  const uploadImage = async (file) => {
    setImageLoader(true);
    try {
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
      setImageLoader(false);
    }
  };
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await AxiosInstance.post(`${cdnUrl}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response?.data?.filePath;
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event?.preventDefault();
    const droppedFile = event?.dataTransfer?.files[0];
    if (droppedFile) {
      if (allowedFileTypes?.includes(droppedFile?.type)) {
        uploadImage(droppedFile);
      } else {
        setError("Unsupported file type. Please upload JPEG, or PNG file.");
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

  const handleFileChange = (event) => {
    const selectedFile = event?.target?.files[0];
    if (selectedFile) {
      if (allowedFileTypes?.includes(selectedFile?.type)) {
        uploadImage(selectedFile);
      } else {
        setError("Unsupported file type. Please upload a JPEG, PNG, ");
        setFile(null);
      }
    }
  };

  const handleEditClick = (item) => {
    setSelectedProduct(item);
    setFile(item?.Attachment);
    setSelectedAdminId(item?.ProductId);
    setSelectedProductAndService({ Type: item?.Type });
    setSelectedUnitsAndHours({
      Type:
        item?.Unit && item?.CostPerUnit
          ? "Unit"
          : item?.Square && item?.CostPerSquare
          ? "Sq. Ft."
          : item?.Hourly && item?.CostPerHour
          ? "Hourly"
          : item?.Fixed && item?.CostPerFixed
          ? "Fixed"
          : "",
    });
    if (item?.Unit && item?.CostPerUnit) {
      setShowUnitsSection(true);
      setShowSquaresSection(false);
      setShowHoursSection(false);
      setShowFixedSection(false);
    }
    if (item?.Hourly && item?.CostPerHour) {
      setShowHoursSection(true);
      setShowUnitsSection(false);
      setShowSquaresSection(false);
      setShowFixedSection(false);
    }
    if (item?.Square && item?.CostPerSquare) {
      setShowSquaresSection(true);
      setShowHoursSection(false);
      setShowUnitsSection(false);
      setShowFixedSection(false);
    }
    if (item?.Fixed && item?.CostPerFixed) {
      setShowFixedSection(true);
      setShowHoursSection(false);
      setShowSquaresSection(false);
      setShowUnitsSection(false);
    }
    setModelOpen(true);
  };

  const handleDelete = (id) => {
    console.log(id,"idididid")
    sendSwal().then(async (deleteReason) => {
      if (deleteReason) {
        try {
          const response = await AxiosInstance.delete(`/v1/material/${id}`, {
            data: { DeleteReason: deleteReason },
          });
          if (response?.data?.statusCode === 200) {
            setTimeout(() => {
              showToast.success(response?.data?.message);
            }, 500);
            getData();
          } else {
            setTimeout(() => {
              showToast.error("", response?.data?.message, "error");
            }, 500);
          }
        } catch (error) {
          console.error("Error:", error);
          showToast.error(error);
        }
      } else {
        setTimeout(() => {
          showToast.success("Materials & Labor is safe!", {
            position: "top-center",
            autoClose: 1000,
          });
        }, 500);
      }
    });
    setTimeout(() => {
      const deleteButton = document?.querySelector(".swal-button--confirm");
      if (deleteButton) {
        deleteButton.disabled = true;
      }
    }, 0);
  };

  const CollapseData = ({ data }) => {
    {
      console.log(data, "dtaaaaaaaaa");
    }
    return (
      <Grid className="d-flex gap-4 mt-3 mb-3 w-100">
        <Col className="card col-8 productDetaillTable">
          <Grid
            className="card-body w-100"
            style={{ backgroundColor: "#D8E7EE" }}
          >
            <Grid className="d-flex w-100 flex-row justify-content-between gap-2">
              <Typography className="text-blue-color">Description: </Typography>
              <Typography
                style={{
                  backgroundColor: "white",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "0.25rem",
                  width: "100%",
                  marginBottom: "7px",
                }}
                className="text-blue-color"
              >
                {console.log(data?.Description, "data?.Description")}
                {data?.Description || "Description not available"}
              </Typography>
            </Grid>
          </Grid>
        </Col>
      </Grid>
    );
  };

  const cellData = productAndService?.map((item, index) => {
    // Determine which field and value to display with a label
    let displayValue = "-";
    if (item?.Hourly) {
      displayValue = `Hourly : ${item?.Hourly}`;
    } else if (item?.Unit) {
      displayValue = `Unit : ${item?.Unit}`;
    } else if (item?.Square) {
      displayValue = `Sq. Ft. : ${item?.Square}`;
    } else if (item?.Fixed) {
      displayValue = `Fixed : ${item?.Fixed}`;
    }

    return {
      key: item.ProductId,
      value: [
        page * rowsPerPage + index + 1,
        item.Type ? item.Type : "Typ not available",
        item.Name ? item.Name : "Nam not available",
        displayValue,
        [
          `$${new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(
            item.CostPerHour ||
              item.CostPerUnit ||
              item.CostPerSquare ||
              item.CostPerFixed ||
              0.0
          )}`,
        ],

        moment(item.updatedAt).format(dateFormat),
        <>
          <div style={{ position: "relative", display: "inline-block" }}>
            <EditIcon
              onClick={(e) => {
                e.stopPropagation();
                handleEditClick(item);
              }}
              disabled={item.IsSuperadminAdd}
              style={{
                pointerEvents: item.IsSuperadminAdd ? "none" : "auto",
                opacity: item.IsSuperadminAdd ? 0.5 : 1,
              }}
            />
            {item.IsSuperadminAdd && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  // backgroundColor: "rgba(0, 0, 0, 0.5)",
                  cursor: "not-allowed",
                }}
                title="Add By Superadmin"
              />
            )}
          </div>

          <div
            style={{
              position: "relative",
              display: "inline-block",
              marginLeft: "10px",
            }}
          >
            <DeleteIcone
              className="mx-1 customerEditImgToEdit"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(item?.ProductId);
              }}
              disabled={item.IsSuperadminAdd}
              style={{
                pointerEvents: item.IsSuperadminAdd ? "none" : "auto",
                opacity: item.IsSuperadminAdd ? 0.5 : 1,
              }}
            />
            {item.IsSuperadminAdd && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  // backgroundColor: "rgba(0, 0, 0, 0.5)",
                  cursor: "not-allowed",
                }}
                title="Added By Superadmin"
              />
            )}
          </div>
        </>,
      ],
      component: item,
    };
  });

  const [selectedProductAndService, setSelectedProductAndService] =
    useState("");
  const [showHoursSection, setShowHoursSection] = useState(false);
  const [showFixedSection, setShowFixedSection] = useState(false);
  const [showUnitsSection, setShowUnitsSection] = useState(false);
  const [selectedUnitsAndHours, setSelectedUnitsAndHours] = useState(null);
  const productsAndService = [{ Type: "Materials" }, { Type: "Labor" }];

  const UnitsAndHours = [
    ...(selectedProductAndService?.Type === "Materials"
      ? [{ Type: "Unit" }, { Type: "Sq. Ft." }]
      : []),
    ...(selectedProductAndService?.Type === "Labor"
      ? [{ Type: "Hourly" }, { Type: "Fixed" }]
      : []),
  ];

  // useEffect(() => {
  //   setSelectedUnitsAndHours(null);
  // }, [selectedProductAndService]);

  const { CompanyName } = useParams();
  const [isOpenDropDown, setIsOpenDropDown] = useState(false);
  const toggle = () => setIsOpenDropDown(!isOpenDropDown);

  return (
    <>
      <Grid className="d-flex">
        <Col className=" col-2 h-100 hiren" xl={2}>
          <SettingSidebar />
        </Col>
        <Col
          className=" product-service-table col-10  addProductServiceSideLine"
          style={{
            borderLeft: "0.5px solid rgba(6, 49, 100, 30%)",
            paddingLeft: "20px",
            marginTop: "-30px",
          }}
          xl={10}
        >
          <Typography
            className="heading-two text-blue-color productServiceHeadFont"
            style={{ fontWeight: 700, marginTop: "5%" }}
          >
            Materials & Labor
          </Typography>
          <Typography className="text-blue-color" style={{ marginTop: "5px" }}>
            By keeping your materials and labor information updated, you can
            more easily create accurate quotes, jobs, and invoices.
          </Typography>

          <Grid className=" justify-content-end align-items-center">
            <Grid className="d-flex justify-content-end  align-items-center gap-2 settingSettingAddproSer BlueAndWhiteBtmFlex">
              <Grid className="d-flex  align-items-center gap-2 settingProductServiceGaps">
                {/* <Grid
                  className="setting-dropdown settingsidebardrop mb-2"
                  style={{ borderRadius: "5px " }}
                >
                  <button
                    className="btn bg-blue-color"
                    onClick={toggle}
                    state
                    style={{ color: "#fff" }}
                  >
                    Settings
                  </button>
                  {isOpenDropDown && (
                    <SettingDropdown
                      isOpenDropDown={isOpenDropDown}
                      toggle={toggle}
                      CompanyName={CompanyName}
                    />
                  )}
                </Grid> */}

                <SettingDropdown
                  isOpenDropDown={isOpenDropDown}
                  toggle={toggle}
                  CompanyName={CompanyName}
                />
              </Grid>
              <Grid
                className="d-flex justify-content-end align-items-end mb-2 mr-1  addproduCtBtnHere "
                style={{ marginTop: "15px" }}
              >
                <BlueButton
                  onClick={() => {
                    setModelOpen(true);
                    setSelectedProduct(null);
                    setSelectedProductAndService(null);
                    setSelectedUnitsAndHours(null);
                    setShowFixedSection(null);
                    setShowSquaresSection(null);
                    setShowHoursSection(null);
                    setShowUnitsSection(null);
                  }}
                  label="Add Materials & Labor"
                />
              </Grid>
            </Grid>

            <Card
              style={{
                borderRadius: "20px",
                border: "2px solid",
                padding: 0,
              }}
              className="border-blue-color"
            >
              <CardHeader
                className="d-flex justify-content-between align-items-center table-header bg-blue-color  customersAddCustomers"
                style={{
                  borderBottom: "2px solid ",
                  borderTopLeftRadius: "15px",
                  borderTopRightRadius: "15px",
                }}
              >
                <Typography className="text-light text-size settingProductService heading-five tableNameHead">
                  Materials & Labor
                </Typography>
                <Grid className="d-flex gap-2 settingSearch searchBarOfTable">
                  <JobberSorting
                    dropdownItems={dropdownOptions}
                    placeholder="Select Measurement"
                    onSelect={handleDropdownSelect}
                  />
                  <JobberSearch
                    className=""
                    search={search}
                    setSearch={setSearch}
                    style={{ background: "transparant", color: "white" }}
                  />
                </Grid>
              </CardHeader>
              {loader ? (
                <Grid className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5">
                  <LoaderComponent loader={loader} height="50" width="50" />
                </Grid>
              ) : (
                <CardBody style={{ padding: "10px 0px" }}>
                  <JobberTable
                    // headerData={[
                    //   "Sr no",
                    //   "Type",
                    //   "Name",
                    //   "Measurement",
                    //   "Cost",
                    //   "Date",
                    //   "Action",
                    // ]}
                    headerData={[
                      { label: "Sr No.", field: "" },
                      { label: "Type", field: "Type" },
                      { label: "Name", field: "Name" },
                      { label: "Measurement", field: "CostPerUnit" },
                      { label: "Cost", field: "Cost" },
                      { label: "Date", field: "createdAt" },
                      { label: "Action", field: "" },
                    ]}
                    setSortField={setSortField}
                    setSortOrder={setSortOrder}
                    sortOrder={sortOrder}
                    sortField={sortField}
                    cellData={cellData}
                    CollapseComponent={(data) => CollapseData(data)}
                    isCollapse={true}
                    page={page}
                    isNavigate={false}
                  />
                </CardBody>
              )}
              <CardFooter
                className="bg-orange-color border-blue-color"
                style={{
                  borderTop: "2px solid",
                  borderBottomLeftRadius: "20px",
                  borderBottomRightRadius: "20px",
                }}
              >
                <JobberPagination
                  totalData={countData}
                  currentData={rowsPerPage}
                  dataPerPage={rowsPerPage}
                  pageItems={[10, 25, 50]}
                  page={page}
                  setPage={setPage}
                  setRowsPerPage={setRowsPerPage}
                />
              </CardFooter>
            </Card>
          </Grid>
        </Col>
      </Grid>
      <AddItems
        modelOpen={modelOpen}
        setModelOpen={setModelOpen}
        setSelectedProductAndService={setSelectedProductAndService}
        selectedProductAndService={selectedProductAndService}
        productsAndService={productsAndService}
        setShowUnitsSection={setShowUnitsSection}
        setShowFixedSection={setShowFixedSection}
        setShowHoursSection={setShowHoursSection}
        setSelectedUnitsAndHours={setSelectedUnitsAndHours}
        showHoursSection={showHoursSection}
        showUnitsSection={showUnitsSection}
        showFixedSection={showFixedSection}
        selectedProduct={selectedProduct}
        selectedUnitsAndHours={selectedUnitsAndHours}
        UnitsAndHours={UnitsAndHours}
        showSquaresSection={showSquaresSection}
        setShowSquaresSection={setShowSquaresSection}
        selectedAdminId={selectedAdminId}
        CompanyId={CompanyId}
        getData={getData}
        handleFileChange={handleFileChange}
        uploadFile={uploadFile}
        file={file}
        error={error}
        closePreviewModal={closePreviewModal}
        previewFile={previewFile}
        handleRemoveFile={handleRemoveFile}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
        previewModalOpen={previewModalOpen}
        handleFilePreview={handleFilePreview}
        setInputValue={setInputValue}
        setSearchInput={setSearchInput}
      />
    </>
  );
};

export default MaterialsLabor;

import React, { useEffect, useState } from "react";
import ReactSelect, { components } from "react-select";
import { Button, CardHeader, FormGroup, Input, Label } from "reactstrap";
import { File } from "../Files";
import {
  IconButton,
  InputAdornment,
  TextareaAutosize,
  TextField,
  Typography,
} from "@mui/material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AxiosInstance from "../../Views/AxiosInstance";
import MenuItem from "@mui/material/MenuItem";
import { handleAuth } from "../Login/Auth";

import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import InputText from "../InputFields/InputText";
import AddItems from "../../Views/Admin/Setting/Materials&Labor/AddItems";
import { Grid } from "@mui/material";
import { Row, Col } from "react-bootstrap";
import BlueButton from "../Button/BlueButton";
import "./style.css";
import { NoDataFound } from "../Contract Component/Index";
import DollerInput from "../../components/InputFields/Doller";
import { borderColor } from "@mui/system";

const customStyles = {
  container: (provided) => ({
    ...provided,
    width: "100%",
    padding: 0,
    margin: 0,
  }),
  control: (provided) => ({
    ...provided,
    height: "100%",
    border: "0",
    boxShadow: "none",
    padding: 0,
    margin: 0,
  }),
  dropdownIndicator: (base) => ({
    ...base,
    display: "none",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  menu: (provided) => ({
    ...provided,
    width: "100%",
    padding: 0,
    margin: 0,
    zIndex: 9999,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? "rgba(6, 49, 100, 0.2)" : "white",
    color: "black",
    padding: 0,
    margin: 0,
  }),
  singleValue: (provided) => ({
    ...provided,
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    padding: 0,
    margin: 0,
  }),
};

// const CustomOption = ({ data, innerRef, innerProps, selectOption }) => {
//   const [isHovered, setIsHovered] = useState(false);
//   const handleSelectOption = (option) => {
//     selectOption(option);
//   };

//   return (
//     <Grid
//       ref={innerRef}
//       {...innerProps}
//       style={{
//         display: "flex",
//         flexDirection: "column",
//         backgroundColor: isHovered ? "rgba(6, 49, 100, 0.2)" : "white",
//         padding: "5px",
//         zIndex: "9999",
//       }}
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//       onClick={() => {
//         handleSelectOption(data);
//       }}
//     >
//       <Grid style={{ fontWeight: "bold", paddingLeft: "10px" }}>
//         {data?.Name}
//       </Grid>

//       <Grid
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           paddingLeft: "10px",
//           paddingRight: "10px",
//         }}
//       >
//         <Grid style={{ width: "90%" }}>{data?.Description}</Grid>
//         <Grid style={{ width: "10%" }}>
//           {data?.CostPerUnit ||
//             data?.CostPerHour ||
//             data?.CostPerSquare ||
//             data?.CostPerFixed}
//         </Grid>
//       </Grid>
//     </Grid>
//   );
// };
const CustomOption = ({ data, innerRef, innerProps }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Grid
      ref={innerRef}
      {...innerProps}
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: isHovered ? "rgba(6, 49, 100, 0.2)" : "white",
        padding: "5px",
        cursor: "pointer",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Grid style={{ fontWeight: "bold", paddingLeft: "10px" }}>
        {data?.Name}
      </Grid>

      <Grid
        style={{
          display: "flex",
          justifyContent: "space-between",
          paddingLeft: "10px",
          paddingRight: "10px",
        }}
      >
        <Grid style={{ width: "90%" }}>{data?.Description}</Grid>
        <Grid style={{ width: "10%" }}>
          {data?.CostPerUnit ||
            data?.CostPerHour ||
            data?.CostPerSquare ||
            data?.CostPerFixed}
        </Grid>
      </Grid>
    </Grid>
  );
};
const GetProducts = ({
  item,
  index,
  handleSelectChange,
  lineItems,
  setLineItems,
  menuIsOpen,
  setMenuIsOpen,
  deleteLineItem,
  isError,
  productRef,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const baseUrl = process.env.REACT_APP_BASE_API;
  const [groupedOptions, setGroupedOptions] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [tokenDecode, setTokenDecode] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await handleAuth(navigate, location);
        setTokenDecode(res.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);
  const getProducts = async () => {
    try {
      const res = await AxiosInstance.get(
        `${baseUrl}/materialslabor/get_materialslabor/${
          localStorage.getItem("CompanyId") || tokenDecode?.companyId
        }`
      );
      if (res.data.statusCode === 200) {
        const products = res.data.data;
        setGroupedOptions(products);
      }
    } catch (error) {
      console.error("Error: ", error);
    }
  };
  useEffect(() => {
    getProducts();
  }, [tokenDecode]);

  // const handleInputChange = (e, key) => {
  //   const newLineItems = [...lineItems];
  //   newLineItems[index][key] = e.target.value;
  //   if (key === "Unit" || key === "CostPerUnit") {
  //     newLineItems[index].Total =
  //       Number(newLineItems[index].Unit || 0) *
  //       Number(newLineItems[index].CostPerUnit || 0);
  //   } else if (key === "Hourly" || key === "CostPerHour") {
  //     newLineItems[index].Total =
  //       Number(newLineItems[index].Hourly || 0) *
  //       Number(newLineItems[index].CostPerHour || 0);
  //   } else if (key === "Fixed" || key === "CostPerFixed") {
  //     newLineItems[index].Total =
  //       Number(newLineItems[index].Fixed || 0) *
  //       Number(newLineItems[index].CostPerFixed || 0);
  //   } else if (
  //     key === "Square" ||
  //     key === "CostPerSquare" ||
  //     key === "Sq. Ft."
  //   ) {
  //     newLineItems[index].Total =
  //       Number(newLineItems[index].Square || 0) *
  //       Number(newLineItems[index].CostPerSquare || 0);
  //   }
  //   setLineItems(newLineItems);
  // };
  const handleInputChange = (e, key) => {
    const newLineItems = [...lineItems];
    let value = e.target.value;

    // Ensure first character is not a space for the Description field
    if (key === "Description" && value.startsWith(" ")) {
      value = value.trimStart();
    }

    newLineItems[index][key] = value;

    if (key === "Unit" || key === "CostPerUnit") {
      newLineItems[index].Total =
        Number(newLineItems[index].Unit || 0) *
        Number(newLineItems[index].CostPerUnit || 0);
    } else if (key === "Hourly" || key === "CostPerHour") {
      newLineItems[index].Total =
        Number(newLineItems[index].Hourly || 0) *
        Number(newLineItems[index].CostPerHour || 0);
    } else if (key === "Fixed" || key === "CostPerFixed") {
      newLineItems[index].Total =
        Number(newLineItems[index].Fixed || 0) *
        Number(newLineItems[index].CostPerFixed || 0);
    } else if (
      key === "Square" ||
      key === "CostPerSquare" ||
      key === "Sq. Ft."
    ) {
      newLineItems[index].Total =
        Number(newLineItems[index].Square || 0) *
        Number(newLineItems[index].CostPerSquare || 0);
    }

    setLineItems(newLineItems);
  };

  const handleSearchInputChange = (value) => {
    setInputValue(value);
  };
  const filteredOptions = groupedOptions?.filter((group) =>
    group.options.some(
      (option) =>
        option.Name?.toLowerCase().includes(inputValue?.toLowerCase()) ||
        option.Description?.toLowerCase().includes(inputValue?.toLowerCase())
    )
  );
  const [modelOpen, setModelOpen] = useState(false);
  const [selectedProductAndService, setSelectedProductAndService] =
    useState(null);
  const productsAndService = [{ Type: "Materials" }, { Type: "Labor" }];

  const UnitsAndHours = [
    ...(selectedProductAndService?.Type === "Materials"
      ? [{ Type: "Unit" }, { Type: "Sq. Ft." }]
      : []),
    ...(selectedProductAndService?.Type === "Labor"
      ? [{ Type: "Hourly" }, { Type: "Fixed" }]
      : []),
  ];

  const [selectedUnitsAndHours, setSelectedUnitsAndHours] = useState(null);
  const [showHoursSection, setShowHoursSection] = useState(false);
  const [showSquaresSection, setShowSquaresSection] = useState(false);
  const [showFixedSection, setShowFixedSection] = useState(false);
  const [showUnitsSection, setShowUnitsSection] = useState(false);
  useState(null);

  const [unitType, setUnitType] = useState("Hourly");
  const [openDropdown, setOpenDropdown] = useState(false);
  const [currentUnitType, setCurrentUnitType] = useState("");
  const [file, setFile] = useState();
  const [error, setError] = useState("");
  const [imageLoader, setImageLoader] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedAdminId, setSelectedAdminId] = useState("");
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const cdnUrl = process.env.REACT_APP_CDN_API;
  const cdnShowUrl = `${cdnUrl}/upload`;

  const allowedFileTypes = ["image/jpeg", "image/png"];

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

  useEffect(() => {
    if (item.CostPerHour !== null) {
      setCurrentUnitType("Hourly");
    } else if (item.CostPerUnit !== null) {
      setCurrentUnitType("Unit");
    } else if (item.CostPerSquare !== null) {
      setCurrentUnitType("Sq. Ft.");
    } else if (item.CostPerFixed !== null) {
      setCurrentUnitType("Fixed");
    } else {
      setCurrentUnitType(unitType);
    }
  }, [item, unitType]);

  // const handleInputChange = (e, field) => {
  //   const { value } = e.target;
  //   setItem((prevItem) => ({
  //     ...prevItem,
  //     [field]: value,
  //   }));
  // };

  const handleDropdownToggle = () => {
    setOpenDropdown(!openDropdown);
  };

  const handleDropdownChange = (event) => {
    const value = event.target.value;
    if (value === "Square") {
      const newLineItems = [...lineItems];
      newLineItems[index].Hourly = null;
      newLineItems[index].Unit = null;
      newLineItems[index].Fixed = null;
      newLineItems[index].Square = 1;
    }
    if (value === "Hourly") {
      const newLineItems = [...lineItems];
      newLineItems[index].Square = null;
      newLineItems[index].Unit = null;
      newLineItems[index].Fixed = null;
      newLineItems[index].Hourly = 1;
    }
    if (value === "Fixed") {
      const newLineItems = [...lineItems];
      newLineItems[index].Square = null;
      newLineItems[index].Unit = null;
      newLineItems[index].Hourly = null;
      newLineItems[index].Fixed = 1;
    }
    if (value === "Unit") {
      const newLineItems = [...lineItems];
      newLineItems[index].Square = null;
      newLineItems[index].Hourly = null;
      newLineItems[index].Fixed = null;
      newLineItems[index].Unit = 1;
    }
    setCurrentUnitType(value);
    setOpenDropdown(false);
  };

  const [searchInput, setSearchInput] = useState("");

  return (
    <Row
      className="row getproduct"
      style={{ paddingRight: "7px", paddingLeft: "7px" }}
    >
      <Typography
        className="heading-six text-blue-color"
        style={{ fontSize: "16px" }}
      >
        Materials & Labor *
      </Typography>
      <Col
        className="col-lg-5 col-md-12 my-3 "
        style={{ paddingRight: "3px", paddingLeft: "3px" }}
        lg={5}
        md={12}
      >
        <Grid
          className="card border-blue-color"
          style={{ border: "none", flexDirection: "column" }}
        >
          <Grid
            className="border-blue-color text-blue-color"
            style={
              {
                // fontSize: "14px",
                // backgroundColor: "#fff",
                // padding: "6px",
                // border: "1px solid",
                // borderRadius: "5px",
                // height: "56px",
              }
            }
          >
            {/* <ReactSelect
              className="basic-single text-blue-color"
              classNamePrefix="select"
              ref={productRef}
              placeholder=" Enter Materials & Labor"
              options={filteredOptions}
              components={{
                Option: (props) => (
                  <CustomOption
                    {...props}
                    selectOption={(option) => handleSelectChange(index, option)}
                  />
                ),
                NoOptionsMessage: () => (
                  <Grid
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      padding: "20px",
                      gap: "10px",
                      alignItems: "center",
                    }}
                  >
                    <NoDataFound />
                    <Button
                      className="text-blue-color border-blue-color"
                      style={{
                        backgroundColor: "#fff",
                        border: "1px solid ",
                        borderRadius: "5px",
                        fontSize: "12px",
                        marginLeft: "30px",
                      }}
                      onClick={(e) => {
                        setModelOpen(true);
                      }}
                    >
                      Create New Product
                    </Button>
                  </Grid>
                ),
              }}
              styles={customStyles}
              value={groupedOptions
                .flatMap((group) => group.options)
                .find((option) => {
                  return option.Name === item?.Name;
                })}
              menuIsOpen={menuIsOpen[index]}
              onMenuOpen={() => {
                const newMenuState = [...menuIsOpen];
                newMenuState[index] = true;
                setMenuIsOpen(newMenuState);
              }}
              onMenuClose={() => {
                const newMenuState = [...menuIsOpen];
                newMenuState[index] = false;
                setMenuIsOpen(newMenuState);
              }}
              onInputChange={handleSearchInputChange}
            /> */}
            {/* <ReactSelect
              className="basic-single text-blue-color"
              classNamePrefix="select"
              placeholder="Enter Materials & Labor"
              options={filteredOptions}
              components={{
                Option: (props) => (
                  <CustomOption
                    {...props}
                    selectOption={(option) => handleSelectChange(index, option)}
                  />
                ),
                NoOptionsMessage: () => (
                  <Grid
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      padding: "20px",
                      gap: "10px",
                      alignItems: "center",
                    }}
                  >
                    <NoDataFound />
                    <Button
                      className="text-blue-color border-blue-color"
                      style={{
                        backgroundColor: "#fff",
                        border: "1px solid",
                        borderRadius: "5px",
                        fontSize: "12px",
                        marginLeft: "30px",
                      }}
                      onClick={() => setModelOpen(true)}
                    >
                      Create New Product
                    </Button>
                  </Grid>
                ),
              }}
              styles={{
                control: (base) => ({
                  ...base,
                  // borderColor: "#ccc",
                  // boxShadow: "none",
                  fontSize: "14px",
                  backgroundColor: "#fff",
                  padding: "6px",
                  border: "1px solid",
                  borderRadius: "5px",
                  height: "56px",
                  zIndex: 9999,
                  position: "relative",
                }),
              }}
              value={groupedOptions
                .flatMap((group) => group.options)
                .find((option) => option.Name === item?.Name)}
              inputValue={searchInput}
              menuIsOpen={menuIsOpen[index]}
              onMenuOpen={() => {
                const newMenuState = Array(menuIsOpen.length).fill(false); // Sab dropdown band
                newMenuState[index] = true; // Sirf current dropdown open
                setMenuIsOpen(newMenuState);
              }}
              onMenuClose={() => {
                const newMenuState = [...menuIsOpen];
                newMenuState[index] = false;
                setMenuIsOpen(newMenuState);
              }}
              onInputChange={(inputValue, { action }) => {
                if (action === "input-change") {
                  setSearchInput(inputValue);
                  handleSearchInputChange(inputValue);
                  if (!inputValue) {
                    const newMenuState = [...menuIsOpen];
                    newMenuState[index] = false;
                    setMenuIsOpen(newMenuState);
                  }
                }
              }}
              onChange={(selectedOption) => {
                handleSelectChange(index, selectedOption);
                setSearchInput("");
                const newMenuState = [...menuIsOpen];
                newMenuState[index] = false; // Select hone par dropdown band ho
                setMenuIsOpen(newMenuState);
              }}
            /> */}
            <ReactSelect
              className="basic-single text-blue-color"
              classNamePrefix="select"
              placeholder="Enter Materials & Labor"
              options={filteredOptions}
              components={{
                Option: (props) => (
                  <CustomOption
                    {...props}
                    selectOption={(option) => handleSelectChange(index, option)}
                  />
                ),
                NoOptionsMessage: () => (
                  <Grid
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      padding: "20px",
                      gap: "10px",
                      alignItems: "center",
                    }}
                  >
                    <NoDataFound />
                    <Button
                      className="text-blue-color border-blue-color"
                      style={{
                        backgroundColor: "#fff",
                        border: "1px solid",
                        borderRadius: "5px",
                        fontSize: "12px",
                        marginLeft: "30px",
                      }}
                      onClick={() => setModelOpen(true)}
                    >
                      Create New Product
                    </Button>
                  </Grid>
                ),
              }}
              styles={{
                control: (base) => ({
                  ...base,
                  fontSize: "14px",
                  backgroundColor: "#fff",
                  padding: "6px",
                  border: "1px solid",
                  borderRadius: "5px",
                  height: "56px",
                  zIndex: 1,
                  position: "relative",
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 1000,
                  position: "absolute",
                  color: "#063164",
                }),
                menuPortal: (base) => ({
                  ...base,
                  zIndex: 9999,
                }),
              }}
              value={groupedOptions
                .flatMap((group) => group.options)
                .find((option) => option.Name === item?.Name)}
              inputValue={searchInput}
              menuIsOpen={menuIsOpen[index]}
              onMenuOpen={() => {
                const newMenuState = Array(menuIsOpen.length).fill(false);
                newMenuState[index] = true;
                setMenuIsOpen(newMenuState);
              }}
              onMenuClose={() => {
                const newMenuState = [...menuIsOpen];
                newMenuState[index] = false;
                setMenuIsOpen(newMenuState);
              }}
              onInputChange={(inputValue, { action }) => {
                if (action === "input-change") {
                  setSearchInput(inputValue);
                  handleSearchInputChange(inputValue);
                  if (!inputValue) {
                    const newMenuState = [...menuIsOpen];
                    newMenuState[index] = false;
                    setMenuIsOpen(newMenuState);
                  }
                }
              }}
              onChange={(selectedOption) => {
                handleSelectChange(index, selectedOption);
                setSearchInput("");
                const newMenuState = [...menuIsOpen];
                newMenuState[index] = false;
                setMenuIsOpen(newMenuState);
              }}
              menuPortalTarget={document.body}
            />
          </Grid>
          {isError && (
            <Grid style={{ color: "red" }}> product is required!</Grid>
          )}
          <TextareaAutosize
            value={item.Description}
            onChange={(e) => handleInputChange(e, "Description")}
            name={`Description[${index}]`}
            label="Description"
            placeholder="Enter Description here..."
            type="text"
            className="text-blue-color w-100 mt-3 border-blue-color"
            multiline
            InputLabelProps={{
              shrink: Boolean(item.Description),
            }}
            style={{
              border: "1px solid #ccc",
              height: "50px",
              padding: "13px",
              borderRadius: "4px",
              outline: "none",
            }}
            onFocus={(e) => (e.target.style.border = "1px solid #ccc")}
            onBlur={(e) => (e.target.style.border = "1px solid #ccc")}
          />
        </Grid>
      </Col>
      <Col className="col-lg-3 col-md-4 mt-3 mb-0 qty" lg={3} md={4}>
        <FormGroup className="hourQuoteBoxes" style={{ marginBottom: "0px" }}>
          <InputText
            value={
              currentUnitType === "Square" || currentUnitType === "Sq. Ft."
                ? 1
                : item[currentUnitType] || ""
            }
            onChange={(e) => handleInputChange(e, currentUnitType)}
            onInput={(e) => {
              if (e.target.value < 0) {
                e.target.value = 0;
                handleInputChange(e, currentUnitType);
              }
            }}
            label={currentUnitType}
            placeholder={`Enter ${currentUnitType} here...`}
            id={`qty_${index}`}
            name={`${currentUnitType}[${index}]`}
            type="number"
            className="text-blue-color w-100 hour_squre_unit hour_squre_unitboxx"
            fieldHeight="50px"
            min="0"
            disable={
              currentUnitType === "Square" || currentUnitType === "Sq. Ft."
            }
            endAdornment={
              <InputAdornment position="end" className="hour_squre_unitboxx">
                <IconButton
                  aria-label="toggle unit dropdown"
                  onClick={handleDropdownToggle}
                  edge="end"
                  className="hour_squre_unitboxx"
                >
                  <ArrowDropDownIcon />
                </IconButton>
              </InputAdornment>
            }
          />
          {openDropdown && (
            // <InputText
            //   select
            //   value={currentUnitType}
            //   onChange={handleDropdownChange}
            //   className="text-blue-color mt-2 w-100 hourQuoteBoxes hour_squre_unitboxx"
            //   fieldHeight="56px"
            // >
            //   <MenuItem value="Unit">Unit</MenuItem>
            //   <MenuItem value="Hourly" className="hour_dropdown">Hourly</MenuItem>
            //   <MenuItem value="Fixed">Fixed</MenuItem>
            //   <MenuItem value="Sq. Ft.">Sq. Ft.</MenuItem>
            // </InputText>

            <FormGroup
              value={currentUnitType}
              onChange={handleDropdownChange}
              className="text-blue-color mt-2 w-100 border-blue-color hourQuoteBoxes hour_squre_unitboxx"
            >
              <Input
                id="exampleSelect"
                name="select"
                type="select"
                className="border-blue-color"
                style={{ borderRadius: "4px", height: "48px" }}
              >
                <option value="Unit">Unit</option>
                <option value="Hourly" className="hour_dropdown">
                  Hourly
                </option>
                <option value="Fixed">Fixed</option>
                <option value="Sq. Ft.">Sq. Ft.</option>
              </Input>
            </FormGroup>
          )}
        </FormGroup>

        <FormGroup className={`mt-3 ${openDropdown && "pt-3"}`}>
          <File
            key={`file_${index}`}
            file={item.Attachment}
            index={index}
            setFile={(index, value) => {
              const newLineItems = [...lineItems];
              if (value === "") {
                newLineItems[index].Attachment = "";
              } else {
                newLineItems[index].Attachment = value;
              }
              setLineItems(newLineItems);
            }}
          />
        </FormGroup>
      </Col>

      <Col className="col-lg-2 col-md-4 my-1 px-1 " lg={2} md={4}>
        <FormGroup
          className="price_padding_re costInPutDetailHereToWrite"
          style={{ marginTop: "12px" }}
        >
          {currentUnitType === "Unit" ? (
            <FormGroup className="cost_input">
              <DollerInput
                label="Price"
                className="mb-0 border-blue-color totalNumber cost_input"
                id={`CostPerUnit${index}`}
                name={`CostPerUnit[${index}]`}
                placeholder="Cost"
                type="number"
                value={item.CostPerUnit || ""}
                fieldHeight="60px"
                onChange={(e) => {
                  const value = e.target.value;
                  if (value < 0) {
                    e.target.value = 0;
                  }
                  handleInputChange(e, "CostPerUnit");
                }}
                min="0"
              />
            </FormGroup>
          ) : currentUnitType === "Square" ? (
            <FormGroup className="cost_input">
              <DollerInput
                label="Price"
                className="mb-0 border-blue-color totalNumber cost_input"
                id={`CostPerSquare${index}`}
                name={`CostPerSquare[${index}]`}
                placeholder="Cost"
                type="number"
                value={item.CostPerSquare || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value < 0) {
                    e.target.value = 0;
                  }
                  handleInputChange(e, "CostPerSquare");
                }}
                min="0"
              />
            </FormGroup>
          ) : currentUnitType === "Fixed" ? (
            <FormGroup className="cost_input">
              <DollerInput
                label="Price"
                className="mb-0 border-blue-color totalNumber cost_input"
                id={`CostPerFixed${index}`}
                name={`CostPerFixed[${index}]`}
                placeholder="Cost"
                type="number"
                value={item.CostPerFixed || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value < 0) {
                    e.target.value = 0;
                  }
                  handleInputChange(e, "CostPerFixed");
                }}
                min="0"
              />
            </FormGroup>
          ) : currentUnitType === "Sq. Ft." ? (
            <FormGroup className="cost_input">
              <DollerInput
                label="Price"
                className="mb-0 border-blue-color totalNumber cost_input"
                id={`CostPerSquare${index}`}
                name={`CostPerSquare[${index}]`}
                placeholder="Cost"
                type="number"
                value={item.CostPerSquare || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value < 0) {
                    e.target.value = 0;
                  }
                  handleInputChange(e, "CostPerSquare");
                }}
                min="0"
              />
            </FormGroup>
          ) : (
            <FormGroup className="cost_input">
              <DollerInput
                label="Price"
                className="mb-0 border-blue-color totalNumber cost_input"
                id={`CostPerHour${index}`}
                name={`CostPerHour[${index}]`}
                placeholder="Cost"
                type="number"
                value={item.CostPerHour !== undefined ? item.CostPerHour : ""}
                // value={item.CostPerHour || ""}

                onChange={(e) => {
                  const value = e.target.value;
                  if (value < 0) {
                    e.target.value = 0;
                  }
                  handleInputChange(e, "CostPerHour");
                }}
                min="0"
              />
            </FormGroup>
          )}
        </FormGroup>
      </Col>
      <Col
        className="col-lg-2 col-md-4 my-3 px-1 price_padding_re"
        lg={2}
        md={4}
      >
        <FormGroup className="cost_input DollerInput mx-2 totalPaddin">
          {/* <DollerInput
            label="Total"
            className="mb-0 border-blue-color totalNumber cost_input"
            id={`total_${index}`}
            name={`Total[${index}]`}
            placeholder="Total"
            type="number"
            value={item.Total || ""}
            readOnly={true}
            disabled={true}
            style={{ borderRadius: "4px" }}
          /> */}
          <DollerInput
            label="Total"
            className="mb-0  border-blue-color totalNumber cost_input"
            id={`total_${index}`}
            name={`Total[${index}]`}
            placeholder="Total"
            // disabled={true}
            type="number"
            value={item.Total || ""}
            // readOnly={true}
            min="0"
          />
        </FormGroup>

        {lineItems.length > 1 && (
          <Grid className="dustbinIconDelere">
            <BlueButton
              className="deleteIcon"
              onClick={() => deleteLineItem(index)}
              style={{ color: "red", border: "none", background: "none" }}
              label={<DeleteOutlineOutlinedIcon />}
            />
          </Grid>
        )}
      </Col>
      <AddItems
        modelOpen={modelOpen}
        setModelOpen={setModelOpen}
        setSelectedProductAndService={setSelectedProductAndService}
        selectedProductAndService={selectedProductAndService}
        productsAndService={productsAndService}
        setShowUnitsSection={setShowUnitsSection}
        setShowHoursSection={setShowHoursSection}
        setSelectedUnitsAndHours={setSelectedUnitsAndHours}
        showHoursSection={showHoursSection}
        showUnitsSection={showUnitsSection}
        selectedProduct={selectedProduct}
        selectedUnitsAndHours={selectedUnitsAndHours}
        UnitsAndHours={UnitsAndHours}
        showSquaresSection={showSquaresSection}
        setShowSquaresSection={setShowSquaresSection}
        showFixedSection={showFixedSection}
        setShowFixedSection={setShowFixedSection}
        selectedAdminId={selectedAdminId}
        CompanyId={localStorage.getItem("CompanyId") || tokenDecode?.companyId}
        getData={getProducts}
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
        setLineItems={setLineItems}
        setNew={true}
        handleSelectChange={handleSelectChange}
        index={index}
        setInputValue={setInputValue}
        setSearchInput={setSearchInput}
      />
    </Row>
  );
};

export default GetProducts;

import React, { useState } from "react";
import Edit from "../../assets/image/icons/edit.svg";
import Delete from "../../assets/image/icons/delete.svg";
import EditWhite from "../../assets/svg/edit-white.svg";
import DeleteWhite from "../../assets/svg/delete-white.svg";

import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { Button, Input, Label } from "reactstrap";
import { Grid } from "@mui/material";
import { Row, Col } from "react-bootstrap";
import { Circles } from "react-loader-spinner";
import { SpinnerDotted } from "spinners-react";
import { padding } from "@mui/system";
import "./style.css";
import Tooltip from "@mui/material/Tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";

const EditIcon = ({ onClick, color = "#063164" }) => {
  return (
    <Tooltip title="Edit" arrow>
      <FontAwesomeIcon
        icon={faPenToSquare}
        alt="edit"
        onClick={onClick}
        style={{ cursor: "pointer", marginRight: "7px", color }} // Dynamic style
        className="margin-rightNone edit-Icon"
      />
    </Tooltip>
  );
};

const EditIconWhite = ({ onClick }) => {
  return (
    <div
      src={EditWhite}
      alt="edit"
      style={{ cursor: "pointer" }}
      onClick={onClick}
      className="EditWhite-Icon"
    ></div>
  );
};
const DeleteIcone = ({ onClick, color = "#063164" }) => {
  return (
    <Tooltip title="Delete" arrow>
      {/* <div
        // src={Delete}
        alt="edit"
        style={{ cursor: "pointer" }}
        onClick={onClick}
        className="margin-rightNone delete-Icon"
      /> */}
      <FontAwesomeIcon
        icon={faTrashCan}
        // icon="fa-regular fa-trash-can"
        alt="edit"
        style={{ cursor: "pointer", color }}
        onClick={onClick}
        className="margin-rightNone edit-Icon"
      />
    </Tooltip>
  );
};
const DeleteIconeWhite = ({ onClick }) => {
  return (
    <div
      src={DeleteWhite}
      alt="edit"
      style={{ cursor: "pointer" }}
      onClick={onClick}
      className="margin-rightNone DeleteWhite-Icon"
    />
  );
};
const LoaderComponent = ({ loader, height, width }) => {
  return (
    // <Circles
    //   height={height}
    //   width={width}
    //   color="#063164"
    //   ariaLabel="circles-loading"
    //   wrapperStyle={{}}
    //   wrapperClass=""
    //   visible={loader}
    //   padding={padding}
    // />
    <SpinnerDotted
      height={height}
      width={width}
      thickness={180}
      speed={130}
      color="#063164"
      padding={padding}
      visible={loader}
    />
  );
};
// const LoaderComponent = ({ loader, height, width }) => {
// const styles = {
//   ".loader-wrapper": {
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//     height: "100vh", // Adjust as necessary
//     animation: "spin 1s linear infinite", // Faster rotation speed (1s means faster)
//   },
//   "@keyframes spin": {
//     "0%": { transform: "rotate(0deg)" },
//     "100%": { transform: "rotate(720deg)" }, // Make it rotate more per cycle
//   },
// };
//   return (
//     // <HashLoader
//     //   size={width || 50} // Use width for size if provided; default to 50
//     //   color="#063164"
//     //   loading={loader}
//     //   aria-label="hash-loader"
//     //   style={{
//     //     display: "block",
//     //     margin: "0 auto",
//     //   }}
//     // />
//     <div className="loader-container">
//   <HashLoader
//         size={width || 50} // Control the size of the loader
//         color="#063164"
//         loading={loader}
//         aria-label="hash-loader"
//       />
//   </div>
//   );
// };

const WhiteLoaderComponent = ({ loader, height, width }) => {
  return (
    <Grid
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* <Circles
        height={height}
        width={width}
        color="#fff"
        ariaLabel="circles-loading"
        wrapperStyle={{}}
        wrapperClass=""
        visible={loader}
        padding={padding}
      /> */}
      <SpinnerDotted
        height={height}
        width={width}
        thickness={180}
        speed={130}
        color="#ffff"
        padding={padding}
        visible={loader}
      />
    </Grid>
  );
};
const CustomCheckbox = ({ id, name, checked, onChange, error, label }) => {
  return (
    <Grid style={{ display: "flex", gap: "8px" }}>
      <Input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={onChange}
        style={{
          border: error ? "2px solid red" : "1px solid #ccc",
          borderRadius: "4px",
          width: "16px",
          height: "16px",
        }}
      />
      <Label
        className="text-blue-color"
        for={id}
        style={{
          cursor: "pointer",
          color: error ? "red" : "inherit",
          fontWeight: error ? "bold" : "normal",
          marginTop: "2px",
        }}
      >
        {label}
      </Label>
    </Grid>
  );
};

const ProductItem = ({ item, index, cdnUrl }) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState("");
  const openFileModal = (fileName) => {
    setFile(`${cdnUrl}/upload/${fileName}`);
    setOpen(true);
  };
  const [openPdf, setOpenPdf] = useState(false);
  const [filePdf, setFilePdf] = useState("");
  const openFileModalModel = (fileName) => {
    setFilePdf(`${cdnUrl}/upload/${fileName}`);
    setOpenPdf(true);
  };

  const closeFileModal = () => {
    setOpen(false);
    setFile("");
    setOpenPdf(false);
    setFilePdf("");
  };

  return (
    <Grid className="items-contract">
      <Grid style={{ width: "100%" }} className="ScrollDiv">
        <Row className="mb-4 productAndServiceScroll">
          <Col lg={4} xl={4} md={4} sm={4} xs={4}>
            {index === 0 && (
              <Typography
                className="mb-3 productServiceHead text-blue-color"
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                }}
              >
                Materials & Labor
              </Typography>
            )}
            <Grid className="d-flex justify-content-between products mb-4">
              <Grid className="mb-3">
                <Typography
                  className="mb-0 Sub-title text-blue-color"
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  {item?.Name}
                </Typography>
                <Typography
                  className="mb-0 text-data text-blue-color"
                  style={{
                    fontSize: "14px",
                    whiteSpace: "break-spaces",
                  }}
                >
                  {item?.Description ||
                    "Labor charge for the setup and configuration of network switches for improved connectivity and network management."}
                </Typography>
              </Grid>
            </Grid>
          </Col>

          <Col className="col-2" xl={2} lg={2} md={2} sm={2} xs={2}>
            {index === 0 && (
              <Typography
                className="mb-3 productServiceHead  text-blue-color"
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  textAlign: "right",
                }}
              >
                Image
              </Typography>
            )}
            <Typography
              className="mb-0 text-data text-blue-color unit"
              style={{
                fontSize: "14px",
                textAlign: "right",
              }}
            >
              {item?.Attachment ? (
                item?.Attachment.endsWith(".pdf") ? (
                  <Box
                    sx={{ cursor: "pointer" }}
                    onClick={() => openFileModalModel(item?.Attachment)}
                    style={{ position: "relative" }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        zIndex: 1,
                      }}
                    />
                    <embed
                      style={{
                        marginBottom: "30px",
                        width: "100%",
                        height: "100%",
                      }}
                      src={`${cdnUrl}/upload/${item?.Attachment}`}
                      title="PDF Thumbnail"
                    />
                  </Box>
                ) : (
                  <img
                    style={{
                      marginBottom: "30px",
                      cursor: "pointer",
                      height: "40px",
                    }}
                    src={`${cdnUrl}/upload/${item?.Attachment}`}
                    onClick={() => openFileModal(item?.Attachment)}
                    alt="Image Thumbnail"
                  />
                )
              ) : (
                "-"
              )}
            </Typography>
          </Col>
          <Col className="col-2" xl={2} lg={2} md={2} sm={2} xs={2}>
            {index === 0 && (
              <Typography
                className="mb-3 productServiceHead text-blue-color"
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  textAlign: "right",
                }}
              >
                Measurement
              </Typography>
            )}
            <Typography
              className="mb-0 text-data text-blue-color unit"
              style={{
                fontSize: "14px",
                textAlign: "right",
              }}
            >
              {(() => {
                let displayValue = "";
                if (item?.Hourly) {
                  displayValue = `Hourly : ${item?.Hourly}`;
                } else if (item?.Unit) {
                  displayValue = `Unit : ${item?.Unit}`;
                } else if (item?.Square) {
                  displayValue = `Sq. Ft. : ${item?.Square}`;
                } else if (item?.Fixed) {
                  displayValue = `Fixed : ${item?.Fixed}`;
                }
                return displayValue;
              })()}
            </Typography>
          </Col>

          <Col className="col-2" xl={2} lg={2} md={2} sm={2} xs={2}>
            {index === 0 && (
              <Typography
                className="mb-3  productServiceHead text-blue-color"
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  textAlign: "right",
                }}
              >
                Cost
              </Typography>
            )}
            <Typography
              className="mb-0 text-data text-blue-color per-unit"
              style={{
                fontSize: "14px",
                textAlign: "right",
              }}
            >
              $
              {item?.CostPerHour
                ? `${new Intl.NumberFormat("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(item?.CostPerHour)}`
                : item?.CostPerSquare
                ? `${new Intl.NumberFormat("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(item?.CostPerSquare)}`
                : item?.CostPerUnit
                ? `${new Intl.NumberFormat("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(item?.CostPerUnit)}`
                : item?.CostPerFixed
                ? `${new Intl.NumberFormat("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(item?.CostPerFixed)}`
                : "-"}
            </Typography>
          </Col>

          <Col className="col-2 text-end" lg={2} xl={2} md={2} sm={2} xs={2}>
            {index === 0 && (
              <Typography
                className="mb-3 productServiceHead  text-blue-color totalInput totalPrice_contract totalOfQuoteDes"
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                }}
              >
                Total
              </Typography>
            )}
            <Typography
              className="mb-0 text-data text-blue-color total-pro"
              style={{ fontSize: "14px" }}
            >
              {`$${
                item?.Total
                  ? new Intl.NumberFormat("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(item?.Total)
                  : "-"
              }`}
            </Typography>
          </Col>
        </Row>
      </Grid>
      <Dialog
        open={open || openPdf} // Opens when either image or PDF is active
        onClose={closeFileModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle className="borerBommoModel">
          <Typography className="text-blue-color">File Preview</Typography>
        </DialogTitle>
        <DialogContent style={{ textAlign: "center", marginTop: "10px" }}>
          {/* Render PDF or Image */}
          {openPdf ? (
            <embed
              src={filePdf}
              style={{ width: "100%", height: "600px" }}
              title="PDF Preview"
              type="application/pdf"
            />
          ) : open ? (
            <img
              src={file}
              alt="Preview"
              style={{
                maxWidth: "100%",
                maxHeight: "600px",
                borderRadius: "10px",
              }}
            />
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeFileModal} className="bg-blue-color text-white">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

const OrangeButton = ({ label, ...props }) => {
  return (
    <Button
      {...props}
      className="text-capitalize bg-orange-color text-white-color"
    >
      {label}
    </Button>
  );
};

export {
  EditIcon,
  DeleteIcone,
  DeleteIconeWhite,
  EditIconWhite,
  CustomCheckbox,
  ProductItem,
  LoaderComponent,
  WhiteLoaderComponent,
  OrangeButton,
};

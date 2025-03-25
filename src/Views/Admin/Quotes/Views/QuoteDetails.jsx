import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import { DisplayImage } from "../../../../components/Files/DisplayFiles";
import QuoteMail from "../QuoteMail";
import moment from "moment";
import {
  EditIcon,
  LoaderComponent,
  ProductItem,
} from "../../../../components/Icon/Index";
import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";
import {
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  LinearProgress,
} from "@mui/material";
import { Row, Col } from "react-bootstrap";

import BlueButton from "../../../../components/Button/BlueButton";
import WhiteButton from "../../../../components/Button/WhiteButton";
import AllDropdown from "../../../../components/Dropdown/Dropdown";
import FooterDetails from "../../../../components/UserFooter/UserFooter";
import { Typography } from "@mui/material";
import "./style.css";
import { Button } from "reactstrap";
import Signature from "../../../../assets/image/icons/Signature.svg";
import Tooltip from "@mui/material/Tooltip";
import { useStaffContext } from "../../../../components/StaffData/Staffdata";

const QuotesDetails = ({
  loader,
  Previous,
  setMail,
  handleEditClick,
  dropdownOpen,
  quotesData,
  quotteImage,
  Copy,
  handleCopy,
  options,
  open,
  setOpen,
  file,
  cdnUrl,
  setFile,
  mail,
  openPdf,
  setFilePdf,
  setOpenPdf,
  requestData,
  filePdf,
  toggleDropdown,
  menuItems,
  handleOpenSignPDFDialog,
  openSignPDF,
  handleCloseDialog,
  selectedFileUri,
  progress,
  collectSignatureLoader,
  handleDelete,
  dateFormat,
  CompanyName,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const openFileModal = (attachment) => {
    setFile(attachment);
    setOpen(true);
  };
  const openFileModalModel = (attachment) => {
    setFilePdf(attachment);
    setOpenPdf(true);
  };
  const { staffData } = useStaffContext();

  return (
    <>
      {collectSignatureLoader ? (
        <Grid
          className="d-flex flex-direction-row justify-content-center align-items-center"
          style={{ height: "80vh" }}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            position="relative"
          >
            <CircularProgress
              variant="determinate"
              value={progress}
              size={90}
              thickness={2}
              sx={{
                color: "#E88C44",
              }}
            />
            <Typography
              className="text-blue-color"
              variant="caption"
              component="div"
              color="textSecondary"
              style={{
                position: "absolute",
                fontWeight: "bold",
                fontSize: "20px",
              }}
            >
              {`${progress}%`}
            </Typography>
          </Box>
        </Grid>
      ) : loader ? (
        <Grid
          className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5"
          style={{ height: "80vh", marginTop: "25%" }}
        >
          <LoaderComponent loader={loader} height="50" width="50" />
        </Grid>
      ) : (
        <Grid className="Quote-details">
          <Grid>
            <Grid className="d-flex justify-content-between buttonGroup emailEditAction_btn">
              <Grid style={{ display: "flex" }}>
                <BlueButton
                  style={{
                    color: "#fff",
                    marginRight: "10px",
                    width: "50px",
                    height: "40px",
                    marginBottom: "0px",
                    padding: "0px 0px",
                    borderRadius: "4px",
                  }}
                  onClick={() => {
                    // navigate(-1);
                    navigate(
                      `/${
                        CompanyName
                          ? CompanyName + "/quotes"
                          : "staff-member" + "/workerquotes"
                      }`,
                      {
                        state: {
                          navigats: location?.state?.navigats.filter(
                            (item) => item !== "/quotes"
                          ),
                        },
                      }
                    );
                  }}
                  className="bg-button-blue-color nevigator_btn"
                  label={
                    <img
                      alt="img"
                      src={Previous}
                      style={{ width: "20px", height: "20px" }}
                    />
                  }
                />
              </Grid>
              <Grid className="d-flex justify-content-end gap-2 buttonGroupthree emailEditAction_btn">
                <BlueButton
                  className="bg-button-blue-color invoiceEditBtn"
                  style={{ fontSize: "14px" }}
                  onClick={() => {
                    setMail(true);
                  }}
                  label={
                    <>
                      <MailOutlineOutlinedIcon style={{ marginRight: "8px" }} />
                      Send Email
                    </>
                  }
                />

                <WhiteButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditClick();
                  }}
                  disabled={staffData?.Quotes?.ViewOnly}
                  label={
                    <>
                      <EditIcon />
                      <span
                        className={
                          staffData?.Quotes?.ViewOnly ? "disabledText" : ""
                        }
                      >
                        Edit
                      </span>
                    </>
                  }
                />

                <AllDropdown
                  isOpen={dropdownOpen}
                  toggle={toggleDropdown}
                  menuItems={menuItems}
                />
              </Grid>
            </Grid>
            <Grid
              className="p-3 my-4 border-blue-color"
              style={{ border: "1px solid ", borderRadius: "12px" }}
            >
              <Grid className="justify-content-between d-flex align-items-center quoteResponse_quoteNumber">
                <Grid className="d-flex align-items-center responseBoxQuote">
                  <img src={quotteImage} />
                  <Typography
                    className="mb-0 mx-2 text-blue-color "
                    style={{
                      fontSize: "14px",
                      display: "flex",
                      backgroundColor:
                        quotesData?.Status === "Awaiting Response"
                          ? "rgba(255, 165, 0, 0.2)"
                          : quotesData?.Status === "Approved"
                          ? "rgba(88, 230, 88, 0.2)"
                          : quotesData?.Status === "Draft"
                          ? "rgba(0, 0, 255, 0.2)"
                          : quotesData?.Status === "Request changed"
                          ? "#FFDFF6"
                          : "",
                      alignItems: "center",
                      padding: "7px 20px 7px",
                      borderRadius: "25px",
                    }}
                  >
                    <Typography
                      className=""
                      style={{
                        backgroundColor:
                          quotesData?.Status === "Awaiting Response"
                            ? "orange"
                            : quotesData?.Status === "Approved"
                            ? "#58cc58"
                            : quotesData?.Status === "Draft"
                            ? "rgb(6, 49, 100)"
                            : quotesData?.Status === "Request changed"
                            ? "#FF33C6"
                            : "",
                        borderRadius: "50%",
                        padding: "6px",
                        marginRight: "10px",
                        marginBottom: 0,
                      }}
                    ></Typography>
                    {quotesData?.Status || "Status not available"}
                  </Typography>
                </Grid>
                <Typography
                  className="text-blue-color quoteNumberInQuote"
                  style={{ fontSize: "14px", fontWeight: "600" }}
                >
                  Quote :#
                  {quotesData?.QuoteNumber || "QuoteNumber not available"}
                </Typography>
              </Grid>
              <Grid>
                <Typography
                  className="my-4 mb-0 text-blue-color quotePersonName heading-three"
                  style={{ fontWeight: 700 }}
                >
                  {quotesData?.customer?.FirstName || "FirstName not available"}{" "}
                  {quotesData?.customer?.LastName || "LastName not available"}
                  <img
                    src={Copy}
                    style={{ cursor: "pointer" }}
                    onClick={handleCopy}
                    alt="Copy Icon"
                    className="mx-3 quoteCopyLink"
                  />
                </Typography>
                <Typography
                  className="text-blue-color "
                  style={{ fontSize: "14px" }}
                >
                  {quotesData?.Title || "Title not available"}
                </Typography>
              </Grid>
              <Grid className="d-flex property-address address_quoteDetail">
                <Col className="col-8 property_address" xl={6}>
                  <Typography
                    className="mb-0 Sub-title text-blue-color"
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                    }}
                  >
                    Property Address
                  </Typography>
                  <Typography
                    className="mb-0 text-data text-blue-color"
                    style={{ fontSize: "14px", width: "80%" }}
                  >
                    {quotesData?.location?.Address || "Address not available"}{" "},
                    {quotesData?.location?.City || "City not available"}{" "},
                    {quotesData?.location?.State || "State not available"}{" "},
                    {quotesData?.location?.Country || "Country not available"}{" "},
                    {quotesData?.location?.Zip || "Zip not available"}
                  </Typography>
                </Col>
                <Col className="col-2 " xl={3}>
                  <Typography
                    className="mb-0  text-blue-color quoteDetail_create QuoteDetailAddress"
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      marginLeft: "-14px",
                    }}
                  >
                    Quote details
                  </Typography>
                  <Typography
                    className="mb-0 text-data text-blue-color quoteDetail_create"
                    style={{
                      fontSize: "14px",
                      marginLeft: "-14px",
                    }}
                  >
                    Created
                  </Typography>
                </Col>
                <Col className="col-2 createDateQUoteDetail" xl={3}>
                  <Typography
                    className="mb-0 my-3 text-data text-blue-color createDates"
                    style={{
                      fontSize: "14px",
                      marginLeft: "2px",
                    }}
                  >
                    {/* {new Date(quotesData?.updatedAt).toLocaleDateString(
                      "en-US",
                      options
                    )} */}
                    {moment(quotesData?.updatedAt).format(dateFormat)}
                  </Typography>
                </Col>
              </Grid>
              <hr />
              {quotesData?.products?.length > 0 ? (
                quotesData?.products?.map((item, index) => (
                  <ProductItem
                    key={item?.id}
                    item={item}
                    index={index}
                    cdnUrl={cdnUrl}
                    openFileModal={openFileModal}
                    openFileModalModel={openFileModalModel}
                    open={open}
                    openPdf={openPdf}
                    file={file}
                    filePdf={filePdf}
                  />
                ))
              ) : (
                <Typography>No products available</Typography>
              )}

              <hr />
              <Grid className="d-flex products-colum totalQuoteSection">
                <Col className="col-8 contc" xl={8}>
                  <Typography
                    className="mb-2 text-blue-color"
                    style={{ fontSize: "14px" }}
                  >
                    {quotesData?.CustomerMessage ||
                      "CustomerMessage not available"}
                  </Typography>
                  <Typography
                    className="text-data text-blue-color"
                    style={{ fontSize: "14px", width: "70%" }}
                  >
                    {quotesData?.ContractDisclaimer ||
                      "ContractDisclaimer not available"}
                  </Typography>
                </Col>
                <Col className="col-4 contc" xl={4}>
                  <Grid className="d-flex justify-content-between mb-3">
                    <Typography
                      className="text-blue-color fw-medium"
                      style={{ fontSize: "14px" }}
                    >
                      Subtotal
                    </Typography>
                    <Typography
                      className="text-blue-color"
                      style={{ fontSize: "14px" }}
                    >
                      {`$${new Intl.NumberFormat("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(quotesData?.SubTotal || 0)}`}
                    </Typography>
                  </Grid>

                  {quotesData?.Discount ? (
                    <Grid className="d-flex justify-content-between mb-3">
                      <Typography
                        className="text-blue-color fw-medium"
                        style={{ fontSize: "14px" }}
                      >
                        Discount
                      </Typography>
                      <Typography
                        style={{ fontSize: "14px" }}
                        className="text-blue-color"
                      >
                        {quotesData?.Discount} %
                      </Typography>
                    </Grid>
                  ) : null}
                  {quotesData?.Tax ? (
                    <Grid className="d-flex justify-content-between  productTotalSub mb-3">
                      <Typography
                        className="text-blue-color fw-medium"
                        style={{ fontSize: "14px" }}
                      >
                        Tax
                      </Typography>
                      <Typography
                        style={{ fontSize: "14px" }}
                        className="text-blue-color"
                      >
                        {quotesData?.Tax} %
                      </Typography>
                    </Grid>
                  ) : null}
                  <hr className="my-0 mb-2" />
                  <Grid className="d-flex justify-content-between productTotalSub">
                    <Typography
                      className="mb-2 text-blue-color"
                      style={{ fontSize: "14px" }}
                    >
                      <Typography className="bold-text">Total</Typography>
                    </Typography>
                    <Typography
                      className="text-blue-color"
                      style={{ fontSize: "14px" }}
                    >
                      <Typography className="bold-text">
                        {`$${new Intl.NumberFormat("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(quotesData?.Total || 0)}`}
                      </Typography>
                    </Typography>
                  </Grid>
                </Col>
              </Grid>
            </Grid>
            <Grid
              className="p-3 my-4 border-blue-color"
              style={{ border: "1px solid ", borderRadius: "12px" }}
            >
              <Typography
                className="text-blue-color mb-3"
                style={{ fontWeight: 600 }}
              >
                Internal notes and attachments <HelpOutlineOutlinedIcon />
              </Typography>
              <Grid
                className=" border-blue-color"
                style={{
                  border: "0.5px solid ",
                  padding: "15px",
                  borderRadius: "10px",
                }}
              >
                <Typography className="text-blue-color">
                  {quotesData?.Notes || "No Notes Available"}
                </Typography>
              </Grid>
              <Grid style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                {quotesData?.Attachment && (
                  <DisplayImage
                    files={quotesData?.Attachment}
                    IsDeleted={false}
                  />
                )}
              </Grid>
            </Grid>

            {quotesData?.dropboxFiles?.length > 0 ? (
              <Grid
                className="p-3 my-4 border-blue-color"
                style={{ border: "1px solid", borderRadius: "12px" }}
              >
                {quotesData?.dropboxFiles?.map((file, index) => {
                  const signatureStatus =
                    file?.statusCode?.data?.signatureRequest?.signatures?.[0]
                      ?.statusCode;
                  return (
                    <Grid
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "12px",
                      }}
                    >
                      <Typography
                        onClick={() => handleOpenSignPDFDialog(file?.dataUri)}
                        style={{
                          cursor: "pointer",
                          alignItems: "center",
                          display: "flex",
                          paddingLeft: "5px",
                        }}
                      >
                        <img src={Signature} alt="Signature" />
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: "14px",
                            marginLeft: "12px",
                          }}
                          className="text-blue-color"
                        >
                          {index + 1}:
                          {signatureStatus === "awaiting_signature" ? (
                            <span className="text-blue-color">
                              {" "}
                              Signature Pending{" "}
                            </span>
                          ) : signatureStatus === "signed" ? (
                            <span
                              style={{ color: "#0cd70c", marginLeft: "5px" }}
                            >
                              Successfully Signed
                            </span>
                          ) : (
                            ""
                          )}
                        </span>
                      </Typography>
                      <BlueButton
                        onClick={() => {
                          handleDelete(file.signatureRequestId);
                        }}
                        style={{
                          marginLeft: "auto",
                          backgroundColor: "red",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          padding: "6px 12px",
                          cursor: "pointer",
                        }}
                        label={
                          <DeleteSweepOutlinedIcon
                            style={{ fontSize: "25px" }}
                          />
                        }
                      />
                    </Grid>
                  );
                })}
              </Grid>
            ) : null}

            <FooterDetails
              quotesData={quotesData}
              options={options}
              requestData={requestData}
            />
            <Grid
              className="p-3 my-4 border-blue-color"
              style={{ border: "1px solid", borderRadius: "12px" }}
            >
              <Typography
                variant="h6"
                fontWeight={600}
                gutterBottom
                style={{ color: "#063164" }}
              >
                Customer Request Change Message:
              </Typography>
              {Array.isArray(requestData?.RequestMessages?.message) &&
              requestData.RequestMessages?.message.length > 0 ? (
                requestData.RequestMessages?.message.map((item, index) => (
                  <Grid key={index}>
                    <Grid
                      variant="body1"
                      sx={{
                        mb: 1,
                        pl: 2,
                        borderLeft: "4px solid #1976d2",
                        whiteSpace: "pre-line",
                        wordBreak: "break-word",
                      }}
                      style={{ color: "#063164", display: "flex", gap: "10px" }}
                    >
                      <Typography>
                        {moment(requestData?.Date).format(
                          "YYYY-MM-DD HH:mm:ss"
                        )}
                      </Typography>
                      <Typography>
                        {typeof item === "string" &&
                          item.match(/.{1,200}/g)?.join("\n")}
                      </Typography>
                    </Grid>
                  </Grid>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No Request Message Available
                </Typography>
              )}
            </Grid>
          </Grid>
        </Grid>
      )}

      {/* <Box component={Paper} elevation={3} sx={{ p: 2, borderRadius: 2, backgroundColor: "#f9f9f9" }}> */}

      {/* </Box> */}
      <Dialog
        open={openSignPDF}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        className="p-0"
        style={{ background: "transparent" }}
      >
        <DialogContent>
          <iframe
            src={selectedFileUri}
            width="100%"
            height="550px"
            title="PDF Viewer"
          ></iframe>
        </DialogContent>
        <DialogActions>
          <BlueButton onClick={handleCloseDialog} label="Close" />
        </DialogActions>
      </Dialog>
      <QuoteMail
        modal={mail}
        setModal={setMail}
        customerData={quotesData?.customer}
        Total={quotesData?.Total}
        QuoteNumber={quotesData?.QuoteNumber}
        Attachment={quotesData?.Attachment}
        quotesData={quotesData}
      />
    </>
  );
};

export default QuotesDetails;

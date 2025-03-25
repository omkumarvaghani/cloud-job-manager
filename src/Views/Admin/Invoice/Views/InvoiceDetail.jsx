import React, { useState } from "react";
import { Card, Table } from "reactstrap";
import Previous from "../../../../assets/image/icons/Previous.png";
import Payment from "../../../../assets/image/dashboard/payment.svg";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import InvoiceImage from "../../../../assets/Blue-sidebar-icon/Invoice.svg";
import Copy from "../../../../assets/image/icons/copy.svg";
import moment from "moment";
import {
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { DisplayImage } from "../../../../components/Files/DisplayFiles";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import InvoiceMail from "../InvoiceMail";
import Signature from "../../../../assets/image/icons/Signature.svg";
import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";
import {
  EditIcon,
  LoaderComponent,
  ProductItem,
} from "../../../../components/Icon/Index";
import "./style.css";
import { Grid } from "@mui/material";
import { Row, Col } from "react-bootstrap";
import { useStaffContext } from "../../../../components/StaffData/Staffdata";

import BlueButton from "../../../../components/Button/BlueButton";
import WhiteButton from "../../../../components/Button/WhiteButton";
import AllDropdown from "../../../../components/Dropdown/Dropdown";
import FooterDetails from "../../../../components/UserFooter/UserFooter";
import { Typography } from "@mui/material";

const InvoiceDetail = ({
  loader,
  CompanyName,
  location,
  invoicedata,
  setMail,
  handleEditClick,
  dropdownOpen,
  toggle,
  downloadPdf,
  handleCopy,
  open,
  setOpen,
  file,
  mail,
  data,
  options,
  navigate,
  handleCancelInvoice,
  invoiceStatus,
  cdnUrl,
  setFile,
  toggleDropdown,
  menuItems,
  progress,
  collectSignatureLoader,
  errorMessage,
  openSignPDF,
  handleOpenSignPDFDialog,
  handleCloseDialog,
  selectedFileUri,
  handleDropboxDelete,
  dateFormat,
}) => {
  const openFileModal = (attachment) => {
    setFile(attachment);
    setOpen(true);
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
            <Grid className="d-flex justify-content-between buttonGroup nevigate_collect_cancel_invoice emailEditAction_btn">
              <Grid style={{ display: "flex" }}>
                <BlueButton
                  style={{
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
                          ? CompanyName + "/invoice"
                          : "staff-member" + "/workerinvoice"
                      }`,
                      {
                        state: {
                          navigats: location?.state?.navigats.filter(
                            (item) => item !== "/invoice"
                          ),
                        },
                      }
                    );
                  }}
                  className="text-capitalize bg-button-blue-color text-white-color nevigatePayment"
                  label={
                    <img
                      src={Previous}
                      alt=""
                      style={{ width: "20px", height: "20px" }}
                    />
                  }
                />
              </Grid>
              <Grid className="d-flex justify-content-end gap-2 buttonGroupthree  cancelInvoice_collectPayment_mail_btn emailEditAction_btn">
                {CompanyName && (
                  <BlueButton
                    className="bg-button-blue-color cancelInvoice_btn"
                    style={{
                      fontSize: "14px",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onClick={handleCancelInvoice}
                    disabled={invoiceStatus === "Canceled"}
                    label={
                      <>
                        {" "}
                        <img src={Payment} alt="Payment Icon" />
                        &nbsp;
                        {invoiceStatus === "Canceled"
                          ? "Invoice Cancelled"
                          : "Cancel Invoice "}
                      </>
                    }
                  />
                )}

                {CompanyName && (
                  <BlueButton
                    onClick={() =>
                      navigate(`/${CompanyName}/invoice-payment`, {
                        state: {
                          navigats: [
                            ...location?.state?.navigats,
                            "/invoice-payment",
                          ],
                          id: invoicedata?.InvoiceId,
                        },
                      })
                    }
                    disabled={invoiceStatus === "Canceled"}
                    label={
                      <>
                        <img src={Payment} />
                        &nbsp;{" "}
                        {invoiceStatus === "Canceled"
                          ? "Collect Payment"
                          : "Collect Payment"}
                      </>
                    }
                  />
                )}
                <BlueButton
                  className="bg-button-blue-color"
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
                <Grid className="editButton">
                  <WhiteButton
                    className="invoiceEditBtn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick();
                    }}
                    disabled={
                      invoiceStatus === "Canceled" ||
                      staffData?.Invoice?.ViewOnly
                    }
                    label={
                      <>
                        <EditIcon className="editImagePayment" />
                        <span
                          className={
                            invoiceStatus === "Canceled" ||
                            staffData?.Invoice?.ViewOnly
                              ? "disabledText"
                              : ""
                          }
                        > 
                          Edit
                        </span>
                      </>
                    }
                  />
                </Grid>

                <AllDropdown
                  isOpen={dropdownOpen}
                  toggle={toggle}
                  menuItems={menuItems}
                  style={{ zIndex: 1 }}
                />
              </Grid>
            </Grid>
            <Grid>
              <Card
                className="p-3 my-4"
                style={{ border: "1px solid #063164", borderRadius: "12px" }}
              >
                <Grid className="justify-content-between d-flex align-items-center invoicrNUmberAndImg">
                  <Grid className="d-flex align-items-center">
                    <img src={InvoiceImage} alt="Invoice" />
                    <Typography
                      className="mb-0 mx-2 text-blue-color invoicePaidGap"
                      style={{
                        fontSize: "16px",
                        display: "flex",
                        alignItems: "center",
                        padding: "7px 12px 7px",
                        borderRadius: "25px",
                        backgroundColor:
                          invoiceStatus === "Paid"
                            ? "#AEF6D3"
                            : invoiceStatus === "Unpaid"
                            ? "#FFC6C6"
                            : invoiceStatus === "Canceled"
                            ? "#FFE9BC"
                            : "",
                      }}
                    >
                      <Typography
                        style={{
                          backgroundColor:
                            invoiceStatus === "Paid"
                              ? "#089F57"
                              : invoiceStatus === "Unpaid"
                              ? "#FF0000"
                              : invoiceStatus === "Canceled"
                              ? "#FFAF0B"
                              : "",
                          borderRadius: "50%",
                          padding: "6px",
                          marginRight: "10px",
                          marginBottom: 0,
                        }}
                      ></Typography>
                      {invoiceStatus || "invoiceStatus not available"}
                    </Typography>
                  </Grid>
                  <Typography
                    className="text-blue-color"
                    style={{ fontSize: "14px", fontWeight: "600" }}
                  >
                    Invoice :#
                    {invoicedata?.InvoiceNumber ||
                      "InvoiceNumber not available"}
                  </Typography>
                </Grid>
                <Row style={{ display: "flex" }}>
                  <Grid className="d-flex customerIncvoiceDetailFlex">
                    <Col className="col-9 propertyAddressSpacing" xl={9} md={9}>
                      <Typography className="my-4 mb-0 text-blue-color heading-three">
                        {invoicedata?.customer?.FirstName ||
                          "FirstName not available"}{" "}
                        {invoicedata?.customer?.LastName ||
                          "LastName not available"}
                        <img
                          src={Copy}
                          style={{ cursor: "pointer" }}
                          onClick={handleCopy}
                          alt="Copy Icon"
                          className="mx-2"
                        />
                      </Typography>
                      <Typography
                        className="text-blue-color"
                        style={{ fontSize: "14px" }}
                      >
                        {/* {invoicedata?.Subject || "Subject not available"} */}
                        {invoicedata?.Subject
                          ? invoicedata?.Subject
                          : invoicedata?.account_name ||
                            "account_name not available"}
                      </Typography>
                      <Grid className="d-flex peoprttyAddressQIdthScreenFive">
                        <Col className="col-4 columnWidthSet" xl={4} md={4}>
                          <Typography
                            className="mb-0 Sub-title text-blue-color subTitleRemoveTop"
                            style={{ fontSize: "14px", fontWeight: 600 }}
                          >
                            Property Address
                          </Typography>
                          <Typography
                            className="mb-0 text-data text-blue-color"
                            style={{ fontSize: "14px", width: "80%" }}
                          >
                            {invoicedata?.location?.Address ||
                              "Address not available"},{" "}
                            {invoicedata?.location?.City ||
                              "City not available"},{" "}
                            {invoicedata?.location?.State ||
                              "State not available"},{" "}
                            {invoicedata?.location?.Country ||
                              "Country not available"},{" "}
                            {invoicedata?.location?.Zip || "Zip not available"}
                          </Typography>     
                        </Col>
                        <Col className="col-4 columnWidthSet" xl={4}>
                          <Typography
                            className="mb-0 Sub-title text-blue-color subTitleRemoveTop"
                            style={{ fontSize: "14px", fontWeight: 600 }}
                          >
                            Service Address
                          </Typography>            
                          <Typography
                            className="mb-0 text-data text-blue-color"
                            style={{ fontSize: "14px", width: "80%" }}
                          >
                            {invoicedata?.location?.Address ||
                              "Address not available"}{" "},
                            {invoicedata?.location?.City ||
                              "City not available"}{" "},
                            {invoicedata?.location?.State ||
                              "State not available"}{" "},
                            {invoicedata?.location?.Country ||
                              "Country not available"}{" "},
                            {invoicedata?.location?.Zip || "Zip not available"}
                          </Typography>
                        </Col>
                        <Col className="col-4 columnWidthSet" xl={4}>
                          <Typography
                            className="mb-0 Sub-title text-blue-color subTitleRemoveTop"
                            style={{ fontSize: "14px", fontWeight: 600 }}
                          >
                            Contact Details
                          </Typography>
                          <Typography
                            className="mb-0 text-data text-blue-color"
                            style={{ fontSize: "14px", width: "80%" }}
                          >
                            {invoicedata?.customer?.EmailAddress ||
                              "EmailAddress not available"}{" "}
                            <br />
                            {invoicedata?.customer?.PhoneNumber ||
                              "PhoneNumber not available"}
                          </Typography>
                        </Col>
                      </Grid>
                    </Col>
                    <Col className="col-3" xl={3}>
                      <Table borderless className="invoiceDetailLeft">
                        <TableHead>
                          <TableRow>
                            <TableCell
                              className="text-blue-color"
                              style={{
                                whiteSpace: "nowrap",
                                fontSize: "16px",
                                fontWeight: 700,
                              }}
                            >
                              Invoice Details
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell
                              className="text-blue-color"
                              style={{ fontSize: "15px", fontWeight: 600 }}
                            >
                              Issued
                            </TableCell>
                            <TableCell
                              style={{ whiteSpace: "nowrap", fontSize: "15px" }}
                              className="text-blue-color"
                            >
                              {/* {invoicedata?.IssueDate} */}
                              {/* {invoicedata?.IssueDate ? moment(invoicedata.IssueDate).format(dateFormat)} :()} */}
                              {invoicedata?.IssueDate
                                ? moment(invoicedata.IssueDate).format(
                                    dateFormat
                                  )
                                : "Date not available"}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell
                              className="text-blue-color"
                              style={{ fontSize: "15px", fontWeight: 600 }}
                            >
                              Due
                            </TableCell>
                            <TableCell
                              className="text-blue-color"
                              style={{ whiteSpace: "nowrap", fontSize: "15px" }}
                            >
                              {/* {invoicedata?.DueDate} */}
                              {invoicedata?.DueDate
                                ? moment(invoicedata?.DueDate).format(
                                    dateFormat
                                  )
                                : "Date not available"}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </Col>
                  </Grid>
                </Row>

                <Grid className="d-flex property-address"></Grid>
                <hr />
                {invoicedata?.Items?.length > 0 ? (
                  invoicedata?.Items?.map((item, index) => (
                    <ProductItem
                      key={index}
                      item={item}
                      index={index}
                      cdnUrl={cdnUrl}
                      openFileModal={openFileModal}
                      open={open}
                      setOpen={setOpen}
                      file={file}
                    />
                  ))
                ) : (
                  <Grid className="text-center text-blue-color">
                    <Typography
                      className="mb-0"
                      style={{
                        fontSize: "16px",
                        fontWeight: 600,
                      }}
                    >
                      Product/Service not available
                    </Typography>
                  </Grid>
                )}

                <hr />
                <Grid className="d-flex products-colum">
                  <Col className="col-8 contc" xl={8}>
                    <Typography
                      className="mb-2 text-blue-color"
                      style={{ fontSize: "14px" }}
                    >
                      {invoicedata?.Message || ""}
                    </Typography>
                    <Typography
                      className="text-data text-blue-color"
                      style={{ fontSize: "14px", width: "70%" }}
                    >
                      {invoicedata?.ContractDisclaimer || ""}
                    </Typography>
                  </Col>
                  <Col className="col-4 contc" xl={4}>
                    <Grid className="d-flex justify-content-between">
                      <Typography
                        className="text-blue-color mb-3"
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
                        }).format(invoicedata?.subTotal || 0)}`}
                      </Typography>
                    </Grid>

                    {invoicedata?.Discount ? (
                      <Grid className="d-flex justify-content-between">
                        <Typography
                          className=" text-blue-color mb-3"
                          style={{ fontSize: "14px" }}
                        >
                          Discount
                        </Typography>
                        <Typography
                          style={{ fontSize: "14px" }}
                          className="text-blue-color"
                        >
                          {invoicedata?.Discount} %
                        </Typography>
                      </Grid>
                    ) : null}
                    {invoicedata?.Tax ? (
                      <Grid className="d-flex justify-content-between">
                        <Typography
                          className="text-blue-color mb-3"
                          style={{ fontSize: "14px" }}
                        >
                          Tax
                        </Typography>
                        <Typography
                          style={{ fontSize: "14px" }}
                          className="text-blue-color"
                        >
                          {invoicedata?.Tax} %
                        </Typography>
                      </Grid>
                    ) : null}
                    <hr className="my-0 mb-2" />
                    <Grid className="d-flex justify-content-between">
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
                          }).format(invoicedata?.Total || 0)}`}
                        </Typography>
                      </Typography>
                    </Grid>
                  </Col>
                </Grid>
              </Card>
              <Card
                className="p-3 my-4"
                style={{ border: "1px solid #063164", borderRadius: "12px" }}
              >
                <Typography
                  className="text-blue-color mb-3 internal-notes"
                  style={{ fontWeight: 600 }}
                >
                  Internal notes and attachments
                  <HelpOutlineOutlinedIcon />
                </Typography>
                <Grid
                  className="internal-notes"
                  style={{
                    border: "0.5px solid rgba(6, 49, 100, 80%)",
                    padding: "15px",
                    borderRadius: "10px",
                  }}
                >
                  <Typography>
                    {invoicedata?.Notes || "No Notes Available"}
                  </Typography>
                </Grid>
                <Grid
                  style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}
                >
                  {invoicedata?.Attachment && (
                    <DisplayImage
                      files={invoicedata?.Attachment}
                      IsDeleted={false}
                    />
                  )}
                </Grid>
              </Card>
              {/* {invoicedata?.dropboxFiles?.length > 0 ? (
                <Grid
                  className="p-3 my-4 border-blue-color"
                  style={{ border: "1px solid", borderRadius: "12px" }}
                >
                  {invoicedata.dropboxFiles.map((file, index) => {
                    const signatureStatus =
                      file?.statusCode?.data?.signatureRequest?.signatures?.[0]
                        ?.statusCode;
                    return (
                      <i key={index}>
                        <Typography
                          onClick={() => handleOpenSignPDFDialog(file.dataUri)}
                          style={{
                            cursor: "pointer",
                            alignItems: "center",
                            display: "flex",
                            paddingLeft: "5px",
                            marginBottom: "12px",
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
                            {signatureStatus === "awaiting_signature"
                              ? " Signature Pending"
                              : signatureStatus === "signed"
                              ? " Successfully Signed"
                              : ""}
                          </span>
                        </Typography>
                      </i>
                    );
                  })}
                </Grid>
              ) : null} */}
              {invoicedata?.dropboxFiles?.length > 0 ? (
                <Grid
                  className="p-3 my-4 border-blue-color"
                  style={{ border: "1px solid", borderRadius: "12px" }}
                >
                  {invoicedata?.dropboxFiles?.map((file, index) => {
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
                            handleDropboxDelete(file.signatureRequestId);
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
              <FooterDetails invoicedata={invoicedata} options={options} />
            </Grid>
          </Grid>
        </Grid>
      )}
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
      <InvoiceMail
        modal={mail}
        setModal={setMail}
        customerData={invoicedata?.customer}
        Total={invoicedata?.Total}
        invoiceData={invoicedata}
        data={data}
        QuoteNumber={invoicedata?.QuoteNumber}
        Attachment={invoicedata?.Attachment}
        DueDate={invoicedata?.DueDate}
      />
    </>
  );
};

export default InvoiceDetail;

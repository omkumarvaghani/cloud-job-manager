import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import SignatureCanvas from "react-signature-canvas";
import DoneIcon from "@mui/icons-material/Done";
import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";
import Signature from "../../../../assets/image/icons/Signature.svg";
import { useStaffContext } from "../../../../components/StaffData/Staffdata";

import {
  Button,
  Card,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TabContent,
  Table,
} from "reactstrap";
import {
  DisplayImage,
  FileModal,
} from "../../../../components/Files/DisplayFiles";
import TimeEmpty from "../../../../components/Contract Component/TimeEmpty";
import Expances from "../../../../components/Contract Component/Expances";
import ContractMail from "../ContractMail";
import moment from "moment";
import Visit from "../../../../components/Contract Component/Visit";
import {
  DeleteIcone,
  EditIcon,
  EditIconWhite,
  LoaderComponent,
  ProductItem,
} from "../../../../components/Icon/Index";
import {
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { Row } from "react-bootstrap";
import { Typography } from "@mui/material";
import BlueButton from "../../../../components/Button/BlueButton";
import WhiteButton from "../../../../components/Button/WhiteButton";
import AllDropdown from "../../../../components/Dropdown/Dropdown";
import FooterDetails from "../../../../components/UserFooter/UserFooter";

const ContractDetails = ({
  loader,
  Previous,
  setMail,
  handleEditClick,
  dropdownOpen,
  Copy,
  handleCopy,
  options,
  open,
  setOpen,
  file,
  cdnUrl,
  setFile,
  mail,
  Contract,
  contractData,
  handleTimeEmptyModalOpen,
  handleVisitModalOpen,
  handleExpanseModalOpen,
  isTimeEmptyModalOpen,
  setIsTimeEmptyModalOpen,
  fetchData,
  fetchDatas,
  isExpanseModalOpen,
  setIsExpanseModalOpen,
  isVisitModalOpen,
  setIsVisitModalOpen,
  CompanyId,
  handleTimeEmptyeditModalOpen,
  handleDelete,
  handleExpensesDelete,
  handlevisitDelete,
  CustomerId,
  toggleDropdown,
  menuItems,
  progress,
  collectSignatureLoader,
  handleOpenSignPDFDialog,
  openSignPDF,
  handleCloseDialog,
  selectedFileUri,
  handleDropboxDelete,
  dateFormat,
  CompanyName,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [VisitId, setVisitId] = useState("");
  const [LabourId, setLabourId] = useState("");
  const [ExpenseId, setExpenseId] = useState("");
  const totals = contractData?.laborData?.map((item) => {
    const hours = Number(item?.Hours || 0);
    const minutes = Number(item?.Minutes || 0);
    return { hours, minutes };
  });

  const totalHours = totals?.reduce((acc, item) => acc + item?.hours, 0);
  const totalMinutes = totals?.reduce((acc, item) => acc + item?.minutes, 0);
  const extraHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  const finalHours = totalHours + extraHours;
  const finalMinutes = remainingMinutes;
  const { staffData } = useStaffContext();

  const openFileModal = (attachment) => {
    setFile(attachment);
    setOpen(true);
  };

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
            <Grid className="d-flex justify-content-between buttonGroup nevigateContract_mail emailEditAction_btn">
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
                          ? CompanyName + "/contract"
                          : "staff-member" + "/workercontract"
                      }`,
                      {
                        state: {
                          navigats: location?.state?.navigats.filter(
                            (item) => item !== "/contract"
                          ),
                        },
                      }
                    );
                  }}
                  className="bg-button-blue-color text-white-color nevigator_btn "
                  label={
                    <>
                      <img
                        src={Previous}
                        alt="Previous"
                        style={{ width: "20px", height: "20px" }}
                      />
                    </>
                  }
                />
              </Grid>
              <Grid className="d-flex justify-content-end gap-2 buttonGroupthree mailEditAction_contract emailEditAction_btn">
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
                  disabled={
                    // invoiceStatus === "Canceled" ||
                    staffData?.Contract?.ViewOnly
                  }
                  label={
                    <>
                      <EditIcon />
                      <span
                        className={
                          staffData?.Contract?.ViewOnly ? "disabledText" : ""
                        }
                      >
                        Edit
                      </span>
                    </>
                  }
                />
                {/* <WhiteButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditClick();
                  }}
                  label={
                    <>
                      <EditIcon />
                      Edit
                    </>
                  }
                /> */}
                <AllDropdown
                  isOpen={dropdownOpen}
                  toggle={toggleDropdown}
                  menuItems={menuItems}
                />
              </Grid>
            </Grid>
            <Grid>
              <Card
                className="p-3 my-4 outline-button-blue-color "
                style={{ border: "1px solid ", borderRadius: "12px" }}
              >
                <Grid className="justify-content-between d-flex align-items-center">
                  <Grid className="d-flex align-items-center ">
                    <img src={Contract} />
                    <Typography
                      className="mb-0 mx-2 text-blue-color contractDetailType"
                      style={{
                        fontSize: "14px",
                        display: "flex",
                        backgroundColor:
                          contractData?.Status === "Unscheduled"
                            ? "#FFC6C6"
                            : contractData?.Status === "Today"
                            ? "#DBECFF"
                            : contractData?.Status === "Upcoming"
                            ? "#AEF6D3"
                            : contractData?.Status === "Scheduled"
                            ? "#FFE9BC"
                            : contractData?.Status === "Converted"
                            ? "rgba(0, 0, 255, 0.2)"
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
                            contractData?.Status === "Unscheduled"
                              ? "#FF0000"
                              : contractData?.Status === "Today"
                              ? "#3595FF"
                              : contractData?.Status === "Upcoming"
                              ? "#089F57"
                              : contractData?.Status === "Scheduled"
                              ? "#FFAF0B"
                              : contractData?.Status === "Converted"
                              ? "#063164"
                              : "",
                          borderRadius: "50%",
                          padding: "6px",
                          marginRight: "10px",
                          marginBottom: 0,
                        }}
                      ></Typography>
                      {contractData?.Status}
                    </Typography>
                  </Grid>
                  <Typography
                    className="text-blue-color"
                    style={{ fontSize: "14px", fontWeight: "600" }}
                  >
                    Contract :#
                    {contractData?.ContractNumber ||
                      "ContractNumber not available"}
                  </Typography>
                </Grid>
                <Grid className="d-flex contract-main-first contractDetailContractPersonName">
                  <Col
                    className="col-lg-9 col-md-6 col-sm-6"
                    xl={9}
                    md={6}
                    sm={6}
                  >
                    <Typography
                      className="my-4 mb-0 text-blue-color heading-three"
                      style={{ fontWeight: 700 }}
                    >
                      {contractData?.customer?.FirstName ||
                        "FirstName not available"}{" "}
                      {contractData?.customer?.LastName ||
                        "LastName not available"}{" "}
                      <img
                        src={Copy}
                        alt="img"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleCopy()}
                      />
                    </Typography>
                    <Typography
                      className="text-blue-color"
                      style={{ fontSize: "14px" }}
                    >
                      {contractData?.Title || "Title not available"}
                    </Typography>
                    <Col className="col-8" xl={8}>
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
                        {contractData?.location?.Address ||
                          "Address not available"}{" "},
                        {contractData?.location?.City || "City not available"}{" "},
                        {contractData?.location?.State || "State not available"}{" "},
                        {contractData?.location?.Country ||
                          "Country not available"}{" "},
                        {contractData?.location?.Zip || "Zip not available"}
                      </Typography>
                    </Col>
                  </Col>

                  <Col
                    className="col-lg-3 col-md-6 col-sm-6"
                    lg={3}
                    md={6}
                    sm={6}
                  >
                    <Typography
                      className="mb-0 Sub-title text-blue-color"
                      style={{
                        fontSize: "16px",
                        fontWeight: 600,
                      }}
                    >
                      Contract details
                    </Typography>
                    <hr />
                    <Table borderless>
                      <TableBody className="Contract-table-detail">
                        <TableRow>
                          <TableCell className="text-blue-color">
                            Contract Type
                          </TableCell>
                          <TableCell className="text-blue-color">
                            {contractData?.IsOneoffJob
                              ? "One-off Job"
                              : contractData?.IsRecuringJob
                              ? "Recurring Job"
                              : "Neither"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="text-blue-color">
                            Starts On
                          </TableCell>
                          <TableCell className="text-blue-color">
                            {moment(
                              contractData?.IsOneoffJob &&
                                contractData?.OneoffJob?.StartDate
                                ? contractData?.OneoffJob?.StartDate
                                : contractData?.IsRecuringJob &&
                                  contractData?.RecuringJob?.StartDate
                                ? contractData?.RecuringJob?.StartDate
                                : "No Start Date"
                            ).format(dateFormat)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="text-blue-color">
                            Lasts For
                          </TableCell>
                          <TableCell className="text-blue-color">
                            {contractData?.IsOneoffJob &&
                            contractData?.OneoffJob?.EndDate
                              ? moment(contractData?.OneoffJob?.EndDate).format(
                                  dateFormat
                                )
                              : contractData?.IsRecuringJob &&
                                contractData?.RecuringJob?.Duration &&
                                contractData?.RecuringJob?.Frequency
                              ? `${contractData?.RecuringJob?.Frequency} ${contractData?.RecuringJob?.Duration}`
                              : "No End Date"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="text-blue-color">
                            Schedule
                          </TableCell>
                          <TableCell className="text-blue-color">
                            {contractData?.IsOneoffJob &&
                            contractData?.OneoffJob?.Repeats
                              ? contractData?.OneoffJob?.Repeats
                              : contractData?.IsRecuringJob &&
                                contractData?.RecuringJob?.Repeats
                              ? contractData?.RecuringJob?.Repeats
                              : "No Start Date"}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Col>
                </Grid>
                <hr />

                {contractData?.Items?.length > 0 &&
                  contractData?.Items?.map((item, index) => (
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
                  ))}
                <hr />
                <Grid className="d-flex products-colum gap-2">
                  <Col className="col-8 contc" xl={8} md={8}>
                    <Typography
                      className="mb-2 text-blue-color"
                      style={{ fontSize: "14px" }}
                    >
                      Contract/ Disclaimer This contract is valid for the next
                      30 days, after which values may be subject to change.
                    </Typography>
                  </Col>
                  <Col className="col-4 contc" xl={4} md={4}>
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
                        }).format(contractData?.Total ?? 0)}`}
                      </Typography>
                    </Grid>
                    {contractData?.Discount ? (
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
                          {contractData?.Discount} %
                        </Typography>
                      </Grid>
                    ) : null}
                    {contractData?.Tax ? (
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
                          {contractData?.Tax} %
                        </Typography>
                      </Grid>
                    ) : null}
                    <hr className="my-0 mb-2 " />
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
                          }).format(contractData?.Total ?? 0)}`}
                        </Typography>
                      </Typography>
                    </Grid>
                  </Col>
                </Grid>
              </Card>
              <Card
                className="p-3 my-4 border-blue-color "
                style={{ border: "1px solid", borderRadius: "12px" }}
              >
                <Grid className="d-flex justify-content-between">
                  <Typography
                    className="text-blue-color"
                    style={{ fontWeight: 600, fontSize: "19px" }}
                  >
                    Labour
                  </Typography>
                  <WhiteButton
                    size="sm"
                    outline
                    className="outline-button-blue-color border-blue-color outline text-blue-color"
                    style={{ height: "32px", borderRadius: "8px" }}
                    onClick={handleTimeEmptyModalOpen}
                    label="+ New Time Entry"
                  />
                </Grid>
                {contractData?.laborData &&
                contractData?.laborData?.length > 0 ? (
                  <Grid
                    className="w-95"
                    style={{
                      maxHeight: "300px",
                      overflowX: "clip",
                      overflowY: "auto",
                    }}
                  >
                    <Grid className="labourDetails">
                      {" "}
                      <Grid className="w-100" style={{ minWidth: "700px" }}>
                        <Grid style={{ minHeight: "20px" }}>
                          <Row
                            className="row py-2 text-left text-blue-color"
                            style={{ fontSize: "16px", fontWeight: 600 }}
                          >
                            <Col
                              className="col 
                             contractVisitHead"
                            >
                              TEAM
                            </Col>

                            <Col
                              className="col font-weight-bold contractVisitHead"
                              style={{ fontSize: "16px", fontWeight: 600 }}
                            >
                              DATE
                            </Col>
                            <Col
                              className="col font-weight-bold contractVisitHead"
                              style={{ fontSize: "16px", fontWeight: 600 }}
                            >
                              HOURS
                            </Col>
                            <Col
                              className="col text-right text-blue-color font-weight-bold contractVisitHead"
                              style={{ fontSize: "16px", fontWeight: 600 }}
                            >
                              COST
                            </Col>
                            <Col
                              className="col text-right text-blue-color font-weight-bold contractVisitHead"
                              style={{ fontSize: "16px", fontWeight: 600 }}
                            >
                              Action
                            </Col>
                          </Row>
                          {contractData?.laborData.map((item, index) => (
                            <Row className="row py-2 text-left" key={index}>
                              <Col className="col text-blue-color contractDataTableSub tableCOlor">
                                {/* {item?.WorkerId?.FullName ||
                                  "FullName not available"} */}
                                {item?.WorkerId
                                  ? `${item?.WorkerId?.FirstName} ${item?.WorkerId?.LastName}`
                                  : "Name not available"}
                              </Col>

                              <Col className="col text-blue-color contractDataTableSub tableCOlor">
                                {moment(item?.DatePicker).format(dateFormat)}
                                <br />
                                {moment(item?.StartTime).format("hh:mm A")}-
                                {moment(item?.EndTime).format("hh:mm A")}
                              </Col>
                              <Col className="col text-blue-color contractDataTableSub tableCOlor">
                                {item?.Hours || "Hours not available"}
                              </Col>
                              <Col className="col text-blue-color text-right  contractDataTableSub tableCOlor">
                                {`$${new Intl.NumberFormat("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }).format(item?.LabourCost ?? 0)}`}
                              </Col>
                              <Col className="col text-right">
                                <>
                                  <EditIcon
                                    className="contractEditDeleteImg"
                                    onClick={() => {
                                      setLabourId(item?.LabourId);
                                      handleTimeEmptyeditModalOpen(
                                        item?.LabourId
                                      );
                                    }}
                                  />
                                  <DeleteIcone
                                    className="contractEditDeleteImg customerEditImgToEdit"
                                    onClick={(event) =>
                                      handleDelete(
                                        event,
                                        item?.LabourId,
                                        item?.ContractId
                                      )
                                    }
                                  />
                                </>
                              </Col>
                            </Row>
                          ))}
                          <Row className="row"></Row>
                          <Row className="row font-weight-bold text-left border-top">
                            <Col className="col"></Col>
                            <Col className="col"></Col>
                            <Col className="col tableCOlor text-blue-color">
                              {contractData?.laborData.reduce(
                                (acc, item) => acc + Number(item?.Hours || 0),
                                0
                              )}
                            </Col>
                            <Col className="col text-right tableCOlor text-blue-color">
                              {`$${new Intl.NumberFormat("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(
                                contractData?.laborData.reduce(
                                  (acc, item) =>
                                    acc + Number(item?.LabourCost || 0),
                                  0
                                ) || 0
                              )}`}
                            </Col>

                            <Col className="col"></Col>
                          </Row>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                ) : (
                  <i>
                    <Typography
                      className="mb-0 text-blue-color"
                      style={{ fontSize: "12px" }}
                    >
                      Time tracked to this job by you or your team will show
                      here
                    </Typography>
                  </i>
                )}
              </Card>
              <Card
                className="p-3 my-4 border-blue-color"
                style={{ border: "1px solid ", borderRadius: "12px" }}
              >
                <Grid className="d-flex justify-content-between">
                  <Typography
                    className="text-blue-color"
                    style={{ fontWeight: 600, fontSize: "19px" }}
                  >
                    Expenses
                  </Typography>
                  <WhiteButton
                    size="sm"
                    outline
                    className="outline-button-blue-color border-blue-color outline text-blue-color"
                    style={{ height: "32px", borderRadius: "8px" }}
                    onClick={handleExpanseModalOpen}
                    label="+ New Expense"
                  />
                </Grid>
                {contractData?.expenseData &&
                contractData?.expenseData.length > 0 ? (
                  <Grid className="w-100">
                    <Grid
                      className="scrollClip"
                      style={{
                        overflowX: "auto",
                        maxHeight: "300px",
                        overflowY: "auto",
                        overflowX: "clip",
                      }}
                    >
                      {" "}
                      <Table className="w-100" style={{ minWidth: "800px" }}>
                        <TableHead>
                          <TableRow>
                            <TableCell
                              className="text-blue-color contractVisitHead fw-bold "
                              style={{ fontSize: "16px", fontWeight: 700 }}
                            >
                              TEAM
                            </TableCell>
                            <TableCell
                              className="text-blue-color contractVisitHead fw-bold"
                              style={{ fontSize: "16px", fontWeight: 700 }}
                            >
                              ITEM
                            </TableCell>
                            <TableCell
                              className="text-blue-color contractVisitHead fw-bold"
                              style={{ fontSize: "16px", fontWeight: 700 }}
                            >
                              Description
                            </TableCell>
                            <TableCell
                              className="text-blue-color contractVisitHead fw-bold"
                              style={{ fontSize: "16px", fontWeight: 700 }}
                            >
                              DATE
                            </TableCell>
                            <TableCell
                              className="text-blue-color text-right contractVisitHead fw-bold"
                              style={{ fontSize: "16px", fontWeight: 700 }}
                            >
                              Amount
                            </TableCell>
                            <TableCell
                              className="text-blue-color text-end contractVisitHead fw-bold "
                              style={{ fontSize: "16px", fontWeight: 700 }}
                            >
                              Action
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {contractData?.expenseData.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell
                                className="text-blue-color contractDataTableSub"
                                style={{ fontSize: "16px", fontWeight: 600 }}
                              >
                                {/* {item?.WorkerId?.FullName ||
                                  "FullName not available"} */}
                                {item?.WorkerId
                                  ? `${item?.WorkerId?.FirstName} ${item?.WorkerId?.LastName}`
                                  : "Name not available"}
                              </TableCell>
                              <TableCell
                                className="text-blue-color contractDataTableSub"
                                style={{ fontSize: "17px", fontWeight: 500 }}
                              >
                                {item?.ItemName || "ItemName not available"}
                              </TableCell>
                              <TableCell
                                className="text-blue-color contractDataTableSub"
                                style={{ fontSize: "17px", fontWeight: 500 }}
                              >
                                {item?.Description ||
                                  "Description not available"}
                              </TableCell>
                              <TableCell
                                className="text-blue-color contractDataTableSub"
                                style={{ fontSize: "17px", fontWeight: 500 }}
                              >
                                {moment(item?.Date).format(dateFormat)}
                              </TableCell>
                              <TableCell
                                className="text-blue-color text-right"
                                style={{ fontSize: "17px", fontWeight: 500 }}
                              >
                                {`$${new Intl.NumberFormat("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }).format(item?.Total ?? 0)}`}
                              </TableCell>
                              <TableCell
                                className="text-blue-color text-right"
                                style={{ fontSize: "17px", fontWeight: 500 }}
                              >
                                <Col className="col text-right">
                                  <>
                                    <EditIcon
                                      onClick={() => {
                                        setExpenseId(item?.ExpenseId);
                                        handleExpanseModalOpen(item?.ExpenseId);
                                      }}
                                    />
                                    <DeleteIcone
                                      className="customerEditImgToEdit"
                                      onClick={(event) =>
                                        handleExpensesDelete(
                                          event,
                                          item?.ExpenseId,
                                          item?.ContractId
                                        )
                                      }
                                    />
                                  </>
                                </Col>
                              </TableCell>
                            </TableRow>
                          ))}
                          {/* <TableRow>
                            <TableCell colSpan={5}>
                              <hr className="p-0 my-2 w-100" />
                            </TableCell>
                          </TableRow> */}
                          <TableRow colSpan={5}>
                            <TableCell
                              colSpan={4}
                              style={{ borderBottom: "2px solid white" }}
                            ></TableCell>
                            <TableCell
                              colSpan={4}
                              className="text-right text-blue-color"
                              style={{
                                fontSize: "17px",
                                fontWeight: 500,
                                borderBottom: "2px solid white",
                              }}
                            >
                              {`$${new Intl.NumberFormat("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(
                                contractData?.expenseData.reduce(
                                  (acc, item) => acc + Number(item?.Total || 0),
                                  0
                                ) || 0
                              )}`}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </Grid>
                  </Grid>
                ) : (
                  <i>
                    <Typography
                      className="mb-0 text-blue-color"
                      style={{ fontSize: "12px" }}
                    >
                      Get an accurate picture of various job costs by recording
                      expenses
                    </Typography>
                  </i>
                )}
              </Card>
              <Card
                className="p-3 my-4 border-blue-color"
                style={{ border: "1px solid ", borderRadius: "12px" }}
              >
                <Grid className="d-flex justify-content-between">
                  <Typography
                    className="text-blue-color"
                    style={{ fontWeight: 600, fontSize: "19px" }}
                  >
                    Visits
                  </Typography>
                  <WhiteButton
                    size="sm"
                    outline
                    className="outline-button-blue-color border-blue-color outline text-blue-color"
                    style={{ height: "32px", borderRadius: "8px" }}
                    onClick={handleVisitModalOpen}
                    label="+ New Visit"
                  />
                </Grid>
                {contractData?.visitsData &&
                contractData?.visitsData.length > 0 ? (
                  <Grid className="w-100 overflow-auto">
                    <Grid
                      style={{
                        width: "100%",
                        // overflowX: "auto",
                        maxHeight: "300px",
                        overflowY: "auto",
                      }}
                    >
                      <Grid style={{ minWidth: "850px" }}>
                        {Object.entries(
                          contractData?.visitsData.reduce((acc, visit) => {
                            const month = moment(visit?.StartDate).format(
                              dateFormat
                            );

                            if (!acc[month]) acc[month] = [];
                            acc[month].push(visit);
                            return acc;
                          }, {})
                        ).map(([month, visits]) => (
                          <Grid key={month}>
                            <Typography className="text-blue-color mt-4 heading-five">
                              {month}
                            </Typography>
                            <Grid>
                              {" "}
                              <Table
                                className="w-100"
                                style={{
                                  borderCollapse: "separate",
                                  borderSpacing: 0,
                                  overflowX: "clip",
                                }}
                              >
                                <TableHead
                                  style={{
                                    position: "sticky",
                                    top: 0,
                                    background: "#fff",
                                    zIndex: 1,
                                  }}
                                >
                                  <TableRow>
                                    <TableCell
                                      className="text-blue-color contractVisitHead"
                                      style={{
                                        fontSize: "16px",
                                        fontWeight: 700,
                                      }}
                                    >
                                      START DATE
                                    </TableCell>
                                    <TableCell
                                      className="text-blue-color"
                                      style={{
                                        fontSize: "16px",
                                        fontWeight: 600,
                                      }}
                                    ></TableCell>
                                    <TableCell
                                      className="text-blue-color contractVisitHead"
                                      style={{
                                        fontSize: "16px",
                                        fontWeight: 700,
                                      }}
                                    >
                                      ITEM
                                    </TableCell>
                                    <TableCell
                                      className="text-blue-color contractVisitHead"
                                      style={{
                                        fontSize: "16px",
                                        fontWeight: 700,
                                      }}
                                    >
                                      Description
                                    </TableCell>
                                    <TableCell
                                      className="text-blue-color contractVisitHead"
                                      style={{
                                        fontSize: "16px",
                                        fontWeight: 700,
                                      }}
                                    >
                                      Assign
                                    </TableCell>
                                    <TableCell
                                      className="text-blue-color text-end contractEditDeleteTable contractVisitHead"
                                      style={{
                                        fontSize: "16px",
                                        fontWeight: 700,
                                      }}
                                    >
                                      Action
                                    </TableCell>
                                  </TableRow>
                                </TableHead>

                                <TableBody>
                                  {visits?.map((item, index) => (
                                    <TableRow
                                      key={index}
                                      style={{ verticalAlign: "top" }}
                                    >
                                      <TableCell
                                        className="text-blue-color contractAssignTableFont contractDataTableSub tableCOlor"
                                        style={{
                                          whiteSpace: "nowrap",
                                          width: "10%",
                                          fontSize: "16px",
                                        }}
                                      >
                                        {moment(item?.StartDate).format(
                                          dateFormat
                                        )}{" "}
                                        -{" "}
                                        {moment(item?.EndDate).format(
                                          dateFormat
                                        )}
                                      </TableCell>
                                      <TableCell
                                        className="text-blue-color"
                                        style={{
                                          width: "150px",
                                          paddingRight: "10px",
                                          fontSize: "16px",
                                        }}
                                      >
                                        {item?.IsConfirmByWorker &&
                                          item?.ConfirmedWorkers?.length > 0 &&
                                          item?.ConfirmedWorkers?.filter(
                                            (worker) =>
                                              !item?.ConfirmComplete?.some(
                                                (completedWorker) =>
                                                  completedWorker?.FullName ===
                                                  worker?.FullName
                                              )
                                          )?.length > 0 && (
                                            <Typography
                                              className="text-blue-color MC-0 mb-0"
                                              style={{
                                                fontSize: "12px",
                                                fontWeight: "bold",
                                              }}
                                            >
                                              <DoneIcon
                                                style={{
                                                  fontSize: "15px",
                                                  color: "green",
                                                }}
                                              />{" "}
                                              Confirmed By Worker -{" "}
                                              {item?.ConfirmedWorkers?.filter(
                                                (worker) =>
                                                  !item?.ConfirmComplete?.some(
                                                    (completedWorker) =>
                                                      completedWorker?.FullName ===
                                                      worker?.FullName
                                                  )
                                              )
                                                ?.map(
                                                  (worker) => worker?.FullName
                                                )
                                                .join(", ")}
                                            </Typography>
                                          )}

                                        {item?.IsComplete &&
                                          item?.ConfirmComplete?.length > 0 && (
                                            <Typography
                                              className="text-blue-color MC-0 mb-0"
                                              style={{
                                                fontSize: "12px",
                                                fontWeight: "bold",
                                              }}
                                            >
                                              <DoneIcon
                                                style={{
                                                  fontSize: "15px",
                                                  color: "green",
                                                }}
                                              />{" "}
                                              Completed By Worker -{" "}
                                              {item?.ConfirmComplete?.map(
                                                (worker) => worker?.FullName
                                              ).join(", ")}
                                            </Typography>
                                          )}

                                        {item?.IsConfirm && (
                                          <Typography
                                            className="Appoiment text-blue-color contractDataTableSub "
                                            style={{
                                              fontSize: "12px",
                                              fontWeight: "bold",
                                            }}
                                          >
                                            <DoneIcon
                                              style={{
                                                fontSize: "15px",
                                                color: "green",
                                              }}
                                            />{" "}
                                            Confirmed By Customer -{" "}
                                            {contractData?.customer
                                              ?.FirstName ||
                                              "FirstName not available"}{" "}
                                            {contractData?.customer?.LastName ||
                                              ""}{" "}
                                            not available{" "}
                                          </Typography>
                                        )}
                                      </TableCell>
                                      <TableCell
                                        className="text-blue-color itemNameContractTable contractDataTableSub tableCOlor"
                                        style={{
                                          maxWidth: "100px",
                                          overflow: "hidden",
                                          whiteSpace: "pre-wrap",
                                          wordBreak: "break-word",
                                          fontSize: "18px",
                                        }}
                                      >
                                        {item?.ItemName ||
                                          "ItemName not available"}
                                      </TableCell>
                                      <TableCell
                                        className="text-blue-color contractDataTableSub tableCOlor"
                                        style={{
                                          maxWidth: "300px",
                                          overflow: "hidden",
                                          whiteSpace: "pre-wrap",
                                          wordBreak: "break-word",
                                          fontSize: "18px",
                                        }}
                                      >
                                        {item?.Note || "Note not available"}
                                      </TableCell>
                                      <TableCell
                                        className="text-blue-color contractDataTableSub tableCOlor"
                                        style={{
                                          whiteSpace: "nowrap",
                                          paddingLeft: "1%",
                                          fontSize: "18px",
                                        }}
                                      >
                                        {item?.AssignPersons &&
                                        item?.AssignPersons.length > 0
                                          ? item?.AssignPersons.join(", ")
                                          : "Not Assigned Yet"}
                                      </TableCell>
                                      <TableCell
                                        className="text-blue-color text-end contractEditDeleteTable"
                                        style={{
                                          fontSize: "16px",
                                          fontWeight: 600,
                                        }}
                                      >
                                        <>
                                          <EditIcon
                                            onClick={() => {
                                              setVisitId(item?.VisitId);
                                              handleVisitModalOpen(
                                                item?.VisitId
                                              );
                                            }}
                                            className="contractEditDeleteImg"
                                          />
                                          <DeleteIcone
                                            className="mx-1 contractEditDeleteImg customerEditImgToEdit"
                                            onClick={(event) =>
                                              handlevisitDelete(
                                                event,
                                                item?.VisitId,
                                                item?.ContractId
                                              )
                                            }
                                          />
                                        </>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </Grid>{" "}
                          </Grid>
                        ))}
                      </Grid>
                    </Grid>
                  </Grid>
                ) : (
                  <i>
                    <Typography
                      className="mb-0 text-blue-color"
                      style={{ fontSize: "12px" }}
                    >
                      Get an accurate picture of various job costs by recording
                      expenses
                    </Typography>
                  </i>
                )}
              </Card>

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
                  className=""
                  style={{
                    border: "0.5px solid rgba(6, 49, 100, 80%)",
                    padding: "15px",
                    borderRadius: "10px",
                  }}
                >
                  <Typography>
                    {contractData?.Notes || "No Notes Available"}
                  </Typography>
                </Grid>
                <Grid
                  style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}
                >
                  {contractData?.Attachment && (
                    <DisplayImage
                      files={contractData?.Attachment}
                      IsDeleted={false}
                    />
                  )}
                </Grid>
              </Grid>
              {contractData?.dropboxFiles?.length > 0 ? (
                <Grid
                  className="p-3 my-4 border-blue-color"
                  style={{ border: "1px solid", borderRadius: "12px" }}
                >
                  {contractData?.dropboxFiles.map((file, index) => {
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
                          onClick={() => handleOpenSignPDFDialog(file.dataUri)}
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
              <FooterDetails contractData={contractData} options={options} />
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
      <TimeEmpty
        open={isTimeEmptyModalOpen}
        setOpen={setIsTimeEmptyModalOpen}
        ContractId={contractData?.ContractId}
        fetchData={fetchData}
        fetchDatas={fetchDatas}
        CompanyId={CompanyId}
        LabourId={LabourId}
        setLabourId={setLabourId}
      />
      <Expances
        open={isExpanseModalOpen}
        setOpen={setIsExpanseModalOpen}
        ContractId={contractData?.ContractId}
        fetchData={fetchData}
        fetchDatas={fetchDatas}
        CompanyId={CompanyId}
        ExpenseId={ExpenseId}
        setExpenseId={setExpenseId}
      />
      <Visit
        open={isVisitModalOpen}
        setOpen={setIsVisitModalOpen}
        fetchData={fetchData}
        fetchDatas={fetchDatas}
        contractData={contractData}
        CompanyId={CompanyId}
        ContractId={contractData?.ContractId}
        VisitId={VisitId}
        setVisitId={setVisitId}
        CustomerId={CustomerId}
      />
      <ContractMail
        modal={mail}
        setModal={setMail}
        customerData={contractData?.customer}
        propertyData={contractData?.location}
        Attachment={contractData?.Attachment}
        contractData={contractData}
      />
    </>
  );
};

export default ContractDetails;

import React, { useState } from "react";
import ContractMail from "../ContractMail";
import CustomerModal from "../../Quotes/CustomerModal";
import { FormGroup } from "@mui/material";

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  Table,
} from "reactstrap";
import "./style.css";
import { Grid } from "@mui/material";
import { Row, Col } from "react-bootstrap";

import {
  CalendarJOB,
  InternalNotes,
  OneOffContract,
  RecurringContract,
  Team,
} from "../../../../components/Contract Component/Index";
import InputText from "../../../../components/InputFields/InputText";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import { useLocation, useNavigate } from "react-router-dom";
import Previous from "../../../../assets/image/icons/Previous.png";
import GetProducts from "../../../../components/Materials&Labor/GetMaterialsAndLabor";
import CloseIcon from "@mui/icons-material/Close";
import BlueButton from "../../../../components/Button/BlueButton";
import WhiteButton from "../../../../components/Button/WhiteButton";
import { LoaderComponent } from "../../../../components/Icon/Index";
import { Typography } from "@mui/material";
import DiscountTable from "../../../../components/DiscountTable/DiscountTable";
import showToast from "../../../../components/Toast/Toster";

const AddContract = ({
  lineItems,
  isProperty,
  setIsProperty,
  setIsCustomer,
  isCustomer,
  setPropertyData,
  setCustomersData,
  mail,
  setMail,
  CompanyName,
  customersData,
  contractData,
  propertyData,
  formik,
  formikTeam,
  handleSaveQuote,
  toggle,
  dropdownOpen,
  setLoading,
  loading,
  Total,
  taxAmount,
  discountAmount,
  deleteLineItem,
  subTotal,
  addLineItem,
  showCosts,
  setShowCosts,
  setMenuIsOpen,
  menuIsOpen,
  handleSelectChange,
  setLineItems,
  activeTab,
  setActiveTab,
  handleCahngeIds,
  selectedTeams,
  setSelectedTeams,
  isCalendarVisible,
  setIsCalendarVisible,
  isNumChange,
  setIsNumChange,
  handleContractNumberChange,
  toggleDropdown,
  isDropdownOpen,
  handleOutsideClick,
  teamData,
  checkedState,
  handleRemoveTeam,
  handleTeamSelect,
  toggleModal,
  isModalOpen,
  handlePhoneChange,
  emailData,
  loader,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <>
      {loader ? (
        <Grid
          className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5"
          style={{ height: "70vh" }}
        >
          <LoaderComponent loader={loader} height="50" width="50" />
        </Grid>
      ) : (
        <>
          {/* <Button
            style={{
              marginRight: "10px",
              width: "50px",
              height: "40px",
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
            className="text-capitalize bg-button-blue-color back-button text-white-color "
          >
            <img src={Previous} style={{ width: "20px", height: "20px" }} />
          </Button> */}
          <Button
            style={{
              marginRight: "10px",
              width: "50px",
              height: "40px",
              padding: "0px 0px",
              borderRadius: "4px",
            }}
            onClick={() => {
              if (formik.dirty || lineItems.some((item) => item.isNew)) {
                const confirmLeave = window.confirm(
                  "You have unsaved changes. Are you sure you want to leave?"
                );
                if (!confirmLeave) {
                  return;
                }
              }
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
            className="text-capitalize bg-button-blue-color back-button text-white-color "
          >
            <img src={Previous} style={{ width: "20px", height: "20px" }} />
          </Button>
          <Grid className="justify-content-center align-items-center mb-3 mt-3 quotes job">
            <Card
              className="my-2 col-12 p-4 border-blue-color"
              style={{ borderRadius: "20px" }}
            >
              <Col>
                <CardTitle
                  className="text-blue-color contract-for quoteFor_customerName QuoteForCustomerName "
                  style={{
                    fontSize: "27px",
                    display: "flex",
                    alignItems: "center",
                    fontWeight: 600,
                  }}
                >
                  Contract for
                  <Typography
                    className="d-flex align-items-center"
                    style={{ cursor: "pointer" }}
                    onClick={(e) => {
                      e.preventDefault();
                      setIsCustomer(true);
                    }}
                  >
                    <Typography
                      className="text-blue-color underline-u ContractName contrcatName"
                      style={{
                        paddingLeft: "5px",
                        fontSize: "27px",
                        fontWeight: "600",
                      }}
                    >
                      {customersData?.customer?.FirstName &&
                      customersData?.customer?.LastName
                        ? `${customersData?.customer?.FirstName} ${customersData?.customer?.LastName}`
                        : customersData?.FirstName && customersData?.LastName
                        ? `${customersData?.FirstName} ${customersData?.LastName}`
                        : "Customer Name"}
                    </Typography>

                    {!customersData?.FirstName && (
                      <Button
                        className="mx-3 bg-button-blue-color text-white-color "
                        style={{
                          height: "20px",
                          width: "30px",
                          minWidth: "30px",
                          padding: "0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        +
                      </Button>
                    )}
                  </Typography>
                </CardTitle>
                <Row className="my-3 d-lg-flex d-md-block">
                  <Col lg={6} md={12} sm={12} xl={6}>
                    <Grid>
                      <Label
                        className="text-blue-color"
                        style={{
                          fontSize: "16px",
                          fontWeight: 700,
                        }}
                        for="exampleEmail"
                      >
                        Contract title
                      </Label>

                      <Grid
                        className="contractTitleDescriptionTitle"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "10px",
                        }}
                      >
                        <InputText
                          value={formik?.values?.Title}
                          onChange={formik?.handleChange}
                          onBlur={formik?.handleBlur}
                          error={
                            formik?.touched?.Title &&
                            Boolean(formik?.errors?.Title)
                          }
                          helperText={
                            formik?.touched?.Title && formik?.errors?.Title
                          }
                          name="Title"
                          id="exampleEmail"
                          placeholder="Enter title"
                          label="Title"
                          type="text"
                          className="text-blue-color w-100"
                          fieldHeight="56px"
                        />

                        <InputText
                          value={formik?.values?.Description}
                          onChange={formik?.handleChange}
                          onBlur={formik?.handleBlur}
                          error={
                            formik?.touched?.Description &&
                            Boolean(formik?.errors?.Description)
                          }
                          helperText={
                            formik?.touched?.Description &&
                            formik?.errors?.Description
                          }
                          name="Description"
                          id="description"
                          placeholder="Enter description"
                          label="Description"
                          type="text"
                          className="text-blue-color w-100"
                          fieldHeight="56px"
                        />
                      </Grid>
                    </Grid>
                  </Col>

                  <Col
                    lg={6}
                    md={12}
                    sm={12}
                    className="d-flex  changesinput contractNUmber_doneBtn"
                  >
                    <Col
                      className=" my-3 text-left contractNameINputToWriteHere  QUoteCHangeIcon"
                      style={{ whiteSpace: "nowrap" }}
                      md={6}
                      xl={6}
                    >
                      {!isNumChange ? (
                        <Typography
                          style={{ fontSize: "13px", marginTop: "20px" }}
                          className="text-blue-color fw-medium"
                        >
                          Contract number #
                          {formik?.values?.ContractNumber ||
                            "ContractNumber not available"}
                        </Typography>
                      ) : (
                        <InputText
                          value={formik?.values?.ContractNumber}
                          onChange={(e) => {
                            const value = e?.target?.value;
                            if (value < 0) {
                              e.target.value = 0;
                            }
                            formik?.handleChange(e, "ContractNumber");
                          }}
                          onBlur={formik?.handleBlur}
                          name="ContractNumber"
                          id="ContractNumber"
                          label="Contract Number"
                          type="number"
                          className="text-blue-color w-100 my-3 "
                          fieldHeight="53px"
                        />
                      )}
                    </Col>

                    <Col
                      className="col-3 my-4 text-center changeText  quoteNUmberTOp"
                      md={3}
                      xl={3}
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {!isNumChange ? (
                        <Typography
                          style={{ cursor: "pointer" }}
                          onClick={() => setIsNumChange(true)}
                          className="text-blue-color underline-u"
                        >
                          Change
                        </Typography>
                      ) : (
                        <BlueButton
                          onClick={handleContractNumberChange}
                          className="buttons outline-button-blue-color outline selectclientaddquote bg-blue-color contactNumberCHange selectclientaddquote"
                          label="Done"
                        />
                      )}
                    </Col>
                  </Col>

                  {customersData?.FirstName && (
                    <Col
                      lg={6}
                      md={12}
                      sm={12}
                      xl={6}
                      className="d-flex mt-5 gap-3 contractaddressDetailss"
                      style={{ color: "rgba(6, 49, 100, 1)" }}
                    >
                      <Col
                        className="text-left widthOfdetailFull"
                        md={6}
                        xl={6}
                      >
                        <Typography>
                          <Typography className=" fw-medium">
                            Property address
                          </Typography>
                        </Typography>
                        <Typography>
                          {propertyData?.Address ||
                            (Array.isArray(customersData?.location) &&
                            customersData.location.length > 0
                              ? customersData.location[0]?.Address
                              : undefined) ||
                            customersData?.location?.Address ||
                            "Address not available"}
                          ,
                          <br />
                          {propertyData?.City ||
                            (Array.isArray(customersData?.location) &&
                            customersData.location.length > 0
                              ? customersData.location[0]?.City
                              : undefined) ||
                            customersData?.location?.City ||
                            "-"}{" "}
                          {propertyData?.State ||
                            (Array.isArray(customersData?.location) &&
                            customersData.location.length > 0
                              ? customersData.location[0]?.State
                              : undefined) ||
                            customersData?.location?.State ||
                            "-"}{" "}
                          ,
                          {propertyData?.Zip ||
                            (Array.isArray(customersData?.location) &&
                            customersData.location.length > 0
                              ? customersData.location[0]?.Zip
                              : undefined) ||
                            customersData?.location?.Zip ||
                            "-"}
                          ,
                          <br />
                          {propertyData?.Country ||
                            (Array.isArray(customersData?.location) &&
                            customersData.location.length > 0
                              ? customersData.location[0]?.Country
                              : undefined) ||
                            customersData?.location?.Country ||
                            "-"}{" "}
                          <br />
                          <a
                            onClick={(e) => {
                              e.preventDefault();
                              setIsCustomer(true);
                            }}
                            style={{ color: "green", cursor: "pointer" }}
                            href="#customer-section"
                          >
                            Change
                          </a>
                        </Typography>
                      </Col>
                      <Col
                        className=" text-left widthOfdetailFull"
                        md={6}
                        xl={6}
                      >
                        <Typography className=" fw-medium">
                          Contact details
                        </Typography>
                        <Typography>
                          {console.log(customersData, "customersData1234321")}
                          {customersData?.PhoneNumber || "-"}
                          <br />
                          {customersData?.EmailAddress || "-"}
                          {console.log(
                            emailData?.EmailAddress,
                            "customersData?.EmailAddress"
                          )}
                        </Typography>
                      </Col>
                    </Col>
                  )}
                </Row>
                <Row className="schedule-section-main my-3">
                  <Col lg={6} md={12} xl={6} className="schedule-section-left">
                    <Typography
                      className="text-blue-color typeContractAddSpacing heading-five"
                      style={{
                        fontWeight: 600,
                        fontSize: "20px",
                        marginTop: "30px",
                        marginBottom: "20px",
                      }}
                    >
                      Type <HelpOutlineOutlinedIcon className="mx-1" />
                    </Typography>

                    <Grid
                      className="toggle-button"
                      style={{ width: "fit-content" }}
                    >
                      <Nav
                        className="oneOffContarct_btn"
                        tabs
                        style={{
                          borderRadius: "15px",
                          border: "1px solid",
                          marginBottom: "15px",
                        }}
                      >
                        <NavItem className="on-off-contract outline oneoffsetBtnHereTonav">
                          <NavLink
                            className={`${
                              activeTab === 1 ? "active" : ""
                            } outline contract oneOffContract oneOffContrctForHide oneOffJobHere opv1`}
                            onClick={() => setActiveTab(1)}
                            style={{
                              backgroundColor:
                                activeTab === 1 ? "red" : "transparent",
                              color: activeTab === 2 ? "#063164" : "black",
                              borderTopLeftRadius: "11px",
                              borderBottomLeftRadius: "11px",
                              borderTopRightRadius: "0",
                              borderBottomRightRadius: "0",
                              marginBottom: 0,
                              width: "100%",
                              cursor: "pointer",
                            }}
                          >
                            One-off Contract
                          </NavLink>
                        </NavItem>
                        <NavItem className="recurring recuringForHideCalDn">
                          <NavLink
                            className={`${
                              activeTab === 2 ? "active" : ""
                            } outline contract recurring_nav`}
                            onClick={() => setActiveTab(2)}
                            style={{
                              backgroundColor:
                                activeTab === 2 ? "red" : "transparent",
                              color: activeTab === 1 ? "#063164" : "black",
                              borderTopRightRadius: "11px",
                              borderBottomRightRadius: "11px",
                              borderTopLeftRadius: "0",
                              borderBottomLeftRadius: "0",
                              width: "100%",
                              cursor: "pointer",
                            }}
                          >
                            Recurring Contract
                          </NavLink>
                        </NavItem>
                      </Nav>
                    </Grid>

                    {activeTab === 1 && (
                      <OneOffContract
                        formik={formik}
                        isCalendarVisible={isCalendarVisible}
                        setIsCalendarVisible={setIsCalendarVisible}
                      />
                    )}
                    {activeTab === 2 && (
                      <RecurringContract
                        formik={formik}
                        isCalendarVisible={isCalendarVisible}
                        setIsCalendarVisible={setIsCalendarVisible}
                      />
                    )}
                  </Col>
                  {isCalendarVisible && (
                    <Col
                      lg={6}
                      md={12}
                      xl={6}
                      className="firstt-tab-cal  my-3 mb-0"
                    >
                      {isCalendarVisible && (
                        <CalendarJOB
                          isCalendarVisible={isCalendarVisible}
                          setIsCalendarVisible={setIsCalendarVisible}
                          selectedTeams={selectedTeams}
                          setSelectedTeams={setSelectedTeams}
                        />
                      )}
                    </Col>
                  )}
                  <Col
                    className=" teamAssignBox"
                    md={6}
                    xl={6}
                    style={{ marginTop: isCalendarVisible ? "0px" : "136px" }}
                  >
                    <Grid className="jobs">
                      <Grid className="team-card" style={{ width: "100%" }}>
                        <Card
                          style={{ height: "140px" }}
                          className="teamAndAssign border-blue-color"
                        >
                          <CardHeader
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              borderBottom: "none",
                              background: "none",
                            }}
                            className="team-header"
                          >
                            <Typography
                              className="text-blue-color heading-three"
                              style={{ fontWeight: 600 }}
                            >
                              Team
                            </Typography>
                            <Grid className="assignbtn">
                              <BlueButton
                                className="bg-blue-color text-white-color "
                                outline
                                style={{
                                  padding: "0 14px 0 14px",
                                  fontSize: "12px",
                                  marginTop: 0,
                                  height: "32px",
                                }}
                                onClick={toggleDropdown}
                                label="+ Assign"
                              />
                              {isDropdownOpen && (
                                <Grid
                                  maxWidth="md"
                                  fullWidth
                                  className="assigndrop"
                                  style={{
                                    position: "absolute",
                                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                                    borderRadius: "4px",
                                    marginTop: "10px",
                                    padding: "10px",
                                    zIndex: 1000,
                                    right: 0,
                                  }}
                                >
                                  <Card
                                    style={{
                                      height: "300px",
                                    }}
                                  >
                                    <CardHeader
                                      className="text-blue-color borerBommoModel"
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        fontSize: "18px",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      Select team
                                      <CloseIcon
                                        onClick={toggleDropdown}
                                        style={{ cursor: "pointer" }}
                                      />
                                    </CardHeader>
                                    <CardBody
                                      style={{
                                        scrollbarWidth: "thin",
                                        overflowY: "auto",
                                        height: "100px",
                                      }}
                                    >
                                      <Grid onClick={handleOutsideClick}>
                                        {teamData && teamData?.length > 0 ? (
                                          teamData.map((person) => (
                                            <FormGroup
                                              check
                                              className="my-3 mb-0"
                                              key={person.WorkerId}
                                            >
                                              <Input
                                                type="checkbox"
                                                checked={
                                                  checkedState &&
                                                  !!checkedState[person?.UserId]
                                                }
                                                onChange={(e) =>
                                                  handleTeamSelect(e, person)
                                                }
                                              />

                                              <Label
                                                style={{
                                                  fontSize: "16px",
                                                  color: "rgba(6,49,100,0.7)",
                                                  fontWeight: "400",
                                                  marginBottom: 0,
                                                }}
                                              >
                                                {person?.FirstName}
                                                {person?.LastName}{" "}
                                              </Label>
                                              <Label
                                                style={{
                                                  fontSize: "16px",
                                                  color: "rgba(6,49,100,0.7)",
                                                  fontWeight: "400",
                                                  marginBottom: 0,
                                                }}
                                              >
                                                <span>
                                                  {" "}
                                                  ( {person?.EmailAddress} )
                                                </span>
                                              </Label>
                                            </FormGroup>
                                          ))
                                        ) : (
                                          <Typography>
                                            No team members found.
                                          </Typography>
                                        )}
                                      </Grid>

                                      <hr />
                                    </CardBody>
                                    <CardFooter>
                                      <BlueButton
                                        className="text-blue-color text-white-color text-white-color bg-button-blue-color"
                                        style={{
                                          border: "none",
                                          fontWeight: "400",
                                          padding: "8px",
                                          fontSize: "12px",
                                        }}
                                        onClick={toggleModal}
                                        label="+ Create Worker"
                                      />
                                    </CardFooter>
                                  </Card>
                                  <Modal
                                    isOpen={isModalOpen}
                                    toggle={toggleModal}
                                  >
                                    <ModalHeader
                                      toggle={toggleModal}
                                      className="text-blue-color borerBommoModel"
                                      style={{
                                        fontSize: "18px",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      Add new worker
                                    </ModalHeader>
                                    <ModalBody
                                      className="nozindex"
                                      style={{ borderBottom: "none" }}
                                    >
                                      {/* <FormGroup>
                                        <Input
                                          name="FullName"
                                          placeholder="Enter full name"
                                          type="text"
                                          className="text-blue-color w-100 mb-3  border-blue-color"
                                          value={formikTeam?.values?.FullName}
                                          onChange={formikTeam?.handleChange}
                                          onBlur={formikTeam?.handleBlur}
                                          invalid={
                                            formikTeam?.touched?.FullName &&
                                            Boolean(
                                              formikTeam?.errors?.FullName
                                            )
                                          }
                                        />
                                        {formikTeam?.touched?.FullName &&
                                        formikTeam?.errors?.FullName ? (
                                          <Grid className="text-danger AdduserModelBox">
                                            {formikTeam?.errors?.FullName}
                                          </Grid>
                                        ) : null}
                                      </FormGroup> */}
                                      <Grid className="d-flex  justify-content-between  gap-2">
                                        <Input
                                          name="FirstName"
                                          placeholder="Enter FirstName"
                                          type="text"
                                          className="text-blue-color w-100 mb-3  border-blue-color"
                                          value={formikTeam?.values?.FirstName}
                                          onChange={formikTeam?.handleChange}
                                          onBlur={formikTeam?.handleBlur}
                                          invalid={
                                            formikTeam?.touched?.FirstName &&
                                            Boolean(
                                              formikTeam?.errors?.FirstName
                                            )
                                          }
                                        />
                                        {formikTeam?.touched?.FirstName &&
                                        formikTeam?.errors?.FirstName ? (
                                          <Grid className="text-danger AdduserModelBox">
                                            {formikTeam?.errors?.FirstName}
                                          </Grid>
                                        ) : null}

                                        <Input
                                          name="LastName"
                                          placeholder="Enter LastName"
                                          type="text"
                                          className="text-blue-color w-100 mb-3  border-blue-color"
                                          value={formikTeam?.values?.LastName}
                                          onChange={formikTeam?.handleChange}
                                          onBlur={formikTeam?.handleBlur}
                                          invalid={
                                            formikTeam?.touched?.LastName &&
                                            Boolean(
                                              formikTeam?.errors?.LastName
                                            )
                                          }
                                        />
                                        {formikTeam?.touched?.LastName &&
                                        formikTeam?.errors?.LastName ? (
                                          <Grid className="text-danger AdduserModelBox">
                                            {formikTeam?.errors?.LastName}
                                          </Grid>
                                        ) : null}
                                      </Grid>
                                      <FormGroup className="AdduserModelBoxes">
                                        <Input
                                          name="EmailAddress"
                                          placeholder="Enter Email Address"
                                          type="text"
                                          className="text-blue-color w-100 mb-3 border-blue-color"
                                          value={
                                            formikTeam?.values?.EmailAddress
                                          }
                                          onChange={formikTeam?.handleChange}
                                          onBlur={formikTeam?.handleBlur}
                                          invalid={
                                            formikTeam?.touched?.EmailAddress &&
                                            Boolean(
                                              formikTeam?.errors?.EmailAddress
                                            )
                                          }
                                        />
                                        {formikTeam?.touched?.EmailAddress &&
                                        formikTeam?.errors?.EmailAddress ? (
                                          <Grid className="text-danger AdduserModelBox">
                                            {formikTeam?.errors?.EmailAddress}
                                          </Grid>
                                        ) : null}
                                      </FormGroup>
                                      <FormGroup className="AdduserModelBoxes">
                                        <Input
                                          name="MobileNumber"
                                          placeholder="Enter mobile number"
                                          type="text"
                                          className="text-blue-color w-100 mb-3 border-blue-color"
                                          value={
                                            formikTeam?.values?.MobileNumber
                                          }
                                          onChange={handlePhoneChange}
                                          onBlur={formikTeam?.handleBlur}
                                          invalid={
                                            formikTeam?.touched?.MobileNumber &&
                                            Boolean(
                                              formikTeam?.errors?.MobileNumber
                                            )
                                          }
                                        />
                                        {formikTeam?.touched?.MobileNumber &&
                                        formikTeam?.errors?.MobileNumber ? (
                                          <div className="text-danger">
                                            {formikTeam?.errors?.MobileNumber}
                                          </div>
                                        ) : null}
                                      </FormGroup>
                                    </ModalBody>
                                    <ModalFooter className="adduserModelTop justify-content-between">
                                      <WhiteButton
                                        onClick={() => {
                                          formikTeam.resetForm();
                                          toggleModal();
                                        }}
                                        label="Cancel"
                                      />
                                      {loading ? (
                                        <Grid className="d-flex justify-content-center">
                                          <LoaderComponent
                                            loader={loader}
                                            height="20"
                                            width="20"
                                          />
                                        </Grid>
                                      ) : (
                                        <BlueButton
                                          className="svaeUserModelWidth"
                                          onClick={formikTeam?.handleSubmit}
                                          label="Save worker"
                                        />
                                      )}
                                    </ModalFooter>
                                  </Modal>
                                </Grid>
                              )}
                            </Grid>
                          </CardHeader>
                          <CardBody
                            className="addignTeamOvefFlowWidth"
                            style={{ maxHeight: "100px", overflowY: "auto" }}
                          >
                            <Grid
                              style={{ marginTop: "-10px", height: "18px" }}
                              className="assingPersoneSeeHereToAssign"
                            >
                              {selectedTeams?.map((team, index) => (
                                <Grid
                                  key={index}
                                  className="tag assignPersonNameHereTo"
                                  style={{
                                    marginTop: "6px",
                                    marginLeft: "10px",
                                    gap: "10px",
                                  }}
                                >
                                  <Typography
                                    className="tag-text"
                                    style={{ fontSize: "16px" }}
                                  >
                                    <span>
                                      {`${team?.FirstName} ${team?.LastName}` ||
                                        "FullName not available"}{" "}
                                      -{" "}
                                      {team?.EmailAddress ||
                                        "EmailAddress not available"}
                                    </span>
                                  </Typography>
                                  <button
                                    className="tag-close"
                                    onClick={() => handleRemoveTeam(team)}
                                    label={"x"}
                                  >
                                    {" "}
                                    <span style={{ marginTop: "-1px" }}>
                                      x{" "}
                                    </span>{" "}
                                  </button>
                                </Grid>
                              ))}
                            </Grid>
                          </CardBody>
                        </Card>
                      </Grid>
                    </Grid>
                  </Col>
                </Row>
                {/* 
                {activeTab === 2 ? (
                  <Card
                    className="p-3 my-3 border-blue-color"
                    style={{
                      paddingRight: "30px",
                      border: "1px solid ",
                      marginBottom: "15px",
                    }}
                  >
                    <Typography
                      className="text-blue-color heading-four"
                      style={{ fontWeight: 600 }}
                    >
                      Invoicing
                    </Typography>
                    <Row className="d-flex row">
                      <Col className="col-lg-5" md={5} xl={5}>
                        <Grid>
                          <Typography
                            style={{
                              fontSize: "16px",
                              fontWeight: "600",
                              marginBottom: "0px",
                            }}
                            className="text-blue-color "
                          >
                            How do you want to invoice?
                          </Typography>
                          <Grid className="d-flex gap-4 contractInvoicePerVisit">
                            <Grid
                              className="text-blue-color"
                              style={{
                                fontSize: "16px",
                                fontWeight: "400",
                                alignItems: "center",
                              }}
                            >
                              <Input type="radio" name="radio" value="yes" />{" "}
                              Per Visit
                            </Grid>
                            <Grid
                              className="text-blue-color"
                              style={{
                                fontSize: "16px",
                                fontWeight: "400",
                                alignItems: "center",
                              }}
                            >
                              <Input type="radio" name="radio" value="no" />{" "}
                              Fixed Price
                            </Grid>
                          </Grid>
                        </Grid>

                        <Grid className="mt-3">
                          <Typography
                            style={{
                              fontSize: "16px",
                              fontWeight: "600",
                              marginBottom: "0px",
                            }}
                            className="text-blue-color "
                          >
                            When do you want to invoice?
                          </Typography>
                          <Grid className="mt-1">
                            <Input
                              type="select text-blue-color"
                              style={{
                                fontSize: "14px",
                                border: "1px solid rgba(6, 49, 100, 30%)",
                                borderRadius: "10px",
                                fontSize: "12px",
                                width: "70%",
                              }}
                            >
                              <option value="">
                                Monthly on the last day of mont
                              </option>
                            </Input>
                          </Grid>
                        </Grid>
                        <Grid className="mt-3">
                          <Label
                            className="my-2 text-blue-color"
                            for="exampleEmail"
                            style={{
                              fontWeight: 600,
                              fontSize: "16px",
                            }}
                          >
                            Visits
                          </Label>
                          <Grid className="d-flex">
                            <Col
                              className="col-4 text-blue-color"
                              style={{
                                borderRight: "0.5px solid rgba(6,49,100, 0.8)",
                              }}
                              md={4}
                              xl={4}
                            >
                              <Typography
                                className="mb-0 text-blue-color"
                                style={{ fontSize: "12px", marginRight: "0px" }}
                              >
                                First
                              </Typography>
                              <Typography
                                className="mb-0 text-blue-color"
                                style={{ fontSize: "12px" }}
                              >
                                May 21, 2024
                              </Typography>
                            </Col>
                            <Col
                              className=" mx-0"
                              style={{
                                borderRight:
                                  "0.5px solid rgba(6, 49, 100, 30%)",
                              }}
                              md={4}
                              xl={4}
                            >
                              <Typography
                                className="mb-0 text-blue-color"
                                style={{ fontSize: "12px", marginLeft: "5px" }}
                              >
                                Last
                              </Typography>
                              <Typography
                                className="mb-0 text-blue-color"
                                style={{ fontSize: "12px", marginLeft: "5px" }}
                              >
                                May 21, 2024
                              </Typography>
                            </Col>
                            <Grid className="col-4 mx-1">
                              <Typography
                                className="mb-0 text-blue-color"
                                style={{ fontSize: "12px" }}
                              >
                                Total
                              </Typography>
                              <Typography
                                className="mb-0 text-blue-color"
                                style={{ fontSize: "12px" }}
                              >
                                27
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Col>
                      <Col className="col-lg-7" md={7} xl={7}>
                        <Grid style={{ width: "100%" }}>
                          <Grid className="d-flex justify-content-between">
                            <Typography
                              style={{
                                fontSize: "16px",
                                fontWeight: "600",
                                marginBottom: "0px",
                              }}
                              className="text-blue-color "
                            >
                              Automatically pay invoices
                            </Typography>
                            <Grid style={{ marginRight: "18%" }}>
                              <FormGroup
                                switch
                                className="my-3 automaticalliyPayCheckBoxHere"
                              >
                                <Input
                                  type="switch"
                                  style={{ cursor: "pointer" }}
                                />
                              </FormGroup>
                            </Grid>
                          </Grid>
                          <Grid>
                            <Typography
                              style={{
                                fontSize: "12px",
                                fontWeight: "400",
                                marginTop: "5px",
                              }}
                              className="text-blue-color "
                            >
                              Automatic payments will be enabled as soon as your
                              Customer adds a payment method. Learn more in{" "}
                              <Typography
                                style={{
                                  fontSize: "16px",
                                  textDecoration: "underline",
                                }}
                                className="text-blue-color "
                              >
                                Help Center
                              </Typography>
                              .
                            </Typography>
                          </Grid>
                        </Grid>
                        <Grid
                          style={{ width: "60%" }}
                          className="noPaymentMethodAndPara"
                        >
                          <Typography
                            style={{
                              fontSize: "16px",
                              fontWeight: "600",
                              marginBottom: "0px",
                            }}
                            className="text-blue-color "
                          >
                            No payment methods on file
                          </Typography>
                          <Typography
                            style={{
                              fontSize: "12px",
                              fontWeight: "400",
                              marginTop: "5px",
                            }}
                            className="text-blue-color "
                          >
                            Your customer can save a payment method when they
                            make their first payment.
                          </Typography>
                        </Grid>
                      </Col>
                    </Row>
                  </Card>
                ) : null} */}
                <Card
                  className="p-3 my-4 border-blue-color"
                  style={{
                    paddingRight: "30px",
                    border: "1px solid ",
                    marginBottom: "15px",
                  }}
                >
                  <Typography
                    className="text-blue-color heading-four"
                    style={{ fontWeight: 600 }}
                  >
                    Line Items
                  </Typography>
                  <Grid
                    className="getproduct-mamin"
                    style={{
                      // maxHeight: "500px",
                      // overflowY: "auto",
                      padding: "10px",
                      // overflowX: "hidden",
                      // scrollbarWidth: "thin",
                    }}
                  >
                    {lineItems.map((item, index) => (
                      <React.Fragment key={index}>
                        <GetProducts
                          item={item}
                          index={index}
                          handleSelectChange={handleSelectChange}
                          lineItems={lineItems}
                          setLineItems={setLineItems}
                          showCosts={showCosts}
                          setShowCosts={setShowCosts}
                          menuIsOpen={menuIsOpen}
                          setMenuIsOpen={setMenuIsOpen}
                          deleteLineItem={deleteLineItem}
                        />
                      </React.Fragment>
                    ))}
                  </Grid>
                  <Grid
                    className="d-flex justify-content-between align-items-center mb-0 pb-0 newlineitem"
                    style={{
                      marginTop: "20px",
                      background: "none",
                      border: "none",
                    }}
                  >
                    <BlueButton
                      className="bg-button-blue-color addnewline text-white-color"
                      outline
                      style={{
                        padding: "0 14px 0 14px",
                        fontSize: "12px",
                        marginTop: 0,
                        height: "32px",
                        fontWeight: "400",
                      }}
                      onClick={addLineItem}
                      label="+ New Line Item"
                    />
                    <Grid>
                      <Grid className="d-flex align-items-center  line-items-total ">
                        <Typography
                          style={{ fontWeight: 600 }}
                          className=" text-blue-color"
                        >
                          Total price
                        </Typography>
                        <Typography
                          className="mx-2 text-blue-color"
                          style={{ fontWeight: 600 }}
                        >
                          {`$${new Intl.NumberFormat("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(subTotal ?? 0)}`}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid className="d-flex justify-content-end subTotal_totalBox">
                    <Col
                      className="col-7 mt-3  order-sm-2 subTotal_totalBoxColBox"
                      md={7}
                      xl={7}
                    >
                      <DiscountTable
                        subTotal={subTotal}
                        discountAmount={discountAmount}
                        taxAmount={taxAmount}
                        Total={Total}
                        formik={formik}
                      />
                    </Col>
                  </Grid>
                </Card>

                <InternalNotes
                  Total={0}
                  notes={formik?.values?.Notes}
                  setNotes={(value) => formik.setFieldValue("Notes", value)}
                  attachments={formik?.values?.Attachment}
                  setAttachments={(value) =>
                    formik.setFieldValue("Attachment", value)
                  }
                />
                <Grid
                  className="d-flex justify-content-between  BlueAndWhiteBtmFlex buttonfromresponsive"
                  style={{ marginTop: "80px", gap: "10px" }}
                >
                  <WhiteButton onClick={() => navigate(-1)} label="Cancel" />
                  <Grid className="">
                    {customersData && Object.keys(customersData).length > 0 ? (
                      loading ? (
                        <LoaderComponent
                          loading={loading}
                          height="20"
                          width="20"
                        />
                      ) : (
                        <Grid className="gap-3 d-flex sec-button-section updateSaveBtnNaviGate buttonfromresponsive">
                          <BlueButton
                            outline
                            // disabled={
                            //   !(
                            //     formik?.values?.Title &&
                            //     lineItems?.length > 0 &&
                            //     lineItems[0]?.Name !== ""
                            //   )
                            // }
                            disabled={
                              !(
                                formik?.values?.Title &&
                                lineItems?.length > 0 &&
                                lineItems.every((item) => !!item?.Name)
                              )
                            }
                            className="buttons outline-button-blue-color outline text-blue-color"
                            // onClick={async (e) => {
                            //   e.preventDefault();

                            //   const isValid = await formik.validateForm();
                            //   formik.setTouched({
                            //     Title: true,
                            //     Description: true,
                            //   });
                            //   if (
                            //     Object.keys(isValid).length === 0 &&
                            //     formik?.values?.Title
                            //   ) {
                            //     setLoading(true);
                            //     await handleSaveQuote(false);
                            //   } else {
                            //     showToast.error("Please Fill Required Fields");
                            //   }
                            // }}
                            onClick={async (e) => {
                              e.preventDefault();
                              setLoading(true);
                              await handleSaveQuote(false);
                              setLoading(false);
                            }}
                            label={
                              location.state?.id
                                ? "Update Contract"
                                : "Save Contract"
                            }
                          />
                          <Dropdown
                            isOpen={dropdownOpen}
                            toggle={toggle}
                            style={{ zIndex: "9" }}
                          >
                            <DropdownToggle
                              className="bg-blue-color saveContractToget"
                              caret
                              // disabled={
                              //   !(
                              //     formik?.values?.Title &&
                              //     lineItems?.length > 0 &&
                              //     lineItems.every((item) => item?.Name !== "")
                              //   )
                              // }
                            >
                              Save &{" "}
                            </DropdownToggle>
                            <DropdownMenu>
                              <DropdownItem
                                onClick={() => {
                                  setMail(true);
                                }}
                                disabled={
                                  !(
                                    formik?.values?.Title &&
                                    lineItems?.length > 0 &&
                                    lineItems.every((item) => !!item?.Name)
                                  )
                                }
                              >
                                Save & Send Mail
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </Grid>
                      )
                    ) : (
                      <Grid>
                        <BlueButton
                          onClick={(e) => {
                            e.preventDefault();
                            setIsCustomer(true);
                          }}
                          label="Select Customer"
                          className="buttons outline-button-blue-color outline selectclientaddquote bg-blue-color text-white-color 10 selectCustomerTOAddcustomet selectCustomerBtnNavigate"
                        />
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              </Col>
            </Card>
          </Grid>
        </>
      )}
      <CustomerModal
        isCustomer={isCustomer}
        setIsCustomer={setIsCustomer}
        isProperty={isProperty}
        setIsProperty={setIsProperty}
        setFieldValue={formik.setFieldValue}
        values={formik.values}
        lineItems={lineItems}
        propertyData={propertyData}
        setPropertyData={setPropertyData}
        customersData={customersData}
        setCustomersData={setCustomersData}
        formik={formik}
      />
      <ContractMail
        modal={mail}
        setModal={setMail}
        contractData={contractData}
        propertyData={propertyData}
        customerData={customersData}
        Total={Total}
        taxAmount={taxAmount}
        discountAmount={discountAmount}
        subTotal={subTotal}
        formik={formik.values}
        handleSubmit={handleSaveQuote}
      />
    </>
  );
};

export default AddContract;

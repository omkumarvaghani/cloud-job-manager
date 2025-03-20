import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
  } from "@mui/material";
  import { useFormik } from "formik";
  import * as yup from "yup";
  import React, { useState } from "react";
  import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Input,
  } from "reactstrap";
  import { ToastContainer, toast } from "react-toastify";
  import "react-toastify/dist/ReactToastify.css";
import AxiosInstance from "../../Views/AxiosInstance";
  
  function AccountDialog(props) {
    const baseUrl = process.env.REACT_APP_BASE_URL;
  
    const [selectedAccountType, setselectedAccountType] = useState("");
    const [selectedFundType, setselectedFundType] = useState("");
    const [selectAccountDropDown, setSelectAccountDropDown] = useState(false);
    const [selectFundTypeDropDown, setSelectFundTypeDropDown] = useState(false);
  
    const toggles = () => setSelectAccountDropDown(!selectAccountDropDown);
  
    const toggles2 = () => setSelectFundTypeDropDown(!selectFundTypeDropDown);
  
    const hadleselectedAccountType = (account_type) => {
      setselectedAccountType(account_type);
      accountFormik.setFieldValue("account_type", account_type);
    };
  
    const hadleselectedFundType = (fund_type) => {
      setselectedFundType(fund_type);
      accountFormik.setFieldValue("fund_type", fund_type);
    };
  
    let accountFormik = useFormik({
      initialValues: {
        account: "",
        account_type: "",
        fund_type: "",
        charge_type: props.accountTypeName || "",
        notes: "",
      },
      validationSchema: yup.object({
        account: yup.string().required("Please enter account name"),
        account_type: yup.string().required("Please select account type"),
        fund_type: yup.string().required("Please select fund type"),
      }),
      onSubmit: (values) => {
        handleAdd(values);
        accountFormik.resetForm();
      },
    });
  
    const handleAdd = async (values) => {
      const object = {
        ...values,
        charge_type: props.accountTypeName,
        admin_id: props.adminId,
      };
      try {
        const res = await AxiosInstance.post(`/accounts/accounts`, object);
        if (res.status === 200) {
          toast.success("New Account Added", {
            position: "top-center",
            autoClose: 1000,
          });
          accountFormik.resetForm();
          setselectedAccountType("");
          setselectedFundType("");
          props.setAddBankAccountDialogOpen(false);
          props.fetchAccounts();
        } else {
          toast.error(res.data.message, {
            position: "top-center",
            autoClose: 1000,
          });
        }
      } catch (error) {
        if (error.response.status === 400) {
          toast.warning("Account already exists", {
            position: "top-center",
            autoClose: 1000,
          });
        }
        accountFormik.resetForm();
        setselectedAccountType("");
        setselectedFundType("");
      }
    };
  
    return (
      <Dialog
        open={props.addBankAccountDialogOpen}
        onClose={() => {
          props.setAddBankAccountDialogOpen(false);
          setselectedAccountType("");
          setselectedFundType("");
        }}
      >
        <DialogTitle
          className="labelfontstyle"
          style={{
            color: "#152B51",
            fontFamily: "Poppins",
            fontSize: "18px",
            fontWeight: "500",
          }}
        >
          Add account
        </DialogTitle>
        <DialogContent
          style={{
            width: "100%",
            maxWidth: "500px",
          }}
        >
          <div className="formInput" style={{ margin: "10px 10px" }}>
            <label
              className="form-control-label titleecolor fontstylerentr"
              htmlFor="input-address"
              style={{
                fontFamily: "Poppins",
                fontSize: "16px",
                fontWeight: "500",
              }}
            >
              Account Name *
            </label>
            <br />
            <Input
              style={{
                boxShadow: " 0px 4px 4px 0px #00000040 ",
                borderRadius: "6px",
              }}
              className="form-control-alternative fontstylerentr titleecolor"
              id="input-accname"
              placeholder="Enter account name"
              type="text"
              name="account"
              onBlur={accountFormik.handleBlur}
              onChange={accountFormik.handleChange}
              value={accountFormik.values.account}
            />
            {accountFormik.touched.account && accountFormik.errors.account ? (
              <div className="requiredstylefont" style={{ color: "red" }}>
                {accountFormik.errors.account}
              </div>
            ) : null}
          </div>
  
          <div className="formInput" style={{ margin: "30px 10px" }}>
            <label
              className="form-control-label titleecolor fontstylerentr"
              htmlFor="input-address"
              style={{
                fontFamily: "Poppins",
                fontSize: "16px",
                fontWeight: "500",
              }}
            >
              Account Type
            </label>
            <br />
            <Dropdown
              className="dropdownfontsyle"
              isOpen={selectAccountDropDown}
              toggle={toggles}
            >
              <DropdownToggle
                className="dropdownfontsyle titleecolor"
                caret
                style={{
                  width: "100%",
                  boxShadow: " 0px 4px 4px 0px #00000040",
                  border: "1px solid #ced4da",
                  backgroundColor: "transparent",
                }}
              >
                {selectedAccountType ? selectedAccountType : "Select"}
              </DropdownToggle>
              <DropdownMenu
                className="dropdownfontsyle"
                style={{ width: "100%" }}
                name="rent_cycle"
                onBlur={accountFormik.handleBlur}
                onChange={accountFormik.handleChange}
                value={accountFormik.values.account_type}
              >
                <DropdownItem
                  className="dropdownfontsyle"
                  onClick={() => hadleselectedAccountType("Income")}
                >
                  Income
                </DropdownItem>
                <DropdownItem
                  className="dropdownfontsyle"
                  onClick={() => hadleselectedAccountType("Non Operating Income")}
                >
                  Non Operating Income
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
  
          <div className="formInput" style={{ margin: "30px 10px" }}>
            <label
              className="form-control-label fontstylerentr titleecolor"
              htmlFor="input-address"
              style={{
                fontFamily: "Poppins",
                fontSize: "16px",
                fontWeight: "500",
              }}
            >
              Fund Type
            </label>
            <br />
            <Dropdown
              className="dropdownfontsyle"
              isOpen={selectFundTypeDropDown}
              toggle={toggles2}
            >
              <DropdownToggle
                className="dropdownfontsyle titleecolor"
                caret
                style={{
                  width: "100%",
                  boxShadow: " 0px 4px 4px 0px #00000040",
                  border: "1px solid #ced4da",
                  backgroundColor: "transparent",
                }}
              >
                {selectedFundType ? selectedFundType : "Select"}
              </DropdownToggle>
              <DropdownMenu
                className="dropdownfontsyle"
                style={{ width: "100%" }}
                name="fund_type"
                onBlur={accountFormik.handleBlur}
                onChange={accountFormik.handleChange}
                value={accountFormik.values.fund_type}
              >
                <DropdownItem
                  className="dropdownfontsyle"
                  onClick={() => hadleselectedFundType("Reserve")}
                >
                  Reserve
                </DropdownItem>
                <DropdownItem
                  className="dropdownfontsyle"
                  onClick={() => hadleselectedFundType("Operating")}
                >
                  Operating
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
          <div />
          <div className="formInput" style={{ margin: "10px 10px" }}>
            <label
              className="form-control-label fontstylerentr titleecolor"
              htmlFor="input-address"
              style={{
                fontFamily: "Poppins",
                fontSize: "16px",
                fontWeight: "500",
              }}
            >
              Notes
            </label>
            <br />
            <Input
              style={{
                boxShadow: " 0px 4px 4px 0px #00000040 ",
                borderRadius: "6px",
              }}
              className="form-control-alternative fontstylerentr titleecolor"
              id="input-accname"
              placeholder="Enter notes"
              type="text"
              name="notes"
              onBlur={accountFormik.handleBlur}
              onChange={accountFormik.handleChange}
              value={accountFormik.values.notes}
            />
            {accountFormik.touched.notes && accountFormik.errors.notes ? (
              <div className="requiredstylefont" style={{ color: "red" }}>
                {accountFormik.errors.notes}
              </div>
            ) : null}
          </div>
  
          <div
            className="formInput fontstylerentr"
            style={{
              fontFamily: "Poppins",
              fontSize: "14px",
              fontWeight: "600",
              color: "#152B514D",
              margin: "30px 10px",
            }}
          >
            We stores this information{" "}
            <b
              className="labelfontstyle"
              style={{
                color: "#152B51",
                fontSize: "15px",
              }}
            >
              Privately
            </b>{" "}
            and{" "}
            <b
              className="labelfontstyle"
              style={{
                color: "#152B51",
                fontSize: "15px",
              }}
            >
              Securely
            </b>
            .
          </div>
        </DialogContent>
        <div className="d-flex justify-content-start ml-4 mb-3 ">
          <DialogActions>
            <Button
              className="fontstylerentr"
              onClick={() => {
                accountFormik.handleSubmit();
              }}
              style={{
                background: "#152B51",
                color: "white",
                fontFamily: "Poppins",
                fontWeight: "500",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Add
            </Button>
            <Button
              className="fontstylerentr"
              onClick={() => {
                props.setAddBankAccountDialogOpen(false);
                setselectedAccountType("");
                setselectedFundType("");
              }}
              style={{
                background: "white",
                color: "#152B51",
                fontFamily: "Poppins",
                fontWeight: "500",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Cancel
            </Button>
          </DialogActions>
        </div>
        {/* <ToastContainer /> */}
      </Dialog>
    );
  }
  
  export default AccountDialog;
  
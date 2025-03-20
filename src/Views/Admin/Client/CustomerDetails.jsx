import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { handleAuth } from "../../../components/Login/Auth";
import AxiosInstance from "../../AxiosInstance";
import sendToast from "../../../components/Toast/sendToast";
import CustomerDetailsViews from "./Views/CustomerDetails";
import sendSwal from "../../../components/Swal/sendSwal";
import RequestQuoteOutlinedIcon from "@mui/icons-material/RequestQuoteOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import FileCopyOutlinedIcon from "@mui/icons-material/FileCopyOutlined";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import showToast from "../../../components/Toast/Toster";
import { useFormik } from "formik";
import * as Yup from "yup";

function CustomerDetails() {
  useEffect(() => {
    handleAuth(navigate, location);
  }, []);
  const cdnUrl = process.env.REACT_APP_CDN_API;

  const location = useLocation();
  const navigate = useNavigate();
  const { companyName } = useParams();
  const [data, setData] = useState();
  const [open, setOpen] = useState({ isOpen: false, propertyData: null });
  const [loader, setLoader] = useState(true);
  const [modelOpen, setModelOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [addChargeOpen, setAddChargeOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [DateDecode, setDateDecode] = useState({});

  const fetchData = async () => {
    try {
      const res = await handleAuth(navigate, location);
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

  const [customerCardsModal, setCustomerCardsModal] = useState(false);
  const [customersDetails, setCustomersDetails] = useState([]);

  const getData = async () => {
    try {
      const res = await AxiosInstance.get(`/customer/${location?.state?.id}`);
      setData(res?.data?.data);
      setCustomersDetails([res?.data?.data]);
    } catch (error) {
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    getData();
  }, [location?.state?.id]);

  const handlePropertyDelete = async (id) => {
    sendSwal().then(async (deleteReason) => {
      if (deleteReason) {
        try {
          const res = await AxiosInstance.delete(`/location/${id}`, {
            data: { DeleteReason: deleteReason },
          });
          if (res?.data?.statusCode === 200) {
            setTimeout(() => {
              showToast.success(res?.data?.message);
            }, 500);
            getData();
          } else if (res?.data?.statusCode === 202) {
            setTimeout(() => {
              showToast.error(res?.data?.message);
            }, 500);
          } else {
            showToast.error("", res?.data?.message, "error");
          }
        } catch (error) {
          showToast.error(error?.message);
          console.error("Error: ", error?.message);
        }
      } else {
        showToast.success("Property is safe!", {
          position: "top-center",
          autoClose: 1000,
        });
      }
    });
    setTimeout(() => {
      const deleteButton = document.querySelector(".swal-button--confirm");
      if (deleteButton) {
        deleteButton.disabled = true;
      }
    }, 0);
  };

  const [activeTabId, setActiveTabId] = useState(1);
  const handleClick = (tabId) => {
    setActiveTabId(tabId);
  };
  const [activeTabIdMain, setActiveTabIdMain] = useState(1);
  const handleMainClick = (tabId) => {
    setActiveTabIdMain(tabId);
  };

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const moreActiontoggle = () => setDropdownOpen((prevState) => !prevState);

  const sendMail = async () => {
    setLoading(true);
    try {
      const response = await AxiosInstance.post(
        `/customer/send_mail/${data?.CustomerId}`
      );
      if (response?.data?.statusCode === 200) {
        showToast.success(response?.data?.message);
      } else {
        sendToast(response?.data?.message);
      }
    } catch (error) {
      console.error("Error to send mail");
    } finally {
      setModelOpen(false);
      setLoading(false);
    }
  };

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);
  const menuItems = [
    {
      label: (
        <>
          <RequestQuoteOutlinedIcon
            className="icones-dropdown"
            style={{ fontSize: "18px" }}
          />
          Quote
        </>
      ),
      onClick: () => {
        navigate(`/${companyName}/add-quotes`, {
          state: {
            Customer: data,
            CustomerId: data?.CustomerId,
            navigats: [...location?.state?.navigats, "/add-quotes"],
          },
        });
      },
    },
    {
      label: (
        <>
          <WorkOutlineOutlinedIcon
            className="icones-dropdown"
            style={{ fontSize: "18px" }}
          />
          Contract
        </>
      ),
      onClick: () => {
        navigate(`/${companyName}/add-contract`, {
          state: {
            Customer: data,
            CustomerId: data?.CustomerId,
            navigats: [...location?.state?.navigats, "/add-contract"],
          },
        });
      },
    },
    {
      label: (
        <>
          <FileCopyOutlinedIcon
            className="icones-dropdown"
            style={{ fontSize: "18px" }}
          />
          Invoice
        </>
      ),
      onClick: () => {
        navigate(`/${companyName}/invoicetable`, {
          state: {
            CustomerId: data?.CustomerId,
            navigats: [...location?.state?.navigats, "/invoicetable"],
          },
        });
      },
    },
    {
      label: (
        <>
          <MarkEmailReadOutlinedIcon
            className="icones-dropdown"
            style={{ fontSize: "18px" }}
          />
          Resend Invitation
        </>
      ),
      onClick: () => {
        setModelOpen(true);
      },
    },
  ];

  const [selectChargeDropDown, setSelectChargetDropDown] = useState(false);
  const [selectCard, setSelectCard] = useState(false);
  const [selectDayOfMonth, setSelectDayOfMonth] = useState(false);
  const [accountTypeName, setAccountTypeName] = useState("");
  const [addBankAccountDialogOpen, setAddBankAccountDialogOpen] =
    useState(false);
  const [openRecurringDialog, setOpenRecurringDialog] = useState(false);
  const handleClose = () => {
    setOpenRecurringDialog(false);
    setOpenRecurringDialog(false);
  };
  const toggles1 = () => setSelectChargetDropDown(!selectChargeDropDown);

  const CompanyId = localStorage?.getItem("CompanyId");
  const CustomerId = location?.state?.id;

  const handleAddButtonClick = () => {
    setPaymentOpen(false);
  };
  const handleAddChargeButtonClick = () => {
    setAddChargeOpen(false);
  };

  const handleConfigClick = () => {
    setConfigOpen(false);
  };

  const cardToggle = () => setCustomerCardsModal(!customerCardsModal);

  const [isEditMode, setIsEditMode] = useState(false);

  const [selectedChargeAccountId, setSelectedChargeAccountId] = useState("");

  const chargeFormik = useFormik({
    initialValues: {
      CompanyId: CompanyId,
      CustomerId: CustomerId,
      account_id: selectedChargeAccountId || "",
      description: "",
      amount: "",
    },
    validationSchema: Yup.object({
      account_id: Yup.string().required("Account is required"),
      amount: Yup.number()
        .typeError("Amount must be a number")
        .required("Amount is required")
        .positive("Amount must be greater than zero"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const chargedataToPost = {
          ...values,
          CompanyId: CompanyId,
          CustomerId: CustomerId,
          
        };
        const res = await AxiosInstance.post(`/charge`, chargedataToPost);
        if (res.data.statusCode === 200) {
          showToast.success("Charge Added Successfully");
          resetForm();
          setSelectedChargeAccountId("");
          setAddChargeOpen(false);
        } else {
          showToast.error(res.data.message);
        }
      } catch (error) {
        console.error("Error: ", error.message);
      } finally {
        getData();
      }
    },
  });
  const [dropdownOpens, setDropdownOpens] = useState(false);

  const toggle = () => setDropdownOpens((prevState) => !prevState);

  const [selectedReport, setSelectedReport] = useState("Select Report Type");

  const handleSelect = (reportType) => {
    setSelectedReport(reportType);
  };

  const [weekdayDropdownOpen, setWeekdayDropdownOpen] = useState(false);

  const toggleWeekdayDropdown = () =>
    setWeekdayDropdownOpen(!weekdayDropdownOpen);

  const handleEditClick = (id) => {
    setPaymentOpen({ isOpen: true, propertyData: null });
  };

  return (
    <>
      <CustomerDetailsViews
        loader={loader}
        navigate={navigate}
        data={data}
        setSelectedReport={setSelectedReport}
        selectedReport={selectedReport}
        handleSelect={handleSelect}
        dropdownOpen={dropdownOpen}
        moreActiontoggle={moreActiontoggle}
        companyName={companyName}
        dropdownOpens={dropdownOpens}
        setDropdownOpens={setDropdownOpens}
        toggle={toggle}
        location={location}
        setModelOpen={setModelOpen}
        setPaymentOpen={setPaymentOpen}
        paymentOpen={paymentOpen}
        setAddChargeOpen={setAddChargeOpen}
        setConfigOpen={setConfigOpen}
        activeTabId={activeTabId}
        activeTabIdMain={activeTabIdMain}
        handleClick={handleClick}
        handleMainClick={handleMainClick}
        setOpen={setOpen}
        handlePropertyDelete={handlePropertyDelete}
        open={open}
        modelOpen={modelOpen}
        addChargeOpen={addChargeOpen}
        configOpen={configOpen}
        getData={getData}
        loading={loading}
        sendMail={sendMail}
        toggleDropdown={toggleDropdown}
        menuItems={menuItems}
        dateFormat={dateFormat}
        openRecurringDialog={openRecurringDialog}
        addBankAccountDialogOpen={addBankAccountDialogOpen}
        accountTypeName={accountTypeName}
        handleAddButtonClick={handleAddButtonClick}
        handleConfigClick={handleConfigClick}
        toggles1={toggles1}
        handleClose={handleClose}
        setAddBankAccountDialogOpen={setAddBankAccountDialogOpen}
        selectChargeDropDown={selectChargeDropDown}
        cardToggle={cardToggle}
        customersDetails={customersDetails}
        setSelectedChargeAccountId={setSelectedChargeAccountId}
        handleAddChargeButtonClick={handleAddChargeButtonClick}
        selectedChargeAccountId={selectedChargeAccountId}
        chargeFormik={chargeFormik}
        toggleWeekdayDropdown={toggleWeekdayDropdown}
        weekdayDropdownOpen={weekdayDropdownOpen}
        setIsEditMode={setIsEditMode}
        isEditMode={isEditMode}
        handleEditClick={handleEditClick}
        CompanyId={CompanyId}
      />
    </>
  );
}

export default CustomerDetails;

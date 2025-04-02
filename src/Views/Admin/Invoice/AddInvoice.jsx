import React, { useEffect, useState, useRef } from "react";
import { useFormik } from "formik";
import "./style.css";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import * as Yup from "yup";
import AxiosInstance from "../../AxiosInstance";
import { postFile } from "../../../components/Files/Functions";
import moment from "moment";
import AddInvoice from "./Views/AddInvoice";
import showToast from "../../../components/Toast/Toster";
import { handleAuth } from "../../../components/Login/Auth";

const InvoiceDetails = () => {
  const navigate = useNavigate();
  const { CompanyName } = useParams();

  const location = useLocation();
  const [lineItems, setLineItems] = useState([
    {
      Description: "",
      Name: "",
      Attachment: "",
      Type: "",
      Unit: "",
      CostPerUnit: "",
      Hourly: "",
      CostPerHour: "",
      Fixed: "",
      CostPerFixed: "",
      Square: "",
      CostPerSquare: "",
      Total: "",
      isNew: true,
    },
  ]);
  const [showDiscount, setShowDiscount] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const [DueDate, setDueDate] = useState("");
  const [paymentDue, setPaymentDue] = useState("Upon Receipt");
  const [isNumChange, setIsNumChange] = useState(false);
  const [tokenDecode, setTokenDecode] = useState({});
  const [invoiceData, setInvoiceData] = useState(null);
  const [isCollect, setIsCollect] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showCosts, setShowCosts] = useState(
    new Array(lineItems.length).fill(false)
  );

  const fetchDatas = async () => {
    try {
      const res = await handleAuth(navigate, location);
      setTokenDecode(res?.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchDatas();
  }, []);

  const [menuIsOpen, setMenuIsOpen] = useState(
    new Array(lineItems?.length).fill(false)
  );

  const toggle = () => setDropdownOpen((prevState) => !prevState);

  const formik = useFormik({
    initialValues: {
      Subject: "",
      Description: "",
      InvoiceNumber: 1,
      Message: "",
      CustomerId: "",
      CompanyId: localStorage.getItem("CompanyId"),
      LocationId: "",
      Notes: "",
      ContractDisclaimer:
        "Contract/ Disclaimer\nThis invoice is valid for the next 30 days, after which values may be subject to change.",
      Attachment: [],
      selectedTeams: [],
      Discount: "",
      Tax: "",
    },
    validationSchema: Yup.object({
      Subject: Yup.string().required("Subject required"),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const strings = [];
        for (let item of values.Attachment) {
          if (typeof item !== "string") {
            const string = await postFile(item);
            strings.push(string);
          } else {
            strings.push(item);
          }
        }
        for (let item of lineItems) {
          if (typeof item?.Attachment !== "string") {
            const string = await postFile(item?.Attachment);
            item.Attachment = string;
          }
        }
        const object = {
          ...values,
          items: lineItems,
          subTotal: lineItems?.reduce(
            (sum, item) => Number(sum) + Number(item?.Total || 0),
            0
          ),
          Total: Total,
          Attachment: strings,
          Role: tokenDecode,
          IssueDate: IssueDate,
          DueDate: DueDate,
          ContractId: location?.state?.id,
          AddedAt: new Date(),
          CompanyId:
            localStorage.getItem("CompanyId") || tokenDecode?.companyId,
        };
        let response;
        const invoiceId = location?.state?.invoiceId;
        if (!invoiceId) {
          setLoading(true);
          response = await AxiosInstance.post(`/invoice`, object);
        } else {
          response = await AxiosInstance.put(`/invoice/${invoiceId}`, object);
        }
        if (response?.data?.statusCode === 200) {
          setTimeout(() => {
            showToast.success(response?.data?.message);
          }, 500);
          if (isCollect) {
            navigate(
              CompanyName
                ? `/${CompanyName}/invoice-payment`
                : `/staff-member/invoice-payment`,
              {
                state: {
                  navigats: [...location?.state?.navigats, "/invoice-payment"],
                  id: response?.data?.InvoiceId,
                },
              }
            );
          } else {
            navigate(
              CompanyName
                ? `/${CompanyName}/invoice`
                : `/staff-member/workerinvoice`,
              {
                replace: true,
                state: {
                  navigats: [
                    "/index",
                    CompanyName ? "/invoice" : "/workerinvoice",
                  ],
                },
              }
            );
          }
        } else {
          setTimeout(() => {
            showToast.error(response?.data?.message);
          }, 500);
        }
      } catch (error) {
        console.error("Error: ", error);
        if (error?.response?.status === 400) {
          const errorMessages = error?.response?.data?.errors || [];
          const message = errorMessages.join(", "); 
          showToast.warning(`Validation Error: ${message}`);
        } else {
          showToast.error("An error occurred while submitting the form.");
        }
      } finally {
        setLoader(false);
      }
    },
  });

  useEffect(() => {
    if (location?.state?.id || location?.state?.invoiceId) {
      setLoader(true);
      const fetchData = async () => {
        try {
          var url;
          if (location?.state?.id) {
            url = `/contract/contract_details/${location?.state?.id}`;
          } else {
            url = `/invoice/invoice_detail/${location?.state?.invoiceId}`;
          }
          
          const res = await AxiosInstance.get(url);
          if (res.data?.statusCode === 200) {
            const data = res.data?.data;
            formik.setValues((values) => {
              return {
                ...values,
                Subject: data?.Subject || data?.Title,
                Firstname: data?.customer?.Firstname,
                LastName: data?.customer?.LastName,
                CustomerId: data?.CustomerId,
                CompanyId: data.CompanyId,
                LocationId: data?.LocationId,
                CustomerMessage: data?.CustomerMessage,
                PaymentDue: data?.PaymentDue || "Upon Receipt",
                DueDate: data?.DueDate,
                Message: data.Message,
                Notes: data?.Notes,
                Attachment: data?.Attachment,
                Discount: data?.Discount,
                Tax: data?.Tax,
                subTotal: data?.subTotal,
                Total: data?.Total,
                IssueDate: data?.IssueDate,
                InvoiceNumber: data?.InvoiceNumber || values?.InvoiceNumber,
              };
            });
            setDueDate(data?.DueDate);
            setInvoiceData(data);
            setLineItems(
              data?.Items || [
                {
                  Description: "",
                  Name: "",
                  Type: "",
                  Unit: "",
                  Attachment: "",
                  CostPerUnit: "",
                  Hourly: "",
                  CostPerHour: "",
                  Fixed: "",
                  CostPerFixed: "",
                  Square: "",
                  CostPerSquare: "",
                  Total: "",
                  isNew: true,
                },
              ]
            );
          }
        } catch (error) {
          console.error("Error: ", error);
        } finally {
          setLoader(false);
        }
      };

      const getNumber = async () => {
        try {
          if (!location.state.invoiceId) {
            const res = await AxiosInstance.get(
              `/invoice/get_number/${
                localStorage.getItem("CompanyId") || tokenDecode?.companyId
              }`
            );

            if (res.data?.statusCode === 200) {
              const invoiceNumber = res.data?.InvoiceNumber;
              if (!isNaN(invoiceNumber)) {
                const nextQuoteNumber = invoiceNumber + 1;
                formik.setValues((prevValues) => ({
                  ...prevValues,
                  InvoiceNumber: nextQuoteNumber,
                }));
              } else {
                console.error("Error: InvoiceNumber is not a valid number");
              }
            } else {
              console.error("API response error:", res?.data);
            }
          }
        } catch (error) {
          console.error("Error fetching invoice number:", error);
        }
      };

      const initialize = async () => {
        await getNumber();
        if (location?.state?.previewData) {
          formik.setValues(location?.state?.previewData?.values);
          setLineItems(
            location?.state?.previewData?.lineItems || [
              {
                Subject: "",
                Description: "",
                Name: "",
                Type: "",
                Unit: "",
                Attachment: "",
                CostPerUnit: "",
                Hourly: "",
                CostPerHour: "",
                Fixed: "",
                CostPerFixed: "",
                Square: "",
                CostPerSquare: "",
                Total: "",
                isNew: true,
                subTotal: "",
                IssueDate: "",
              },
            ]
          );
          formik.setFieldValue("CustomerId", location?.state?.CustomerId);
          formik.setFieldValue("LocationId", location?.state?.LocationId);
          window.history.replaceState(
            {
              id: location?.state?.previewData?.id
                ? location?.state?.previewData?.id
                : null,
            },
            ""
          );
        } else if (location?.state?.id) {
          await fetchData();
        }
      };

      initialize();
      fetchData();
      return () => {
        formik.resetForm();
        setLineItems([
          {
            FirstName: "",
            Subject: "",
            LastName: "",
            Description: "",
            Name: "",
            Type: "",
            Unit: "",
            Attachment: "",
            CostPerUnit: "",
            Hourly: "",
            CostPerHour: "",
            Fixed: "",
            CostPerFixed: "",
            Square: "",
            CostPerSquare: "",
            Total: "",
            isNew: true,
            subTotal: "",
            IssueDate: "",
          },
        ]);
      };
    }
  }, [location, tokenDecode]);

  const handleSelectChange = (index, selectedOption) => {
    const newLineItems = [...lineItems];
    newLineItems[index] = {
      ...newLineItems[index],
      ...selectedOption,

      Total: selectedOption?.Unit
        ? Number(selectedOption?.Unit || 0) *
          Number(selectedOption?.CostPerUnit || 0)
        : selectedOption?.Square
        ? Number(selectedOption?.Square || 0) *
          Number(selectedOption?.CostPerSquare || 0)
        : selectedOption?.Hourly
        ? Number(selectedOption?.Hourly || 0) *
          Number(selectedOption?.CostPerHour || 0)
        : Number(selectedOption?.Fixed || 0) *
          Number(selectedOption?.CostPerFixed || 0),
    };
    setLineItems(newLineItems);
    setMenuIsOpen((prevState) => {
      const newState = [...prevState];
      newState[index] = false;
      return newState;
    });
  };

  const addLineItem = () => {
    setLineItems([...lineItems, {}]);
  };
  const deleteLineItem = (index) => {
    const newLineItems = lineItems?.filter((_, i) => i !== index);
    setLineItems(newLineItems);
  };
  const [showTax, setShowTax] = useState(false);
  const calculateSubTotal = () => {
    const Total = lineItems?.reduce(
      (sum, item) => sum + Number(item?.Total || 0),
      0
    );
    return Total;
  };

  const subTotal = calculateSubTotal();

  const discountAmount = formik?.values?.Discount
    ? (Number(formik?.values?.Discount) * subTotal) / 100
    : 0;
  const discountedTotal = Math.max(0, subTotal - discountAmount);
  const taxAmount = formik?.values?.Tax
    ? (Number(formik?.values?.Tax) * subTotal) / 100
    : 0;
  const Total = (discountedTotal + taxAmount)?.toFixed(2);

  const [mail, setMail] = useState(false);
  const handleInvoiceNumberChange = async () => {
    const enteredInvoiceNumber = Number(formik?.values?.InvoiceNumber);
    const companyId =
      localStorage?.getItem("CompanyId") || tokenDecode?.companyId;

    try {
      setLoading(true);
      const res = await AxiosInstance.post(
        `/invoice/check_number/${companyId}`,
        {
          InvoiceNumber: enteredInvoiceNumber,
        }
      );

      if (res?.data?.statusCode === 200) {
        setTimeout(() => {
          showToast.success("Invoice number is valid and added successfully.");
        }, 500);
        setIsNumChange(false);
      } else if (res?.data?.statusCode === 203) {
        setTimeout(() => {
          showToast.error(
            "Invoice number already exists. Please choose a different number."
          );
        }, 500);
        formik.setFieldValue("InvoiceNumber", "");
      } else {
        setTimeout(() => {
          showToast.error("Failed to check Invoice number. Please try again.");
        }, 500);
      }
    } catch (error) {
      console.error(
        "Error checking Invoice number: ",
        error?.response || error?.message
      );
      setTimeout(() => {
        showToast.error("An error occurred while checking the Invoice number.");
      }, 500);
    } finally {
      setLoading(false);
    }
  };
  const handlePaymentDueChange = (e) => {
    const selectedValue = e.target.value;
    formik.setFieldValue("PaymentDue", selectedValue);

    let daysToAdd = 0;
    if (selectedValue === "15 Days") daysToAdd = 15;
    else if (selectedValue === "30 Days") daysToAdd = 30;
    else if (selectedValue === "45 Days") daysToAdd = 45;

    if (daysToAdd > 0) {
      const newDueDate = moment().add(daysToAdd, "days").format("YYYY-MM-DD");
      setDueDate(newDueDate);
    } else if (selectedValue === "Upon Receipt") {
      setDueDate(IssueDate);
    }
  };
  const [IssueDate, setIssueDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

   useEffect(() => {
      const handleBeforeUnload = (event) => {
        if (formik.dirty || lineItems.some(item => item.isNew)) {
          const message = "You have unsaved changes. Are you sure you want to leave?";
          event.returnValue = message;
          return message;
        }
      };
  
      window.addEventListener("beforeunload", handleBeforeUnload);
  
      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }, [formik.dirty, lineItems]);
    
  return (
    <>
      <AddInvoice
        invoiceData={invoiceData}
        subTotal={subTotal}
        formik={formik}
        loading={loading}
        isNumChange={isNumChange}
        setIsNumChange={setIsNumChange}
        handleInvoiceNumberChange={handleInvoiceNumberChange}
        IssueDate={IssueDate}
        setIssueDate={setIssueDate}
        setDueDate={setDueDate}
        DueDate={DueDate}
        loader={loader}
        paymentDue={paymentDue}
        handlePaymentDueChange={handlePaymentDueChange}
        lineItems={lineItems}
        handleSelectChange={handleSelectChange}
        setLineItems={setLineItems}
        setLoader={setLoader}
        menuIsOpen={menuIsOpen}
        setMenuIsOpen={setMenuIsOpen}
        deleteLineItem={deleteLineItem}
        showCosts={showCosts}
        setShowCosts={setShowCosts}
        addLineItem={addLineItem}
        showDiscount={showDiscount}
        setShowDiscount={setShowDiscount}
        discountAmount={discountAmount}
        showTax={showTax}
        setShowTax={setShowTax}
        taxAmount={taxAmount}
        Total={Total}
        dropdownOpen={dropdownOpen}
        toggle={toggle}
        mail={mail}
        setMail={setMail}
        setIsCollect={setIsCollect}
        CompanyName={CompanyName}
        setLoading={setLoading}
      />
    </>
  );
};

export default InvoiceDetails;

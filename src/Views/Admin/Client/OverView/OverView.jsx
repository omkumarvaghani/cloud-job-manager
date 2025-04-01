import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import OverView from "./view/Overview";
import RequestQuoteOutlinedIcon from "@mui/icons-material/RequestQuoteOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import FileCopyOutlinedIcon from "@mui/icons-material/FileCopyOutlined";
import { handleAuth } from "../../../../components/Login/Auth";
import AxiosInstance from "../../../AxiosInstance";

function CustomerDetails() {
  useEffect(() => {
    handleAuth(navigate, location);
  }, []);

  const location = useLocation();
  const navigate = useNavigate();
  const { CompanyName } = useParams();
  const [data, setData] = useState();
  const [loader, setLoader] = useState(true);
  const [tokenDecode, setTokenDecode] = useState({});
  const [contract, setContract] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [invoice, setInvoice] = useState([]);
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

  const getData = async () => {
    try {
      const res = await AxiosInstance.get(
        `/v1/customer/detail/${location?.state?.id}`
      );
      console.log(res, "res");
      setData(res?.data?.data);
    } catch (error) {
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    getData();
  }, [location?.state?.id]);

  const [activeTabId, setActiveTabId] = useState(1);
  const handleClick = (tabId) => {
    setActiveTabId(tabId);
  };
  const [activeTabIdMain, setActiveTabIdMain] = useState(1);

  useEffect(() => {
    const fetchQuote = async () => {
      if (data && data?.CustomerId) {
        try {
          const response = await AxiosInstance.get(
            `/v1/quote/get_quotes_customer/${
              localStorage.getItem("CompanyId") || tokenDecode?.companyId
            }/${data?.CustomerId}`
          );
          console.log(response, "response");

          if (response?.data?.statusCode === 200) {
            setQuotes(response?.data?.data);
          }
        } catch (err) {
          console.error("Error to fetching quote data: ", err.message);
        }
      }
    };

    fetchQuote();
  }, [data, tokenDecode]);

  useEffect(() => {
    const fetchContract = async () => {
      if (data && data?.CustomerId) {
        try {
          const response = await AxiosInstance.get(
            `/v1/contract/get_contract_customer/${
              localStorage.getItem("CompanyId") || tokenDecode?.companyId
            }/${data?.CustomerId}`
          );
          console.log(response, "response");
          setContract(response?.data?.data);
        } catch (err) {
          console.error("Error to fetching contract data: ", err.message);
        }
      }
    };
    fetchContract();
  }, [data, tokenDecode]);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (data && data.CustomerId) {
        try {
          const response = await AxiosInstance.get(
            `/invoice/get_invoice_customer/${
              localStorage.getItem("CompanyId") || tokenDecode?.companyId
            }/${data?.CustomerId}`
          );
          if (response?.data?.statusCode === 200) {
            setInvoice(response?.data?.data);
          }
        } catch (err) {
          console.error("Error to fetching contract data: ", err.message);
        }
      }
    };
    fetchInvoice();
  }, [data, tokenDecode]);

  const handleQuoteNavigate = (id) => {
    if (CompanyName) {
      navigate(`/${CompanyName}/quotes-detail`, {
        state: {
          id,
          navigats: [...location?.state?.navigats, "/quotes-detail"],
        },
      });
    } else {
      navigate(`/staff-member/worker-quotes-details`, {
        state: {
          id,
          navigats: [...location?.state?.navigats, "/worker-quotes-detailss"],
        },
      });
    }
  };

  const handleContractNavigate = (id) => {
    if (CompanyName) {
      navigate(`/${CompanyName}/contractdetails`, {
        state: {
          id,
          navigats: [...location?.state?.navigats, "/contractdetails"],
        },
      });
    } else {
      navigate(`/staff-member/worker-contract-details`, {
        state: {
          id,
          navigats: [...location?.state?.navigats, "/worker-contract-details"],
        },
      });
    }
  };

  const handleInvoiceNavigate = (id) => {
    if (CompanyName) {
      navigate(`/${CompanyName}/invoice-details`, {
        state: {
          id,
          navigats: [...location?.state?.navigats, "/invoice-details"],
        },
      });
    } else {
      navigate(`/staff-member/worker-invoice-detail`, {
        state: {
          id,
          navigats: [...location?.state?.navigats, "/worker-invoice-detail"],
        },
      });
    }
  };

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
        navigate(`/${CompanyName}/add-quotes`, {
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
        navigate(`/${CompanyName}/add-contract`, {
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
        navigate(`/${CompanyName}/invoicetable`, {
          state: {
            CustomerId: data?.CustomerId,
            navigats: [...location?.state?.navigats, "/invoicetable"],
          },
        });
      },
    },
  ];

  return (
    <>
      <OverView
        loader={loader}
        navigate={navigate}
        data={data}
        CompanyName={CompanyName}
        location={location}
        activeTabId={activeTabId}
        activeTabIdMain={activeTabIdMain}
        handleClick={handleClick}
        quotes={quotes}
        invoice={invoice}
        contract={contract}
        handleQuoteNavigate={handleQuoteNavigate}
        moment={moment}
        handleContractNavigate={handleContractNavigate}
        handleInvoiceNavigate={handleInvoiceNavigate}
        dateFormat={dateFormat}
      />
    </>
  );
}

export default CustomerDetails;

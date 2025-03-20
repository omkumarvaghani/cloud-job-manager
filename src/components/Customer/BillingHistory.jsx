import { Grid, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LoaderComponent } from "../Icon/Index";
import { CardBody, CardFooter, CardHeader } from "reactstrap";
import AxiosInstance from "../../Views/AxiosInstance";
import { handleAuth } from "../Login/Auth";
import moment from "moment";
import CustomerPayment from "../../assets/orange-icon/customerPayment.svg";
import PaymentChargw from "../../assets/Blue-sidebar-icon/paymentCharge.svg";
import InvoiceBlue from "../../assets/Blue-sidebar-icon/Invoice.svg";
import PaymentBlue from "../../assets/Orange-icons/payment.svg";
import "./style.css";

function BillingHistory() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tokenDecode, setTokenDecode] = useState({});
  const [totalBalance, settotalBalance] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [DateDecode, setDateDecode] = useState({});

  useEffect(() => {
    handleAuth(navigate, location);
  }, []);

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

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const id = location.state?.id || localStorage.getItem("CustomerId");
      const encodedId = encodeURIComponent(id);

      const response = await AxiosInstance.get(
        `/general_ledger/charges_payments/${encodedId}`
      );

      if (Array.isArray(response.data.data)) {
        setTransactions(response.data.data);
        settotalBalance(response.data);
      } else {
        console.error("API response is not an array:", response.data.data);
        setError("Unexpected API response format");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError(
        `Error: ${error.response ? error.response.data : error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <>
      <Grid className="justify-content-center align-items-center client ">
        <Grid
          style={{
            boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
            borderRadius: "8px",
            border: "0.5px solid ",
          }}
          className=" border-blue-color general-ledger-table"
        >
          <CardHeader
            className="d-flex justify-content-between align-items-center p-1 Typography-2 general-ledger-tableData"
            style={{ border: "none" }}
          >
            <Typography
              className="text-blue-color billing_history heading-five"
              style={{
                fontWeight: 600,
                fontSize: "26px",
                paddingLeft: "12px",
              }}
            >
              General Ledger
            </Typography>
            <Grid className="d-flex" style={{ paddingRight: "17px" }}>
              <Typography
                className="text-blue-color billing_history "
                style={{
                  fontWeight: 600,
                  fontSize: "17px",
                  paddingLeft: "12px",
                }}
              >
                Amount
              </Typography>{" "}
              <Typography
                className="text-blue-color billing_history "
                style={{
                  fontWeight: 600,
                  fontSize: "17px",
                  paddingLeft: "12px",
                }}
              >
                Balance
              </Typography>
            </Grid>
          </CardHeader>

          <CardBody
            style={{
              padding: "10px 0px",
              maxHeight: "300px",
              overflowY: "auto",
              scrollbarWidth: "thin",
            }}
            className="d-flex flex-column mx-3 general-ledger-tableData"
          >
            {loading && (
              <Grid
                className="d-flex flex-direction-row justify-content-center align-items-center Typography-5 m-5"
                style={{ height: "80vh", marginTop: "25%" }}
              >
                <LoaderComponent loader={loading} height="50" width="50" />
              </Grid>
            )}
            {error && <Typography>{error}</Typography>}
            {!loading && !error ? (
              transactions.length > 0 ? (
                transactions.map((item, index) => (
                  <Grid
                    key={index}
                    className="d-flex justify-content-between my-2"
                  >
                    <Grid className="d-flex">
                      <Grid
                        style={{
                          backgroundColor: "rgba(6, 49, 100, 10%)",
                          borderRadius: "50%",
                          height: "50px",
                          width: "50px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <img
                          src={
                            item.type === "payment"
                              ? item.InvoiceId
                                ? PaymentBlue
                                : CustomerPayment
                              : item.InvoiceId
                              ? InvoiceBlue
                              : PaymentChargw
                          }
                          alt="Transaction Icon"
                        />
                      </Grid>

                      <Grid className="mx-2">
                        <Typography
                          className="mb-0 my-2 text-blue-color"
                          style={{ fontSize: "16px", fontWeight: 600 }}
                        >
                          {moment(item?.createdAt).format(dateFormat)}
                        </Typography>
                        <Typography
                          className="text-blue-color"
                          style={{ fontSize: "14px" }}
                        >
                          {item.type === "payment" ? (
                            item.InvoiceNumber ? (
                              `Payment For Invoice #${item.InvoiceNumber}`
                            ) : (
                              <>
                                Payment received
                                {item.account_name && (
                                  <>
                                    {" "}
                                    For : <strong>{item.account_name}</strong>
                                  </>
                                )}
                              </>
                            )
                          ) : item.InvoiceNumber ? (
                            `Invoice Created - Invoice #${item.InvoiceNumber}`
                          ) : item.IsRecurring ? (
                            <>
                              Recurring Charge Applied
                              {item.account_name && (
                                <>
                                  For : <strong>{item.account_name}</strong>
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              Charge applied
                              {item.account_name && (
                                <>
                                  For : <strong>{item.account_name}</strong>
                                </>
                              )}
                            </>
                          )}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Grid className="d-flex align-items-end">
                      <Typography
                        className="text-blue-color"
                        style={{ fontSize: "14px", paddingRight: "35px" }}
                      >
                        {item.type === "payment"
                          ? `-$${(item.amount ?? 0).toFixed(2)}`
                          : `+$${(item.amount ?? 0).toFixed(2)}`}
                      </Typography>
                      <Typography
                        className="text-blue-color"
                        style={{ fontSize: "14px" }}
                      >
                        ${(item.balance ?? 0).toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                ))
              ) : (
                <Typography>No transactions found</Typography>
              )
            ) : null}
          </CardBody>

          <CardFooter
            className="d-flex border-blue-color justify-content-between bg-orange-color text-white-color general-ledger-tableData"
            style={{
              borderTop: "1px solid",
              borderBottomLeftRadius: "8px",
              borderBottomRightRadius: "8px",
              alignItems: "center",
              padding: "6px 10px 7px",
            }}
          >
            <Typography>Current Balance</Typography>
            <Typography>${totalBalance?.totalBalance}</Typography>
          </CardFooter>
        </Grid>
      </Grid>
    </>
  );
}

export default BillingHistory;

import React, { useEffect, useState } from "react";
import { Card, CardBody, CardFooter, CardHeader, CardText } from "reactstrap";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import MyLocationOutlinedIcon from "@mui/icons-material/MyLocationOutlined";
import AxiosInstance from "../../AxiosInstance";
import moment from "moment";
import { useLocation, useNavigate } from "react-router-dom";
import { handleAuth } from "../../../components/Login/Auth";
import "./style.css";
import { LoaderComponent } from "../../../components/Icon/Index";
import { Grid, Typography } from "@mui/material";

function Invoice() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    handleAuth(navigate, location);
  }, [navigate, location]);

  const [invoices, setInvoices] = useState({
    Paid: [],
    UnPaid: [],
    Pending: [],
  });
  const [loader, setLoader] = useState(true);
  const [error, setError] = useState(null);

  const CustomerId = localStorage.getItem("CustomerId");

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await AxiosInstance.get(
          `/invoice/invoice/${CustomerId}`
        );
        if (response?.data.statusCode === 200) {
          setInvoices(response?.data?.data);
        } else {
          setError(response?.data?.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoader(false);
      }
    };

    fetchInvoices();
  }, [CustomerId]);

  const hasInvoices = Object.values(invoices).some(
    (status) => status.length > 0
  );

  const renderInvoices = (status) => {
    const invoiceList = invoices[status];
    return invoiceList.map((invoice) => (
      <Card
        className="invoice-card"
        key={invoice?.invoiceId}
        onClick={() =>
          navigate(`/customers/invoice-payments`, {
            state: {
              id: invoice?.InvoiceId,
              navigats: [...location?.state?.navigats, "/invoice-payments"],
            },
          })
        }
      >
        <CardHeader className="invoice-card-header">
          Invoice #{invoice?.InvoiceNumber}
        </CardHeader>
        <CardBody>
          <CardText className="invoice-card-text text-blue-color">
            <CalendarMonthOutlinedIcon className="invoice-icon" /> Sent{" "}
            {moment(invoice?.createdAt)?.format("MM-DD-YYYY")}
          </CardText>
          <CardText className="invoice-card-text text-blue-color">
            <MyLocationOutlinedIcon className="invoice-icon" />{" "}
            {invoice?.location?.Address || "Address not available"}{" "}
            {invoice?.location?.City || "City not available"} <br />
            {invoice?.location?.State || "State not available"},
            {invoice?.location?.Country || "Country not available"}
          </CardText>
        </CardBody>
        <CardFooter className="invoice-card-footer text-blue-color">
          <Typography className="bold-text">
            Balance : $
            {new Intl.NumberFormat("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(invoice?.balance || 0)}
          </Typography>
          <Typography className="bold-text">
            Total :$
            {new Intl.NumberFormat("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(invoice?.Total || 0)}
          </Typography>
        </CardFooter>
      </Card>
    ));
  };

  return (
    <>
      {loader ? (
        <Grid
          className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5"
          style={{ height: "80vh", marginTop: "25%" }}
        >
          <LoaderComponent loader={loader} height="50" width="50" />
        </Grid>
      ) : (
        <Grid>
          <Typography className="invoice-header fw-bolder">
            Your invoices
          </Typography>
          <Grid className="invoice-grid">
            {hasInvoices ? (
              Object.keys(invoices).map(
                (status) =>
                  invoices[status]?.length > 0 && (
                    <Grid
                      key={status}
                      className="invoice-status-section"
                      style={{ flexDirection: "column" }}
                    >
                      <Typography
                        className="invoice-status-header invoiceCustomerPayment mb-3 fw-bolder"
                        style={{ width: "31%" }}
                      >
                        {status || "Status not available"}
                      </Typography>
                      <Grid
                        className="invoice-status-cards"
                        style={{ flexDirection: "column" }}
                      >
                        {renderInvoices(status)}
                      </Grid>
                    </Grid>
                  )
              )
            ) : (
              <Typography className="no-data-found">
                Invoices Not Available
              </Typography>
            )}
          </Grid>
        </Grid>
      )}
    </>
  );
}

export default Invoice;

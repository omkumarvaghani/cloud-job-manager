import React, { useEffect, useState } from "react";
import { Button, Card, CardBody, CardFooter, CardHeader } from "reactstrap";
import { Grid } from "@mui/material";
import { Typography } from "@mui/material";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import RecurringPayments from "../../../components/Customer/RecurringPayments/RecurringPayment";
import AxiosInstance from "../../AxiosInstance";

const RecurringPayment = () => {
  const [totalBalance, settotalBalance] = useState("");

  const fetchTransactions = async () => {
    try {
      const response = await AxiosInstance.get(
        `/general_ledger/charges_payments/${localStorage.getItem("CustomerId")}`
      );

      if (Array.isArray(response.data.data)) {
        settotalBalance(response.data);
      } else {
        console.error("API response is not an array:", response.data.data);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const [customersDetails, setCustomersDetails] = useState([]);

  const getData = async () => {
    try {
      const res = await AxiosInstance.get(
        `/customer/${localStorage.getItem("CustomerId")}`
      );
      setCustomersDetails([res?.data?.data]);
    } catch (error) {
      console.error("Error fetching customer data:", error);
    }
  };

  useEffect(() => {
    getData();
    fetchTransactions();
  }, []);

  const [customerCardsModal, setCustomerCardsModal] = useState(false);
  const cardToggle = () => setCustomerCardsModal(!customerCardsModal);

  return (
    <>
      <Grid>
        <Card className="col-6 border-blue-color customerSevenFlex">
          <CardHeader
            className="text-white-color bg-orange-color "
            style={{ fontWeight: 700 }}
          >
            Recurring Payment
          </CardHeader>
          <CardBody>
            <Grid className="text-blue-color d-flex justify-content-between">
              <Typography style={{ fontWeight: 600 }}>Balance : </Typography>
              <Typography>${totalBalance?.totalBalance} </Typography>
            </Grid>
          </CardBody>
          <CardFooter className="align-items-center">
            <Grid className="text-blue-color d-flex justify-content-between recurringPaymentBtn">
              <Button
                className="fontstylerentmodal text-blue-color fontfamilysty backgroundwhitesty configureReccuringBtnRight"
                onClick={() => cardToggle()}
                style={{
                  border: "1px solid #152B51",
                  marginRight: "10px",
                  fontSize: "14px",
                  fontWeight: "500",
                  background: "transparent",
                }}
              >
                Configure Recurring Payment{" "}
                {customersDetails?.some((item) => item?.IsRecurring) ? (
                  <VerifiedOutlinedIcon
                    color="success"
                    className="trueIconBtn"
                  />
                ) : (
                  ""
                )}
              </Button>
            </Grid>
          </CardFooter>
        </Card>
      </Grid>
      <RecurringPayments
        isOpen={customerCardsModal}
        toggle={cardToggle}
        customersData={customersDetails}
        companyId={customersDetails[0]?.CompanyId}
        fetchCustomerData={getData}
      />
    </>
  );
};

export default RecurringPayment;

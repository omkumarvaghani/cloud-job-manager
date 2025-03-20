import React, { useEffect, useState } from "react";
import CardImage from "../../../../assets/image/icons/CreditCard.png";
import AxiosInstance from "../../../AxiosInstance";
import sendToast from "../../../../components/Toast/sendToast";
import AddAchAccount from "../../Account/AddAchAccount";
import "./style.css";
import { Grid } from "@mui/material";
import { LoaderComponent } from "../../../../components/Icon/Index";
import { Typography } from "@mui/material";
import BlueButton from "../../../../components/Button/BlueButton";

const AchPayment = ({
  paymentFormik,
  selectedAccount,
  setSelectedAccount,
  companyData,
  CustomerId,
}) => {
  const [accountDetails, setAccountDetails] = useState([]);
  const [loader, setloader] = useState(true);
  const fetchAccountData = async () => {
    if (!CustomerId) {
      sendToast("Something went wrong, please try again.");
      return;
    }
    try {
      const res = await AxiosInstance.post("/nmi/get-billing-customer-vault", {
        CompanyId: localStorage?.getItem("CompanyId"),
        type: "ach",
        CustomerId,
      });
      if (
        res?.data?.status === 200 &&
        res?.data?.data &&
        res?.data?.data?.customer &&
        res?.data?.data?.customer?.billing
      ) {
        paymentFormik?.setFieldValue(
          "customer_vault_id",
          res?.data?.data?.customer["@attributes"]?.id
        );
        if (Array.isArray(res?.data?.data?.customer?.billing)) {
          setAccountDetails(res?.data?.data?.customer?.billing);
        } else {
          setAccountDetails([res?.data?.data?.customer?.billing]);
        }
      } else {
        setAccountDetails([]);
      }
    } catch (error) {
      sendToast("Something went wrong, please try again.");
    } finally {
      setloader(false);
    }
  };

  useEffect(() => {
    if (accountDetails?.length === 0) {
      fetchAccountData();
    }
  }, []);

  const [isOpen, setIsOpen] = useState(false);

  return (
    <Grid
      className="mb-3 px-2 d-flex flex-column cardWhichTypeToSelect"
      style={{ background: "#06316412", borderRadius: "8px" }}
    >
      {loader ? (
        <Grid className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5">
          <LoaderComponent loader={loader} height="50" width="50" />
        </Grid>
      ) : accountDetails && accountDetails?.length > 0 ? (
        accountDetails?.map((item, index) => (
          <Grid className="d-flex align-items-center justify-content-start w-100 mt-3">
            <Grid className="d-flex align-items-center w-100">
              <Grid className="d-flex align-items-center mx-2 accounts text-blue-color">
                <input
                  type="radio"
                  checked={selectedAccount === item}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedAccount(item);
                      paymentFormik.setFieldValue(
                        "billing_id",
                        item["@attributes"]?.id
                      );
                    } else {
                      setSelectedAccount("");
                    }
                  }}
                  style={{
                    cursor: "pointer",
                  }}
                />
              </Grid>
              <Grid className="d-flex align-items-center">
                <Grid className="d-flex flex-column justify-conent-center mx-2">
                  <Typography
                    className="text-blue-color"
                    style={{ fontSize: "18px" }}
                  >
                    {item?.check_account || "check account not available"}
                  </Typography>
                  <Typography className="text-blue-color">
                    {item?.check_name || "check name not available"}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        ))
      ) : (
        <>
          <Grid className="d-flex align-items-center justify-content-start w-100 my-3 AchBankAccountAndAddBtnToAdd">
            <Grid className="d-flex align-items-center w-100">
              <Grid className="d-flex align-items-center w-100">
                <Grid
                  style={{
                    width: "44px",
                    height: "44px",
                    background: "#F0F0F0",
                    borderRadius: "50%",
                    padding: "8px 5px",
                  }}
                  className="d-flex justify-content-center align-items-center"
                >
                  <img src={CardImage} alt="" width="90%" height="90%" />
                </Grid>
                <Grid className="d-flex flex-column justify-conent-center mx-2 AddNewAccountToAddCardSave">
                  <Typography className="text-blue-color">
                    No ACH Accounts
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid className="d-flex justify-content-end  marginLeftRemove">
              <BlueButton
                onClick={() => setIsOpen(true)}
                label={
                  <Typography className="full-sentence">
                    Add New Account
                  </Typography>
                }
              />
            </Grid>
          </Grid>
        </>
      )}
      {accountDetails && accountDetails?.length > 0 && (
        <Grid className="d-flex justify-content-end mb-2 mx-2">
          <BlueButton
            className="p-2 bg-blue-color text-white-color cancelBtnButtonColor"
            style={{
              borderRadius: "4px",
              fontSize: "12px",
            }}
            onClick={() => setIsOpen(true)}
            label={<Typography className="full-sentence">Add Account</Typography>}
          />
        </Grid>
      )}
      <AddAchAccount
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        companyData={companyData}
        isBilling={accountDetails?.length > 0}
        vaultId={paymentFormik?.values?.customer_vault_id}
        fetchData={fetchAccountData}
        CustomerId={CustomerId}
      />
    </Grid>
  );
};

export default AchPayment;

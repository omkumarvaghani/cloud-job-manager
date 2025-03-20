import React, { useEffect, useState } from "react";
import { Circles } from "react-loader-spinner";

import creditCardType from "credit-card-type";
import axios from "axios";

import CardImage from "../../../../assets/image/icons/CreditCard.png";
import AxiosInstance from "../../../AxiosInstance";
import sendToast from "../../../../components/Toast/sendToast";
import AddCard from "../../Account/AddCard";
import { Grid } from "@mui/material";
import { Row, Col } from "react-bootstrap";

import AddCardDetailsForm from "../../../../components/AdminViews/AddCardDetailsForm";
import { getTokenizationKeyCustomer } from "../../../../plugins/ApiHandler";
import { addTokenizationScript } from "../../../../plugins/helpers";
import { Card, CardContent, IconButton } from "@mui/material";
import Delete from "../../../../assets/image/icons/delete.svg";
import "./style.css";
import swal from "sweetalert";
import sendSwal from "../../../../components/Swal/sendSwal";
import { LoaderComponent } from "../../../../components/Icon/Index";
import showToast from "../../../../components/Toast/Toster";
import { Typography } from "@mui/material";
import BlueButton from "../../../../components/Button/BlueButton";

const CardPayment = ({
  paymentFormik,
  selectedCard,
  setSelectedCard,
  CustomerId,
  CompanyId,
}) => {
  const [billingDetails, setBillingDetails] = useState([]);
  const [loader, setloader] = useState(true);
  const [customerVault, setCustomerVault] = useState("");

  const getCardImage = async (CardNumber) => {
    try {
      const sanitizedValue = CardNumber.replace(/\D/g, "");
      const cardType = creditCardType(sanitizedValue)[0];

      if (cardType && cardType.type) {
        const sanitizedCardType = cardType.type
          .replace(/[-\s]/g, "")
          .toLowerCase();

        const response = await axios.get(
          `https://logo.clearbit.com/${sanitizedCardType}.com`
        );

        if (response?.status === 200) {
          return response?.config?.url;
        } else {
          return CardImage;
        }
      }
    } catch (error) {
      console.error(error?.message);
    }
  };

  const [isOpen, setIsOpen] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [scriptGenerating, setScriptGenerating] = useState(false);
  const [scriptError, setScriptError] = useState("");
  const [isPublicKeyAvailable, setIsPublicKeyAvailable] = useState(false);

  const getNmiKey = async (Company_Id) => {
    setScriptGenerating(true);
    setScriptError("");

    try {
      const keyResponse = await getTokenizationKeyCustomer(Company_Id);
      if (keyResponse?.PublicKey) {
        setIsPublicKeyAvailable(true);
      } else {
        setIsPublicKeyAvailable(false);
      }
      await addTokenizationScript(keyResponse?.PublicKey);
    } catch (error) {
      setScriptError(
        error ||
          "Failed to load the tokenization script. Make sure you have suitable internet connection."
      );
    } finally {
      setScriptGenerating(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await getNmiKey(CustomerId);
    };
    fetchData();
  }, [CustomerId, CompanyId]);

  const fetchCardData = async () => {
    if (!CustomerId) {
      sendToast("Something went wrong, please try again.");
      return;
    }
    try {
      const res = await AxiosInstance.post("/nmi/get-billing-customer-vault", {
        CompanyId: localStorage.getItem("CompanyId") || CompanyId,
        type: "card",
        CustomerId,
      });
      if (
        res?.data?.status === 200 &&
        res?.data?.data &&
        res?.data?.data?.customer &&
        res?.data?.data?.customer?.billing
      ) {
        const billingData = [];
        setCustomerVault(res?.data?.data?.customer["@attributes"]?.id);

        paymentFormik.setFieldValue(
          "customer_vault_id",
          res?.data?.data?.customer["@attributes"]?.id
        );
        if (Array.isArray(res?.data?.data?.customer?.billing)) {
          for (const elem of res?.data?.data?.customer?.billing) {
            const image = await getCardImage(elem["@attributes"].id);
            billingData.push({ ...elem, image: image || "" });
          }
        } else {
          const image = await getCardImage(
            res?.data?.data?.customer?.billing["@attributes"].id
          );
          billingData.push({
            ...res?.data?.data?.customer?.billing,
            image: image || "",
          });
        }
        setBillingDetails(billingData);
      } else {
        setBillingDetails([]);
      }
    } catch (error) {
      sendToast("Something went wrong, please try again.");
    } finally {
      setloader(false);
    }
  };

  useEffect(() => {
    const fetchData = () => {
      if (billingDetails?.length === 0) {
        fetchCardData();
      }
    };
    fetchData();
  }, [CompanyId]);

  const handleDelete = async (item) => {
    sendSwal().then(async (willDelete) => {
      if (willDelete) {
        try {
          if (item["@attributes"]?.id) {
            const object = {
              CompanyId: localStorage?.getItem("CompanyId") || CompanyId,
              customer_vault_id: customerVault,
              billing_id: item["@attributes"]?.id,
            };
            if (billingDetails?.length > 1) {
              var url = `/nmi/delete-customer-billing`;
            } else {
              url = `/nmi/delete-customer-vault`;
            }

            const deleteRes = await AxiosInstance.post(url, object);
            if (deleteRes?.data?.status === 200) {
              showToast.success("Card details deleted");
              fetchCardData();
            }
          }
        } catch (error) {
          console.error(error?.message);
        }
      }
    });
  };

  return (
    <Grid
      className="mb-3 px-2 d-flex flex-column accountInformationInputTop creditCardBoxSelectDate"
      style={{
        background: "#06316412",
        borderRadius: "8px",
        overflowX: "auto ",
      }}
    >
      {loader ? (
        <Grid className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5">
          <LoaderComponent loader={loader} height="50" width="50" />
        </Grid>
      ) : billingDetails && billingDetails?.length > 0 ? (
        billingDetails?.map((item, index) => (
          <Grid className="d-flex align-items-center justify-content-start w-100 mt-3">
            <Grid className="d-flex align-items-center w-100">
              <Grid className="d-flex align-items-center mx-2 accounts text-blue-color">
                <input
                  type="radio"
                  checked={selectedCard === item}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCard(item);
                      paymentFormik.setFieldValue(
                        "billing_id",
                        item["@attributes"].id
                      );
                    } else {
                      setSelectedCard("");
                    }
                  }}
                  style={{
                    cursor: "pointer",
                  }}
                />
              </Grid>
              <Grid className="d-flex align-items-center flex-grow-1">
                <Grid
                  style={{
                    width: "55px",
                    height: "55px",
                    background: "#fff",
                    borderRadius: "50%",
                    padding: "8px 5px",
                  }}
                  className="d-flex justify-content-center align-items-center"
                >
                  <img
                    src={item?.image || CardImage}
                    alt=""
                    width="90%"
                    height="90%"
                  />
                </Grid>
                <Grid className="d-flex flex-column justify-content-center mx-2">
                  <Typography
                    className="text-blue-color"
                    style={{ fontSize: "18px" }}
                  >
                    {item?.cc_number || "cc number not available"}
                  </Typography>
                  <Typography className="text-blue-color">
                    {item?.first_name || "first name not available"} {item?.last_name || "last name not available"}
                  </Typography>
                </Grid>
                <Grid className="flex-shrink-0 ms-auto">
                  <IconButton style={{ width: "36px", height: "36px" }}>
                    <img
                      className="mx-1 customerEditImgToEdit"
                      alt="delete"
                      src={Delete}
                      width={24}
                      height={24}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item);
                      }}
                    />
                  </IconButton>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        ))
      ) : (
        <>
          <Grid
            className="d-flex align-items-center justify-content-start w-100 my-3"
            style={{ overflowX: "auto" }}
          >
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
                <Grid className="d-flex flex-column justify-conent-center mx-2">
                  <Typography className="text-blue-color">
                    No Credit Card
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid className="d-flex justify-content-end mx-2">
              {isPublicKeyAvailable && (
                <BlueButton
                  className="p-2 bg-blue-color text-white-color"
                  style={{
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                  onClick={() => setModalShow(true)}
                  label={
                    <Typography className="full-sentence">Add Card</Typography>
                  }
                />
              )}
            </Grid>
          </Grid>
        </>
      )}

      <AddCard
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        isBilling={billingDetails?.length > 0}
        vaultId={paymentFormik?.values?.customer_vault_id}
        fetchData={fetchCardData}
        CustomerId={CustomerId}
      />
      {scriptGenerating ? (
        <Typography></Typography>
      ) : scriptError ? (
        <Typography></Typography>
      ) : (
        <>
          {!scriptGenerating && !scriptError ? (
            <Grid>
              <AddCardDetailsForm
                onHide={() => setModalShow(false)}
                show={modalShow}
                scriptGenerating={scriptGenerating}
                scriptError={scriptError}
                CustomerId={CustomerId}
                fetchData={fetchCardData}
                CompanyId={CompanyId}
              />
              {billingDetails && billingDetails?.length > 0 && (
                <Grid className="d-flex justify-content-end mb-3 mx-2 AddCardButtonBoxPayment">
                  {isPublicKeyAvailable && (
                    <BlueButton
                      className="p-2 bg-blue-color text-white-color
                      "
                      style={{
                        borderRadius: "4px",
                        fontSize: "12px",
                      }}
                      onClick={() => setModalShow(true)}
                      label={
                        <Typography className="full-sentence">
                          Add Card
                        </Typography>
                      }
                    />
                  )}
                </Grid>
              )}
            </Grid>
          ) : null}
        </>
      )}
    </Grid>
  );
};

export default CardPayment;

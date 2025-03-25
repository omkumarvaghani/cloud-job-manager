import React, { useEffect, useState } from "react";
import { Card, CardContent, IconButton } from "@mui/material";
import AxiosInstance from "../../AxiosInstance";
import moment from "moment";
import "./style.css";
import CardImage from "../../../assets/image/icons/CreditCard.png";
import Delete from "../../../assets/image/icons/delete.svg";
import payfound from "../../../assets/image/icons/payfound.svg";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AddCard from "./AddCard";
import { handleAuth } from "../../../components/Login/Auth";
import creditCardType from "credit-card-type";
import axios from "axios";
import { Circles } from "react-loader-spinner";
import sendToast from "../../../components/Toast/sendToast";
import { getTokenizationKey } from "../../../plugins/ApiHandler";
import { addTokenizationScript } from "../../../plugins/helpers";
import AddCardDetailsForm from "../../../components/AdminViews/AddCardDetailsForm";
import swal from "sweetalert";
import sendSwal from "../../../components/Swal/sendSwal";
import { Grid } from "@mui/material";
import { Row, Col } from "react-bootstrap";
import { LoaderComponent } from "../../../components/Icon/Index";
import showToast from "../../../components/Toast/Toster";
import { Typography } from "@mui/material";

import BlueButton from "../../../components/Button/BlueButton";
import WhiteButton from "../../../components/Button/WhiteButton";

const Account = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { CompanyName } = useParams();
  const [loading, setLoading] = useState(true);
  const [planDetails, setPlanDetails] = useState([]);
  const [activePlanDetails, setActivePlanDetails] = useState(undefined);
  const [billingDetails, setBillingDetails] = useState([]);
  const [activePlan, setActivePlan] = useState(false);
  const [customerVault, setCustomerVault] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState("");

  const fetchData = async () => {
    try {
      await handleAuth(navigate, location);

      const res = await AxiosInstance.post("/nmi/get-billing-customer-vault", {
        CompanyId: localStorage.getItem("CompanyId"),
        type: "card",
      });
      if (
        res.data.status === 200 &&
        res.data.data &&
        res.data.data.customer &&
        res.data.data.customer.billing
      ) {
        const billingData = [];
        setCustomerVault(res.data.data.customer["@attributes"].id);
        if (Array.isArray(res.data.data.customer.billing)) {
          for (const elem of res.data.data.customer.billing) {
            const image = await getCardImage(elem["@attributes"].id);
            billingData.push({ ...elem, image: image || "" });
          }
        } else {
          const image = await getCardImage(
            res.data.data.customer.billing["@attributes"].id
          );
          billingData.push({
            ...res.data.data.customer.billing,
            image: image || "",
          });
        }
        setBillingDetails(billingData);
      } else {
        setBillingDetails([]);
      }
      const response = await AxiosInstance.get(
        `/planpurchase/company_plans/${localStorage.getItem("CompanyId")}`
      );
      if (response?.data.statusCode === 200) {
        setPlanDetails(response?.data?.data);
        setActivePlanDetails(response?.data.activePlan);
      }
    } catch (error) {
      console.error("Error: ", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

        if (response.status === 200) {
          return response.config.url;
        } else {
          return CardImage;
        }
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleDelete = async (item) => {
    sendSwal().then(async (willDelete) => {
      if (willDelete) {
        try {
          if (item["@attributes"].id) {
            const object = {
              CompanyId: localStorage.getItem("CompanyId"),
              customer_vault_id: customerVault,
              billing_id: item["@attributes"].id,
            };
            if (billingDetails.length > 1) {
              var url = `/nmi/delete-customer-billing`;
            } else {
              url = `/nmi/delete-customer-vault`;
            }

            const deleteRes = await AxiosInstance.post(url, object);
            if (deleteRes.data.status === 200) {
              showToast.success("Card details deleted");
              fetchData();
            }
          }
        } catch (error) {
          console.error(error.message);
        }
      }
    });
  };

  const [modalShow, setModalShow] = useState(false);
  const [loader, setloader] = useState(true);
  const [scriptGenerating, setScriptGenerating] = useState(false);
  const [scriptError, setScriptError] = useState("");
  const [isPublicKeyAvailable, setIsPublicKeyAvailable] = useState(false);

  const getNmiKey = async (Company_Id) => {
    setScriptGenerating(true);
    setScriptError("");

    try {
      const keyResponse = await getTokenizationKey(Company_Id);

      await addTokenizationScript(keyResponse.PublicKey);
      if (keyResponse?.PublicKey) {
        setIsPublicKeyAvailable(true);
      } else {
        setIsPublicKeyAvailable(false);
      }
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
      const CompanyId = localStorage.getItem("CompanyId");
      await getNmiKey(CompanyId);
    };
    fetchData();
  }, []);

  return (
    <>
      {loading ? (
        <Grid
          className="d-flex flex-direction-row justify-content-center align-items-center"
          style={{ height: "80vh" }}
        >
          <LoaderComponent height="50" width="50" loader={loader} />
        </Grid>
      ) : (
        <Grid className="pt-0 mx-3 mx-md-5 accounts">
          <Typography className="my-0 text-blue-color heading-two">
            Account & Billing
          </Typography>
          <Grid className="my-3 d-flex flex-column gap-5">
            <Grid
              className="row w-100 p-0 m-0 billingAndDetail"
              style={{ justifyContent: "flex-start", gap: "15px" }}
            >
              <Grid
                className="col-12 col-md-7 p-0 m-0 accountBillingCardDetail "
                xl={8}
              >
                <Card
                  style={{
                    boxShadow: "0px 4px 4px 0px #00000040",
                    border: "1px solid #0631644D",
                    borderRadius: "20px",
                    height: "100%",
                    padding: "10px 10px",
                  }}
                >
                  <CardContent>
                    <Grid className="d-flex justify-content-between cardOverviewViewplan  buttonResponsiveHere">
                      <Typography
                        style={{ fontSize: "20px" }}
                        className="text-blue-color accountOverviewHead heading-four heading-four"
                      >
                        Account Overview
                      </Typography>
                      <BlueButton
                        style={{
                          fontSize: "12px",
                          borderRadius: "4px",
                        }}
                        onClick={() => {
                          const plan = planDetails.find(
                            (item) => item?.status && item?.plan !== "Trial"
                          );
                          navigate(`/${CompanyName}/plan`, {
                            state: {
                              navigats: [...location.state.navigats, "/plan"],
                              plan,
                            },
                          });
                        }}
                        label="View Plan"
                      />
                    </Grid>

                    <Grid
                      className="paymentHistoryOverflow"
                      style={{ maxHeight: "300px" }}
                    >
                      <Grid
                        className="d-flex gap-3 mt-4"
                        style={{ flexDirection: "column", minWidth: "600px" }}
                      >
                        <Row
                          className="gap-0 mt-4"
                          style={{ minWidth: "600px" }}
                        >
                          <Col xs={4}>
                            <Typography
                              style={{
                                borderBottom: "1px solid #06316433",
                                width: "120px",
                              }}
                              className="text-blue-color full-sentence"
                            >
                              Account Since
                            </Typography>
                          </Col>
                          <Col xs={4}>
                            <Typography
                              style={{
                                borderBottom: "1px solid #06316433",
                                width: "128px",
                              }}
                              className="text-blue-color full-sentence"
                            >
                              Account Status
                            </Typography>
                          </Col>
                          <Col xs={4}>
                            <Typography
                              style={{
                                borderBottom: "1px solid #06316433",
                                width: "110px",
                              }}
                              className="text-blue-color full-sentence"
                            >
                              Current Plan
                            </Typography>
                          </Col>
                        </Row>

                        {planDetails && planDetails.length > 0 ? (
                          planDetails?.map((item, index) => (
                            <Row
                              key={index}
                              className="gap-0"
                              style={{ minWidth: "600px" }}
                            >
                              <Col xs={4}>
                                <Typography className="text-blue-color full-sentence">
                                  {moment(item?.date).format("YYYY-MM-DD")}
                                </Typography>
                              </Col>
                              <Col xs={4}>
                                <Typography className="text-blue-color full-sentence">
                                  {item?.status
                                    ? "Active"
                                    : "Inactive" || "status not available"}
                                </Typography>
                              </Col>
                              <Col xs={4} className="full-sentence">
                                <Typography className="text-blue-color">
                                  {item?.plan || "plan not available"}
                                </Typography>
                              </Col>
                            </Row>
                          ))
                        ) : (
                          <Row className="gap-0" style={{ minWidth: "600px" }}>
                            <Col xs={4}>
                              <Typography className="text-blue-color full-sentence">
                                -
                              </Typography>
                            </Col>
                            <Col xs={4}>
                              <Typography className="text-blue-color full-sentence">
                                -
                              </Typography>
                            </Col>
                            <Col
                              xs={4}
                              className="full-sentence text-md-right text-left"
                            >
                              <Typography className="text-blue-color">
                                -
                              </Typography>
                            </Col>
                          </Row>
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              <Col
                xs={12}
                md={4}
                xl={4}
                className="p-0 m-0 billingDetailCardc"
                style={{ width: "40%" }}
              >
                <Card
                  style={{
                    boxShadow: "0px 4px 4px 0px #00000040",
                    border: "1px solid #0631644D",
                    borderRadius: "20px",
                    height: "100%",
                    padding: "10px 10px",
                    // width:"472px"
                  }}
                  className="widthNoneReponse"
                >
                  <CardContent className="h-100">
                    <Typography
                      style={{ fontSize: "20px" }}
                      className="text-blue-color heading-four heading-four"
                    >
                      Billing Details
                    </Typography>
                    <Grid className="d-flex flex-column justify-content-between gap-3 mt-4 h-auto">
                      {billingDetails && billingDetails.length > 0 ? (
                        billingDetails?.map((item, index) => (
                          <Grid
                            className="overflow-auto"
                            style={{ whiteSpace: "nowrap", width: "100%" }}
                          >
                            <Grid className="d-flex align-items-center justify-content-start">
                              <Grid className="d-flex align-items-center">
                                <Grid className="d-flex align-items-center mx-2">
                                  <input
                                    type="radio"
                                    checked={selectedCard === item}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedCard(item);
                                      } else {
                                        setSelectedCard("");
                                      }
                                    }}
                                    style={{
                                      color: "#063164",
                                      cursor: "pointer",
                                    }}
                                  />
                                </Grid>
                                <Grid className="d-flex align-items-center">
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
                                    <img
                                      src={item?.image || CardImage}
                                      alt=""
                                      width="90%"
                                      height="90%"
                                    />
                                  </Grid>
                                  <Grid className="d-flex flex-column justify-content-center mx-2">
                                    <Typography className="text-blue-color">
                                      {item?.cc_number || "cc number not available"}
                                    </Typography>
                                    <Typography className="text-blue-color">
                                      {item?.first_name || "first name not available"}{" "}
                                      {item?.last_name || "last name not available"}
                                    </Typography>
                                  </Grid>
                                </Grid>
                              </Grid>
                              <Grid
                                className="flex-shrink-1"
                                style={{ marginLeft: "auto" }}
                              >
                                <IconButton>
                                  <img
                                    className="mx-1 customerEditImgToEdit"
                                    alt="img"
                                    src={Delete}
                                    width={20}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(item);
                                    }}
                                  />
                                </IconButton>
                              </Grid>
                            </Grid>
                          </Grid>
                        ))
                      ) : (
                        <>
                          <Grid className="d-flex align-items-center justify-content-start w-100">
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
                                  <img
                                    src={CardImage}
                                    alt=""
                                    width="90%"
                                    height="90%"
                                  />
                                </Grid>
                                <Grid className="d-flex flex-column justify-conent-center mx-2">
                                  <Typography className="text-blue-color">
                                    No Credit Card
                                  </Typography>
                                  <Typography
                                    className="text-blue-color"
                                    style={{ fontSize: "14px" }}
                                  >
                                    Continue using CMS by choosing a plan
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Grid>
                          </Grid>
                        </>
                      )}
                      <Grid className="d-flex align-items-center justify-content-end gap-2 flex-bottom border-blue-color text-white-color BlueAndWhiteBtmFlex">
                        <WhiteButton
                          style={{ height: "32px" }}
                          className="border-blue-color"
                          onClick={() => {
                            const plan = planDetails.find(
                              (item) => item?.status && item?.plan !== "Trial"
                            );
                            if (selectedCard) {
                              navigate(`/${CompanyName}/plan`, {
                                state: {
                                  navigats: [
                                    ...location.state.navigats,
                                    "/plan",
                                  ],
                                  card: {
                                    ...selectedCard,
                                    CompanyId:
                                      localStorage.getItem("CompanyId"),
                                    customer_vault_id: customerVault,
                                  },
                                  plan,
                                },
                              });
                            } else {
                              navigate(`/${CompanyName}/plan`, {
                                state: {
                                  navigats: [
                                    ...location.state.navigats,
                                    "/plan",
                                  ],
                                  plan,
                                },
                              });
                            }
                          }}
                          label={
                            <>
                              {" "}
                              <Typography
                                className="text-blue-color full-sentence border-blue-color"
                                style={{ marginTop: "-3%" }}
                              >
                                Choose Plan
                              </Typography>
                            </>
                          }
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
                                  fetchData={fetchData}
                                />
                                {isPublicKeyAvailable && (
                                  <BlueButton
                                    style={{
                                      borderRadius: "4px",
                                      fontSize: "12px",
                                    }}
                                    onClick={() => setModalShow(true)}
                                    label="Add Card"
                                  />
                                )}
                              </Grid>
                            ) : null}
                          </>
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Col>
            </Grid>

            <Row className="w-100 p-0 m-0">
              <Col
                xs={12}
                md={6}
                className="p-0 m-0 accountBillingCardDetail paymentHistoryWidthSet"
              >
                <Card
                  style={{
                    boxShadow: "0px 4px 4px 0px #00000040",
                    border: "1px solid #0631644D",
                    borderRadius: "20px",
                    height: "100%",
                    padding: "10px 10px",
                  }}
                >
                  <CardContent>
                    <Typography
                      style={{ fontSize: "20px" }}
                      className="text-blue-color heading-four heading-four"
                    >
                      Payment History
                    </Typography>
                    {activePlanDetails?.PlanName === "Trial" ? (
                      <Grid
                        style={{ fontSize: "12px", gap: "10px" }}
                        className="text-blue-color d-flex mt-5"
                      >
                        <Grid
                          style={{
                            width: "44px",
                            height: "44px",
                            background: "#063164",
                            borderRadius: "50%",
                            padding: "8px 5px",
                          }}
                          className="d-flex justify-content-center align-items-center"
                        >
                          <img src={payfound} alt="" width="90%" height="90%" />
                        </Grid>
                        <Grid>
                          <Typography
                            style={{
                              fontWeight: "500",
                              fontSize: "18px",
                              color: "#063164",
                            }}
                          >
                            No Payment History{" "}
                          </Typography>
                          <Typography
                            style={{
                              color: "#063164B2",
                              fontWeight: "500",
                              fontSize: "14px",
                            }}
                          >
                            Find your past payments here when your trial ends
                          </Typography>
                        </Grid>
                      </Grid>
                    ) : (
                      <Grid className="mt-4 paymentHistoryOverflow">
                        <Grid style={{ minWidth: "600px" }}>
                          <Grid container style={{ minWidth: "600px" }}>
                            <Grid item xs={3} xl={4}>
                              <Typography
                                style={{
                                  borderBottom: "1px solid #06316433",
                                  width: "114px",
                                }}
                                className="text-blue-color full-sentence"
                              >
                                Transaction Id
                              </Typography>
                            </Grid>
                            <Grid item xs={3} xl={4}>
                              <Typography
                                style={{
                                  borderBottom: "1px solid #06316433",
                                  width: "132px",
                                }}
                                className="text-blue-color full-sentence"
                              >
                                Payment Details
                              </Typography>
                            </Grid>

                            <Grid item xs={3} xl={4}>
                              <Typography
                                style={{
                                  borderBottom: "1px solid #06316433",
                                  width: "70px",
                                }}
                                className="text-blue-color full-sentence"
                              >
                                Amount
                              </Typography>
                            </Grid>
                          </Grid>

                          <Grid
                            container
                            spacing={1}
                            className="mt-1"
                            style={{ minWidth: "600px" }}
                          >
                            <Grid item xs={3} xl={4}>
                              <Typography className="text-blue-color">
                                {activePlanDetails?.SubscriptionId || "-"}
                              </Typography>
                            </Grid>

                            <Grid item xs={3} xl={4}>
                              <Typography className="text-blue-color">
                                <Typography>
                                  {activePlanDetails?.PlanName || "-"}
                                </Typography>
                              </Typography>
                            </Grid>

                            <Grid item xs={3} xl={4}>
                              <Typography className="text-blue-color">
                                {activePlanDetails?.PlanPrice
                                  ? `$${new Intl.NumberFormat("en-US", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }).format(activePlanDetails.PlanPrice)}`
                                  : "-"}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    )}
                  </CardContent>
                </Card>
              </Col>

              <Col
                xs={14}
                md={4}
                className="p-0 m-0 mt-md-0 mt-5 billingDetailCardc cancelAccountWidth"
              >
                <Card
                  style={{
                    boxShadow: "0px 4px 4px 0px #00000040",
                    border: "1px solid #0631644D",
                    borderRadius: "20px",
                    height: "100%",
                    padding: "10px 10px",
                  }}
                >
                  <CardContent>
                    <Grid
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                      className="CancelAccInFO"
                    >
                      <Typography
                        style={{ fontSize: "20px" }}
                        className="text-blue-color heading-four"
                      >
                        Cancel Your Account
                      </Typography>

                      {activePlanDetails?.PlanName !== "Trial" && (
                        <Grid className="cancelBtnAccout">
                          <BlueButton
                            style={{
                              fontSize: "14px",
                              borderRadius: "4px",
                              border: "none",
                            }}
                            onClick={async () => {
                              const confirmDelete = await swal({
                                title: "Are you sure?",
                                text: "Once Cancel, you will not be able to recover!",
                                icon: "warning",

                                buttons: {
                                  cancel: "Cancel",
                                  confirm: {
                                    text: "Cancel",
                                    closeModal: true,
                                    value: true,
                                    className: "bg-orange-color",
                                  },
                                },
                                dangerMode: true,
                              });

                              if (!confirmDelete) return;

                              try {
                                const res = await AxiosInstance.delete(
                                  `/planpurchase/cancel_plan/${localStorage.getItem(
                                    "CompanyId"
                                  )}`
                                );

                                if (res.data.statusCode === 200) {
                                  showToast.success(res.data.message);
                                  localStorage.setItem(
                                    "adminToken",
                                    res.data.token
                                  );
                                  navigate(`/plan`);
                                } else {
                                  showToast.error(
                                    "There was an issue with account cancellation. Please try again later."
                                  );
                                }
                              } catch (error) {
                                showToast.error(
                                  "There was an issue with account cancellation. Please try again later."
                                );
                              }
                            }}
                            label=" Cancel Account"
                          />
                        </Grid>
                      )}
                    </Grid>
                    {activePlanDetails?.PlanName === "Trial" ? (
                      <Typography
                        style={{
                          fontSize: "14",
                          fontWeight: "500",
                          color: "#063164B2",
                          marginTop: "75px ",
                        }}
                        className="text-blue-color "
                      >
                        Your trial will automatically expire so there’s no need
                        to cancel
                      </Typography>
                    ) : (
                      <Grid className="paymentHistoryOverflo paymentHistoryOverflow">
                        <Grid
                          className="d-flex gap-3 mt-4"
                          style={{ minWidth: "600px", flexDirection: "column" }}
                        >
                          <Row
                            className="d-flex gap-0 raw"
                            style={{ minWidth: "600px" }}
                          >
                            <Row className="w-100 p-0 m-0">
                              <Col xs={4} md={4}>
                                <Typography
                                  style={{
                                    borderBottom: "1px solid #06316433",
                                  }}
                                  className="text-blue-color full-sentence"
                                >
                                  Current Plan
                                </Typography>
                              </Col>

                              <Col xs={4} md={4}>
                                <Typography
                                  style={{
                                    borderBottom: "1px solid #06316433",
                                  }}
                                  className="text-blue-color full-sentence"
                                >
                                  Plan Details
                                </Typography>
                              </Col>

                              <Col xs={4} md={4}>
                                <Typography
                                  style={{
                                    borderBottom: "1px solid #06316433",
                                  }}
                                  className="text-blue-color full-sentence"
                                >
                                  Plan Duration
                                </Typography>
                              </Col>
                            </Row>
                          </Row>

                          <Row
                            className="d-flex gap-0 raw"
                            style={{ minWidth: "600px" }}
                          >
                            <Col xs={4} md={4}>
                              <Typography className="text-blue-color full-sentence">
                                {activePlanDetails?.PlanName || "PlanName not available"}
                              </Typography>
                            </Col>

                            <Col xs={4} md={4}>
                              <Typography className="text-blue-color">
                                {activePlanDetails?.PlanDetail || "Plan Detail not available"}
                              </Typography>
                            </Col>

                            <Col xs={4} md={4}>
                              <Typography className="text-blue-color">
                                {activePlanDetails?.dueDate || "Due Date not available"}
                              </Typography>
                            </Col>
                          </Row>
                        </Grid>
                      </Grid>
                    )}
                  </CardContent>
                </Card>
              </Col>
            </Row>
          </Grid>
        </Grid>
      )}
    </>
  );
};

export default Account;

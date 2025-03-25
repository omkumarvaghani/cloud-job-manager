import React, { useState, useEffect } from "react";
import { Button, Card, CardBody, CardHeader, CardText } from "reactstrap";
import "./style.css";
import AxiosInstance from "../../AxiosInstance";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Grid } from "@mui/material";
import { LoaderComponent } from "../../../components/Icon/Index";
import { Typography } from "@mui/material";

function Index() {
  const baseUrl = process.env.REACT_APP_BASE_API;
  const navigate = useNavigate();
  const location = useLocation();
  const { CompanyName } = useParams();

  const [plans, setPlans] = useState([]);
  const [loader, setLoader] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await AxiosInstance.get(`${baseUrl}/plan`);

        if (response?.status === 200 && response?.data?.data) {
          const mostPopularItem = response?.data?.data?.find(
            (item) => item?.IsMostpopular
          );
          const otherItems = response?.data?.data?.filter(
            (item) => !item?.IsMostpopular
          );
          const middleIndex = Math?.floor(otherItems?.length / 2);
          const sortedItems = [
            ...otherItems?.slice(0, middleIndex),
            mostPopularItem,
            ...otherItems?.slice(middleIndex),
          ];
          setPlans(sortedItems?.filter((plan) => plan));
        } else {
          console.error("Failed to fetch data", response);
        }
      } catch (error) {
        console.error("There was an error fetching the data!", error);
      } finally {
        setLoader(false);
      }
    };

    fetchPlans();
  }, []);

  const mostPopularIndex = plans?.findIndex((plan) => plan?.IsMostpopular);
  let reorderedPlans = [...plans];
  if (mostPopularIndex !== -1) {
    const [mostPopularPlan] = reorderedPlans?.splice(mostPopularIndex, 1);
    reorderedPlans?.splice(1, 0, mostPopularPlan);
  }

  function getPlanFrequencyDisplay(monthFrequency) {
    if (monthFrequency === "12 (Annually)") {
      return "year";
    } else if (monthFrequency === "1") {
      return `month`;
    } else {
      return `${monthFrequency?.split(" ")[0]} month`;
    }
  }

  return (
    <Grid className="plan d-flex flex-column justify-content-center py-lg-5">
      <Grid className="d-flex justify-content-center Title">
        <Typography
          className="text-blue-color heading-three"
          style={{ fontWeight: 700, fontSize: "38px" }}
        >
          Select a plan
        </Typography>
      </Grid>
      <Grid className="d-flex justify-content-center">
        <Typography
          style={{
            fontFamily: "Poppins",
            fontWeight: "500",
            fontSize: "24px",
            lineHeight: "28.8px",
            textAlign: "center",
          }}
          className="my-3 mb-3 Heading text-blue-color"
        >
          Compare the plans to determine which one is most suitable for your
          business.
        </Typography>
      </Grid>
      <Grid className="d-flex justify-content-center">
        <Typography
          className="my-3 text-blue-color"
          style={{ fontSize: "16px", fontWeight: "400", textAlign: "center" }}
        >
          Unlock significant savings with an annual subscription.
        </Typography>
      </Grid>
      <Grid
        className="card-plan d-flex flex-wrap justify-content-center"
        style={{
          marginTop: "30px",
          width: "100%",
          gap: "1%",
        }}
      >
        {plans.length === 0 ? (
          <Grid className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5">
            <LoaderComponent loader={loader} height="50" width="50" />
          </Grid>
        ) : (
          <Grid
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "20px",
              justifyContent: "center",
            }}
          >
            {reorderedPlans?.map((plan, index) =>
              plan ? (
                <Grid
                  key={plan?._id}
                  className={plan?.IsMostpopular ? "mostpopularcard" : ""}
                >
                  <Card
                    className={` ${index === 0 ? "first-card" : "first-card"}`}
                    style={{
                      width: "18rem",
                      borderRadius: "50px",
                      ...(plan?.IsMostpopular ? {} : {}),
                      marginTop: plan?.IsMostpopular ? "0px" : "50px",
                      height: plan?.IsMostpopular ? "auto" : "",
                    }}
                  >
                    <CardHeader
                      className={`text-center ${
                        plan?.IsMostpopular
                          ? "bg-blue-color"
                          : "text-blue-color"
                      }`}
                      style={{
                        fontWeight: 700,
                        fontSize: "24px",
                        background: "none",
                        border: "none",
                        borderTopLeftRadius: plan?.IsMostpopular ? "50px" : "",
                        borderTopRightRadius: plan?.IsMostpopular ? "50px" : "",
                      }}
                    >
                      {plan?.IsMostpopular && (
                        <Typography className="mb-0 my-0">
                          <i
                            className="text-white-color"
                            style={{
                              fontStyle: "Sarabun italic",
                              fontWeight: "400",
                              fontSize: "24px",
                            }}
                          >
                            Most Popular
                          </i>
                        </Typography>
                      )}
                      <Typography
                        className={`mb-0 ${
                          plan?.IsMostpopular
                            ? "text-white-color"
                            : "text-blue-color"
                        }`}
                        style={{
                          color: plan?.IsMostpopular ? "#063164" : "",
                          fontWeight: plan?.IsMostpopular ? 700 : "",
                          fontSize: "24px",
                        }}
                      >
                        {plan?.PlanName || "PlanName not available"}
                      </Typography>
                    </CardHeader>
                    <CardBody className="text-center">
                      <CardText
                        className="text-blue-color"
                        style={{
                          fontWeight: 500,
                          fontSize: "14px",

                          fontFamily: "Poppins",
                          lineHeight: "24px",
                        }}
                      >
                        {plan?.PlanDetail || "PlanDetail not available"}
                      </CardText>
                      <hr />
                      <CardText
                        className="text-blue-color"
                        style={{
                          fontWeight: 600,
                          fontSize: "24px",
                          fontFamily: "Poppins",
                          lineHeight: "24px",
                        }}
                      >
                        ${Number(plan?.PlanPrice).toFixed(2)}/
                        {getPlanFrequencyDisplay(plan?.MonthFrequency)}
                        <br />
                        <Typography
                          style={{
                            fontSize: "20px",
                            fontWeight: 300,
                            marginTop: "5px",
                          }}
                        >
                          $
                          {Number(
                            Number(plan?.PlanPrice) /
                              Number(plan?.MonthFrequency?.split(" ")[0])
                          ).toFixed(2)}
                          /month
                        </Typography>
                      </CardText>
                      <Button
                        className="text-blue-color outline"
                        outline
                        style={{
                          marginTop: "35px",
                          marginBottom: "20px",
                          boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
                          padding: "3px 10px",
                          fontWeight: "500",
                          fontSize: "20px",

                          color: plan?.IsMostpopular ? "#fff" : "",
                        }}
                        onClick={() => {
                          if (!location.state?.plan) {
                            if (CompanyName) {
                              navigate(`/${CompanyName}/plan-purchase`, {
                                state: {
                                  navigats: [
                                    ...location?.state?.navigats,
                                    "/plan-purchase",
                                  ],
                                  plan,
                                  card: location?.state?.card || "",
                                },
                              });
                            } else {
                              navigate("/plan-purchase", {
                                state: {
                                  plan,
                                },
                              });
                            }
                          }
                        }}
                      >
                        {location?.state?.plan ? "Upgrade Plan" : "Select Plan"}
                      </Button>
                      <Grid
                        style={{ display: plan?.IsMostpopular ? "" : "none" }}
                      >
                        <Typography className="my-2 choose_connect">
                          <i
                            className="text-blue-color"
                            style={{ fontSize: "12px" }}
                          >
                            <Typography className="bold-text">
                              40% of Security and Alarm businesses
                            </Typography>
                            <br />
                            <Typography className="text-blue-color">
                              choose Connect
                            </Typography>
                          </i>
                        </Typography>
                      </Grid>
                    </CardBody>
                  </Card>
                </Grid>
              ) : null
            )}
          </Grid>
        )}
      </Grid>
    </Grid>
  );
}

export default Index;

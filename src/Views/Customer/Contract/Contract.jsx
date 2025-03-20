// import React, { useEffect, useState } from "react";
// import { Card, CardBody, CardFooter, CardHeader, CardText } from "reactstrap";
// import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
// import MyLocationOutlinedIcon from "@mui/icons-material/MyLocationOutlined";
// import AxiosInstance from "../../AxiosInstance";
// import moment from "moment";
// import { useLocation, useNavigate } from "react-router-dom";
// import { handleAuth } from "../../../components/Login/Auth";
// import "../style.css";
// import { Circles } from "react-loader-spinner";
// import { LoaderComponent } from "../../../components/Icon/Index";
// import { Grid, Typography } from "@mui/material";
// import { Row, Col } from "react-bootstrap";

// function Quotes() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [loader, setLoader] = useState(true);
//   useEffect(() => {
//     handleAuth(navigate, location);
//   }, [navigate, location]);

//   const baseUrl = process.env.REACT_APP_BASE_API;
//   const [quotes, setquotes] = useState({
//     Today: [],
//     Upcoming: [],
//     Scheduled: [],
//   });
//   const [error, setError] = useState(null);

//   const CustomerId = localStorage.getItem("CustomerId");

//   useEffect(() => {
//     const fetchquotes = async () => {
//       try {
//         const response = await AxiosInstance.get(
//           `/contract/contracts/${CustomerId}`
//         );
//         if (response?.data.statusCode === 200) {
//           setquotes(response?.data?.data);
//         } else {
//           setError(response?.data?.message);
//         }
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoader(false);
//       }
//     };

//     fetchquotes();
//   }, [CustomerId]);
//   const hasQuotes = Object.keys(quotes).some(
//     (Status) => quotes[Status].length > 0
//   );

//   const renderquotes = (Status) => {
//     return quotes[Status].map((quote) => (
//       <Card
//         className="invoice-card"
//         key={quote?.ContractId}
//         onClick={() =>
//           navigate(`/customers/contract-details`, {
//             state: {
//               id: quote?.ContractId,
//               navigats: [...location?.state?.navigats, "/contract-details"],
//             },
//           })
//         }
//       >
//         <CardHeader className="invoice-card-header">
//           Contract #{quote?.ContractNumber}
//         </CardHeader>
//         <CardBody>
//           <CardText className="invoice-card-text text-blue-color">
//             <CalendarMonthOutlinedIcon className="invoice-icon" /> Sent{" "}
//             {moment(quote.createdAt).format("MM-DD-YYYY")}
//           </CardText>
//           <CardText className="invoice-card-text text-blue-color">
//             <MyLocationOutlinedIcon className="invoice-icon" />{" "}
//             {quote?.address?.Address} {quote?.address?.City} <br />
//             {quote?.address?.State}, {quote?.address?.state}
//             {quote?.property?.Country}
//           </CardText>
//         </CardBody>
//         <CardFooter className="invoice-card-footer text-blue-color">
//           <Typography className="bold-text">
//             Total :
//             {quote?.Total
//               ? `$${new Intl.NumberFormat("en-US", {
//                   minimumFractionDigits: 2,
//                   maximumFractionDigits: 2,
//                 }).format(quote?.Total)}`
//               : ""}
//           </Typography>
//         </CardFooter>
//       </Card>
//     ));
//   };

//   return (
//     <>
//       {loader ? (
//         <Grid
//           className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5"
//           style={{ height: "80vh", marginTop: "25%" }}
//         >
//           <LoaderComponent loader={loader} height="50" width="50" />
//         </Grid>
//       ) : (
//         <Grid>
//           <Typography className="invoice-header fw-bolder">
//             Your Contract
//           </Typography>

//           <Grid className="invoice-grid">
//             {hasQuotes ? (
//               Object.keys(quotes).map(
//                 (Status) =>
//                   quotes[Status]?.length > 0 && (
//                     <Grid
//                       key={Status}
//                       className="invoice-status-section"
//                       style={{ flexDirection: "column" }}
//                     >
//                       <Typography
//                         className="invoice-status-header mb-3 statusHead"
//                         style={{ width: "50%" }}
//                       >
//                         {Status}
//                       </Typography>
//                       <Grid
//                         className="invoice-status-cards"
//                         style={{ flexDirection: "column" }}
//                       >
//                         {renderquotes(Status)}
//                       </Grid>
//                     </Grid>
//                   )
//               )
//             ) : (
//               <Typography className="no-data-found">
//                 No Contract Found
//               </Typography>
//             )}
//           </Grid>
//         </Grid>
//       )}
//     </>
//   );
// }

// export default Quotes;

import React, { useEffect, useState } from "react";
import { Card, CardBody, CardFooter, CardHeader, CardText } from "reactstrap";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import MyLocationOutlinedIcon from "@mui/icons-material/MyLocationOutlined";
import AxiosInstance from "../../AxiosInstance";
import moment from "moment";
import { useLocation, useNavigate } from "react-router-dom";
import { handleAuth } from "../../../components/Login/Auth";
import "../style.css";
import { Grid, Typography, Button } from "@mui/material";
import { LoaderComponent } from "../../../components/Icon/Index";
import BlueButton from "../../../components/Button/BlueButton";

function Quotes() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loader, setLoader] = useState(true);

  useEffect(() => {
    handleAuth(navigate, location);
  }, [navigate, location]);

  const baseUrl = process.env.REACT_APP_BASE_API;
  const [quotes, setQuotes] = useState({
    Today: [],
    Upcoming: [],
    Scheduled: [],
  });
  const [error, setError] = useState(null);
  const [visibleRecords, setVisibleRecords] = useState({}); // Tracks visible records for each status

  const CustomerId = localStorage.getItem("CustomerId");

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const response = await AxiosInstance.get(
          `/contract/contracts/${CustomerId}`
        );
        if (response?.data.statusCode === 200) {
          setQuotes(response?.data?.data);

          // Initialize visibleRecords for each status to 5
          const initialVisibleRecords = {};
          Object.keys(response?.data?.data).forEach((status) => {
            initialVisibleRecords[status] = 5;
          });
          setVisibleRecords(initialVisibleRecords);
        } else {
          setError(response?.data?.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoader(false);
      }
    };

    fetchQuotes();
  }, [CustomerId]);

  const hasQuotes = Object.keys(quotes).some(
    (status) => quotes[status].length > 0
  );

  const renderQuotes = (status) => {
    return quotes[status]
      .slice(0, visibleRecords[status]) // Limit to visible records for the status
      .map((quote) => (
        <Card
          className="invoice-card"
          key={quote?.ContractId}
          onClick={() =>
            navigate(`/customers/contract-details`, {
              state: {
                id: quote?.ContractId,
                navigats: [...location?.state?.navigats, "/contract-details"],
              },
            })
          }
        >
          <CardHeader className="invoice-card-header">
            Contract #{quote?.ContractNumber}
          </CardHeader>
          <CardBody>
            <CardText className="invoice-card-text text-blue-color">
              <CalendarMonthOutlinedIcon className="invoice-icon" /> Sent{" "}
              {moment(quote.createdAt).format("MM-DD-YYYY")}
            </CardText>
            <CardText className="invoice-card-text text-blue-color">
              <MyLocationOutlinedIcon className="invoice-icon" />{" "}
              {quote?.address?.Address || "Address not available"} {quote?.address?.City || "City not available"}{" "}
              <br />
              {quote?.address?.State || "State not available"},
              {quote?.address?.Country || "Country not available"}
            </CardText>
          </CardBody>
          <CardFooter className="invoice-card-footer text-blue-color">
            <Typography className="bold-text">
              Total :
              {quote?.Total
                ? `$${new Intl.NumberFormat("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(quote?.Total)}`
                : ""}
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
            Your Contract
          </Typography>

          <Grid className="invoice-grid">
            {hasQuotes ? (
              Object.keys(quotes).map(
                (status) =>
                  quotes[status]?.length > 0 && (
                    <Grid
                      key={status}
                      className="invoice-status-section"
                      style={{ flexDirection: "column" }}
                    >
                      <Typography
                        className="invoice-status-header mb-3 statusHead"
                        style={{ width: "50%" }}
                      >
                        {status}
                      </Typography>
                      <Grid
                        className="invoice-status-cards"
                        style={{ flexDirection: "column" }}
                      >
                        {renderQuotes(status)}
                      </Grid>
                      {quotes[status].length > 5 &&
                        visibleRecords[status] < quotes[status].length && (
                          <BlueButton
                            onClick={() =>
                              setVisibleRecords((prev) => ({
                                ...prev,
                                [status]: quotes[status].length,
                              }))
                            }
                            variant="contained"
                            style={{ marginTop: "1rem" }}
                            label="  Read More"
                          />
                        )}
                    </Grid>
                  )
              )
            ) : (
              <Typography className="no-data-found">
                No Contract Found
              </Typography>
            )}
          </Grid>
        </Grid>
      )}
    </>
  );
}

export default Quotes;

import React, { useEffect, useState } from "react";
import { Card, CardBody, Input } from "reactstrap";
import "./style.css";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AxiosInstance from "../../AxiosInstance";
import invoice from "../../../assets/White-sidebar-icon/Invoice.svg";
import { CardHeader, CardTitle, Table } from "reactstrap";
import { Grid, TableBody, TableCell, TableRow } from "@mui/material";
import { LoaderComponent } from "../../../components/Icon/Index";
import WhiteButton from "../../../components/Button/WhiteButton";
import BlueButton from "../../../components/Button/BlueButton";
import { Typography } from "@mui/material";

const InvoiceTable = () => {
  const [customerData, setCustomerData] = useState([]);
  console.log(customerData, "customerData");
  const [selectedCustomerData, setSelectedCustomerData] = useState();
  const [loader, setLoader] = useState(false);
  const navigate = useNavigate();
  const { CompanyName } = useParams();
  const baseUrl = process.env.REACT_APP_BASE_API;
  const location = useLocation();
  console.log(location, "locationlocation");
  useEffect(() => {
    const fetchData = async () => {
      const CustomerId = location?.state?.UserId;
      console.log(location?.state?.UserId, "Location State");
      console.log(CustomerId, "CustomerId");
      if (!CustomerId) return;
      setLoader(true);
      try {
        const res = await AxiosInstance.get(
          `${baseUrl}/v1/contract/get_invoice_data/${CustomerId}`
        );
        console.log(res, "resresres");
        const data = res?.data?.data;
        console.log(res?.data?.data.contracts, "data.contracts");
        setCustomerData(data[0]?.contracts);
      } catch (error) {
        console.error("Error: ", error?.message);
      } finally {
        setLoader(false);
      }
    };

    fetchData();
  }, [location?.state?.CustomerId]);

  const handleCheckboxChange = (item) => {
    setSelectedCustomerData(item);
  };

  const handleRowClick = (item) => {
    handleCheckboxChange(item);
  };

  const handleCheckboxClick = (event, item) => {
    event.stopPropagation();
    handleCheckboxChange(item);
  };

  // const [selectedCustomerData, setSelectedCustomerData] = useState(null);

  const handleRadioChange = (item) => {
    setSelectedCustomerData(item); // Update the selected customer data
  };

  const [checkedVisits, setCheckedVisits] = useState({});
  const handleCheckboxvisitChange = (key, visitIndex) => {
    setCheckedVisits((prev) => {
      const updatedState = {
        ...prev,
        [`${key}-${visitIndex}`]: !prev[`${key}-${visitIndex}`],
      };
      console.log("Checkbox State Updated:", updatedState); // Debug log
      return updatedState;
    });
  };

  return (
    <Grid>
      <Card className="my-2" style={{ borderRadius: "15px" }}>
        <CardHeader
          className="invoice-header invoiceChoiceImg"
          style={{ background: "transparent" }}
        >
          <Typography className="d-flex mt-1 ">
            <Typography
              className="mb-2 invoiceAddIcon bg-blue-color"
              style={{
                borderRadius: "50%",
                width: "49px",
                padding: "10px 2px 12px 15px",
              }}
            >
              <img src={invoice} alt="Invoice Icon" />
            </Typography>
            <Typography
              style={{
                fontSize: "27px",
                fontWeight: "700",
                marginTop: "7px",
                marginLeft: "10px",
              }}
              className="invoiceFontSize text-blue-color"
            >
              New Invoice{" "}
            </Typography>
          </Typography>
        </CardHeader>
        <CardBody>
          <CardTitle tag="h5" className="text-blue-color">
            Select the Contracts you want to invoice:
          </CardTitle>
        </CardBody>
        <Grid className="p-4">
          {loader ? (
            <Grid className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5">
              <LoaderComponent loader={loader} height="50" width="50" />
            </Grid>
          ) : customerData?.length === 0 ? (
            <Grid className="d-flex justify-content-center align-items-center my-5 text-blue-color">
              <Typography>No Contracts Available</Typography>
            </Grid>
          ) : (
            <Grid
              style={{
                border: "1px solid rgba(6, 49, 100, 0.3)",
                borderRadius: "20px",
                maxHeight: "400px",
                overflowY: "auto",
              }}
            >
              <Table
                borderless
                className="mb-0"
                style={{ overflowX: "scroll" }}
              >
                <TableCell className="backgroundColor-table">
                  <Typography></Typography>
                </TableCell>
                <TableCell className="backgroundColor-table">
                  <Typography className="invoiceTable-heade">
                    Contract Number
                  </Typography>
                </TableCell>
                <TableCell className="backgroundColor-table">
                  <Typography className="invoiceTable-heade">
                    Contract Title
                  </Typography>
                </TableCell>
                <TableCell className="backgroundColor-table">
                  <Typography className="invoiceTable-heade">Status</Typography>
                </TableCell>
                <TableCell className="backgroundColor-table">
                  <Typography className="invoiceTable-heade">
                    Address
                  </Typography>
                </TableCell>
                <TableCell className="backgroundColor-table">
                  <Typography className="invoiceTable-heade">Amount</Typography>
                </TableCell>
                <TableBody>
                  {customerData?.map((item, index) => (
                    <React.Fragment key={index}>
                      <TableRow
                        className="invoice-table"
                        style={{
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                        onClick={() => handleRowClick(item)} // Handle row click to toggle expansion
                      >
                        <TableCell
                          component="th"
                          scope="row"
                          style={{
                            borderTopLeftRadius: "20px",
                            borderBottomLeftRadius: "20px",
                            padding: "20px",
                            fontSize: "17px",
                          }}
                        >
                          <Input
                            style={{ marginLeft: "12px" }}
                            type="checkbox" // Changed to checkbox
                            name="customerCheckbox"
                            id={`checkbox-${index}`} // Updated ID for checkbox
                            checked={selectedCustomerData === item}
                            onChange={() => handleCheckboxChange(item)} // Update state on change
                          />
                        </TableCell>
                        <TableCell
                          className="text-blue-color"
                          style={{
                            padding: "20px",
                            fontSize: "17px",
                            fontWeight: "600",
                            whiteSpace: "nowrap",
                          }}
                        >
                          #
                          {item?.ContractNumber ||
                            "ContractNumber not available"}
                        </TableCell>
                        <TableCell
                          className="text-blue-color"
                          style={{
                            padding: "20px",
                            fontSize: "17px",
                            fontWeight: "600",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item?.Title}
                        </TableCell>
                        <TableCell
                          style={{
                            padding: "20px",
                            fontSize: "17px",
                            color: item?.visits?.some(
                              (visit) => visit?.IsComplete
                            )
                              ? "#089F57"
                              : "#E88C44",
                          }}
                        >
                          {item?.visits?.some((visit) => visit?.IsComplete)
                            ? "Completed"
                            : "Pending"}
                        </TableCell>
                        <TableCell
                          className="text-blue-color"
                          style={{ padding: "20px", fontSize: "17px" }}
                        >
                          {item?.visits?.[0]?.ItemName || "Item not available"}
                        </TableCell>
                        <TableCell
                          className="text-blue-color"
                          style={{
                            borderTopRightRadius: "20px",
                            borderBottomRightRadius: "20px",
                            padding: "20px",
                            fontSize: "17px",
                            fontWeight: "600",
                          }}
                        >
                          {new Date(
                            item?.visits?.[0]?.StartDate
                          ).toLocaleDateString() || "Start Date not available"}
                        </TableCell>
                      </TableRow>
                      {selectedCustomerData === item &&
                        item.visits?.map((visit, visitIndex) => (
                          <>
                            {console.log(
                              selectedCustomerData,
                              "selectedCustomerData"
                            )}
                            {console.log(item.visits, "item.visitsitem.visits")}
                            {Object.keys(visit).map((key) => {
                              if (
                                key === "todayVisit" ||
                                key === "upcomingVisit"
                              ) {
                                const visitData = visit[key];
                                return (
                                  <React.Fragment key={`${visitIndex}-${key}`}>
                                    {" "}
                                    {key === "todayVisit" &&
                                      visitIndex === 0 && (
                                        <TableRow>
                                          <TableCell
                                            colSpan={6}
                                            style={{
                                              fontWeight: "bold",
                                              fontSize: "20px",
                                              backgroundColor: "#e0f7fa",
                                              textAlign: "start",
                                              padding: "15px",
                                            }}
                                          >
                                            Today's Visits
                                          </TableCell>
                                        </TableRow>
                                      )}
                                    {key === "upcomingVisit" &&
                                      visitIndex === 0 && (
                                        <TableRow>
                                          <TableCell
                                            colSpan={6}
                                            style={{
                                              fontWeight: "bold",
                                              fontSize: "20px",
                                              backgroundColor: "#ffecb3",
                                              textAlign: "start",
                                              padding: "15px",
                                            }}
                                          >
                                            Upcoming Visits
                                          </TableCell>
                                        </TableRow>
                                      )}
                                    <TableRow
                                      className="invoice-table"
                                      key={`${visitIndex}-${key}-row`}
                                      style={{
                                        borderBottom:
                                          "1px solid rgba(6, 49, 100, 0.3)",
                                        cursor: "pointer",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      <TableCell
                                        component="th"
                                        scope="row"
                                        style={{
                                          borderTopLeftRadius: "20px",
                                          borderBottomLeftRadius: "20px",
                                          padding: "20px",
                                          fontSize: "17px",
                                        }}
                                      >
                                        <Input
                                          style={{ marginLeft: "12px" }}
                                          type="checkbox"
                                          name="customerCheckbox"
                                          id={`checkbox-${index}-${visitIndex}-${key}`} // Unique ID for each visit
                                          checked={
                                            !!checkedVisits[
                                              `${key}-${visitIndex}`
                                            ]
                                          } // Controlled checkbox
                                          onChange={() =>
                                            handleCheckboxvisitChange(
                                              key,
                                              visitIndex
                                            )
                                          }
                                        />
                                      </TableCell>

                                      <TableCell
                                        className="text-blue-color"
                                        style={{
                                          padding: "20px",
                                          fontSize: "17px",
                                          fontWeight: "600",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        #{" "}
                                        {item?.ContractNumber ||
                                          "ContractNumber not available"}
                                      </TableCell>

                                      <TableCell
                                        className="text-blue-color"
                                        style={{
                                          padding: "20px",
                                          fontSize: "17px",
                                          fontWeight: "600",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        {item?.Title}
                                      </TableCell>

                                      <TableCell
                                        style={{
                                          padding: "20px",
                                          fontSize: "17px",
                                          color: visitData?.IsComplete
                                            ? "#089F57"
                                            : "#E88C44",
                                        }}
                                      >
                                        {visitData?.IsComplete
                                          ? "Completed"
                                          : "Pending"}
                                      </TableCell>

                                      <TableCell
                                        className="text-blue-color"
                                        style={{
                                          padding: "20px",
                                          fontSize: "17px",
                                        }}
                                      >
                                        {visitData?.ItemName ||
                                          "Item not available"}
                                      </TableCell>

                                      <TableCell
                                        className="text-blue-color"
                                        style={{
                                          borderTopRightRadius: "20px",
                                          borderBottomRightRadius: "20px",
                                          padding: "20px",
                                          fontSize: "17px",
                                          fontWeight: "600",
                                        }}
                                      >
                                        {new Date(
                                          visitData?.StartDate
                                        ).toLocaleDateString() ||
                                          "Start Date not available"}
                                      </TableCell>
                                    </TableRow>
                                  </React.Fragment>
                                );
                              }
                              return null;
                            })}
                          </>
                        ))}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </Grid>
          )}
        </Grid>

        <Grid
          className="BlueAndWhiteBtmFlex invoiceBtnGap"
          style={{
            margin: "0 30px 20px 30px",
            justifyContent: "space-between",
            display: "flex",
          }}
        >
          <WhiteButton onClick={() => navigate(-1)} label="Cancel" />
          <BlueButton
            onClick={() => {
              navigate(
                CompanyName
                  ? `/${CompanyName}/addinvoice`
                  : "/staff-member/workeraddinvoice",
                {
                  state: {
                    navigats: ["/index", "/addinvoice"],
                    id: selectedCustomerData?.contract?.ContractId,
                  },
                }
              );
            }}
            disabled={!selectedCustomerData}
            label="Next"
          />
        </Grid>
      </Card>
    </Grid>
  );
};

export default InvoiceTable;

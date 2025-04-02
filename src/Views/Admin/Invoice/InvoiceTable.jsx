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
        setCustomerData(data.contracts || data.locations);
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
          ) : customerData.length === 0 ? (
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
                    <TableRow
                      className="invoice-table"
                      key={index}
                      onClick={() => handleRowClick(index)}
                      style={{
                        borderBottom:
                          index !== customerData?.length - 1
                            ? "1px solid rgba(6, 49, 100, 0.3)"
                            : "none",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {console.log(item, "itemitem")}
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
                          id={`checkbox-${index}`}
                          checked={selectedCustomerData === item || false}
                          onClick={(event) => handleCheckboxClick(event, item)}
                        />
                      </TableCell>
                      <TableCell
                        className=" text-blue-color"
                        style={{
                          padding: "20px",
                          fontSize: "17px",
                          fontWeight: "600",
                          whiteSpace: "nowrap",
                        }}
                      >
                        #
                        {item?.ContractNumber || "ContractNumber not available"}
                      </TableCell>
                      <TableCell
                        className=" text-blue-color"
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
                          color:
                            item?.Status === "Unscheduled"
                              ? "#E88C44"
                              : item?.Status === "Today"
                              ? "#089F57"
                              : item?.Status === "Upcoming"
                              ? "#089F57"
                              : item?.Status === "Scheduled"
                              ? "#C8CC00"
                              : "",
                          fontSize: "17px",
                        }}
                      >
                        {item?.Status || "Status not available"}
                      </TableCell>
                      <TableCell
                        className="text-blue-color"
                        style={{
                          padding: "20px",
                          fontSize: "17px",
                        }}
                      >
                        {item?.locations?.[0]?.Address ||
                          "Address not available"}
                        ,{item?.locations?.[0]?.City || ""},
                        {item?.locations?.[0]?.State || ""},
                        {item?.locations?.[0]?.Country || ""}
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
                        ${item?.Total || "Total not available"}
                      </TableCell>
                    </TableRow>
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

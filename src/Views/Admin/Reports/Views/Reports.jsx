import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardBody, CardFooter, CardHeader, Col } from "reactstrap";
import {
  JobberPagination,
  JobberSearch,
  JobberTable,
} from "../../../../components/MuiTable";
import { Grid, Typography } from "@mui/material";
import BlueButton from "../../../../components/Button/BlueButton";
import { LoaderComponent } from "../../../../components/Icon/Index";

const Reports = ({
  loader,
  search,
  setSearch,
  cellData,
  collapseData,
  page,
  setPage,
  setRowsPerPage,
  companyName,
  countData,
  rowsPerPage,
  isEdited,
  handleCardClick,
  tokenDecode
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <>
      <Grid className="justify-content-center align-items-center mb-3">
        <Grid className="d-flex justify-content-between mb-2 align-items-center customersAddCustomers">
          <Typography
            className="text-blue-color heading-three mb-3 tableNameHead"
            style={{ fontWeight: 700 }}
          >
            Reports
          </Typography>
        </Grid>
        <Grid className="d-flex gap-2">
          <Col lg={4} md={4} sm={12}>
            <Card
              className="border-blue-color"
              style={{
                borderRadius: "20px",
                border: "1px solid",
                padding: 0,
                height: "130px",
                boxShadow:
                  "rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px",
                  cursor:"pointer",
              }}
              onClick={() =>
                navigate(`/${companyName}/reports-details`, {
                  state: {
                    navigats: [
                      ...location?.state?.navigats,
                      "/reports-details",
                    ],
                    // id: tokenDecode?.CompanyId,
                  },
                })
              }
            >
              <CardHeader
                className="d-flex justify-content-start align-items-center table-header border-orange-color customerList_searchbar customersAddCustomers"
                style={{
                  borderBottom: "3px solid",
                  borderTopLeftRadius: "15px",
                  borderTopRightRadius: "15px",
                  background: "transparent",
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Sirf bottom me shadow ke liye
                }}
              >
                <Typography
                  className="quot text-blue-color text-light customerList_head tableNameHead fw-medium"
                  style={{ fontSize: "18px" }}
                >
                  Daily Transaction Report
                </Typography>
              </CardHeader>

              <CardBody
                className="text-blue-color"
                style={{ fontSize: "14px" }}
              >
                Reports of daily transaction
              </CardBody>
            </Card>
          </Col>
        </Grid>{" "}
      </Grid>
    </>
  );
};

export default Reports;

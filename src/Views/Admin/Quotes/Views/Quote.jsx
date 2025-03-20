import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./style.css";
import { Card, CardBody, CardFooter, CardHeader } from "reactstrap";

import {
  JobberPagination,
  JobberSearch,
  JobberSorting,
  JobberTable,
} from "../../../../components/MuiTable";
import { Grid } from "@mui/material";
import BlueButton from "../../../../components/Button/BlueButton";
import { LoaderComponent } from "../../../../components/Icon/Index";
import { Typography } from "@mui/material";
import { useStaffContext } from "../../../../components/StaffData/Staffdata.jsx";

const Quote = ({
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
  dropdownOptions,
  handleDropdownSelect,
  setSortField,
  setSortOrder,
  sortOrder,
  sortField,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { staffData } = useStaffContext();

  return (
    <>
      <Grid className="justify-content-center align-items-center mb-3">
        <Grid className="d-flex justify-content-between mb-2 align-items-center customer_addCustomer_div customersAddCustomers">
          <Typography
            className="text-blue-color customer_para heading-three tableNameHead"
            style={{ fontWeight: 700 }}
          >
            Quotes
          </Typography>
          {(staffData?.Quotes?.ViewCreateAndEdit ||
            staffData?.Quotes?.ViewCreateEditAndDelete ||
            !staffData) && (
            <Grid className="searchBarOfTable">
              <BlueButton
                onClick={() => {
                  if (companyName) {
                    navigate(`/${companyName}/add-quotes`, {
                      state: {
                        navigats: [...location?.state?.navigats, "/add-quotes"],
                      },
                    });
                  } else {
                    navigate(`/staff-member/add-quotes`, {
                      state: {
                        navigats: [...location?.state?.navigats, "/add-quotes"],
                      },
                    });
                  }
                }}
                label="Add Quotes"
              />
            </Grid>
          )}
        </Grid>
        <Card
          className="border-blue-color"
          style={{
            borderRadius: "20px",
            border: "1px solid ",
            padding: 0,
          }}
        >
          <CardHeader
            className="d-flex justify-content-between align-items-center table-header border-blue-color bg-blue-color customerList_searchbar customersAddCustomers"
            style={{
              borderBottom: "1px solid ",
              borderTopLeftRadius: "15px",
              borderTopRightRadius: "15px",
            }}
          >
            <Typography className="quot text-light customerList_head heading-five tableNameHead fw-medium">
              Quotes List
            </Typography>
            <Grid className=" quotesearch gap-2 d-flex customer_searchBar searchBarOfTable">
              <JobberSorting
                dropdownItems={dropdownOptions}
                placeholder="Select status"
                onSelect={handleDropdownSelect}
              />

              <JobberSearch
                search={search}
                setSearch={setSearch}
                onSelect={handleDropdownSelect}
                style={{ background: "transparant", color: "white" }}
              />
            </Grid>
          </CardHeader>
          {loader ? (
            <Grid className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5">
              <LoaderComponent loader={loader} height="50" width="50" />
            </Grid>
          ) : (
            <CardBody style={{ padding: "10px 0px" }}>
              <JobberTable
                // headerData={[
                //   "Sr No.",
                //   "Customer Name ",
                //   "Quote Number",
                //   "Property",
                //   "Created At",
                //   "Status",
                //   "Total",
                //   "Action",
                // ]}
                headerData={[
                  { label: "Sr No.", field: "QuoteId" },
                  { label: "Customer Name", field: "customerData.FirstName" },
                  { label: "Quote Number", field: "QuoteNumber" },
                  { label: "Property", field: "locationData.Address" },
                  { label: "Created At", field: "Created At" },
                  { label: "Status", field: "Status" },
                  { label: "Total", field: "Total" },
                  ...(!staffData?.Quotes?.ViewOnly
                    ? [{ label: "Action", field: "" }]
                    : []),
                ]}
                cellData={cellData}
                collapseData={collapseData}
                setSortField={setSortField}
                setSortOrder={setSortOrder}
                sortOrder={sortOrder}
                sortField={sortField}
                isCollapse={false} 
                page={page} 
                isNavigate={true}
                navigatePath={
                  companyName
                    ? `/${companyName}/quotes-detail`
                    : `/staff-member/worker-quotes-details`
                }
              /> 
            </CardBody>
          )}
          <CardFooter
            className="bg-orange-color border-blue-color"
            style={{
              borderTop: "1px solid ",
              borderBottomLeftRadius: "20px",
              borderBottomRightRadius: "20px",
            }}
          >
            <JobberPagination
              totalData={countData}
              currentData={rowsPerPage}
              dataPerPage={rowsPerPage}
              pageItems={[10, 25, 50]}
              page={page}
              setPage={setPage}
              setRowsPerPage={setRowsPerPage}
            />
          </CardFooter>
        </Card>
      </Grid>
    </>
  );
};

export default Quote;

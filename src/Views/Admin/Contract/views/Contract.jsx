import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Card, CardBody, CardFooter, CardHeader } from "reactstrap";

import {
  JobberPagination,
  JobberSearch,
  JobberSorting,
  JobberTable,
} from "../../../../components/MuiTable";
import { Grid, Typography } from "@mui/material";
import BlueButton from "../../../../components/Button/BlueButton";
import { LoaderComponent } from "../../../../components/Icon/Index";
import { useStaffContext } from "../../../../components/StaffData/Staffdata";

const Contract = ({
  loader,
  search,
  setSearch,
  cellData,
  page,
  setPage,
  setRowsPerPage,
  CompanyName,
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
            Contract
          </Typography>
          {(staffData?.Contract?.ViewCreateAndEdit ||
            staffData?.Contract?.ViewCreateEditAndDelete ||
            !staffData) && (
            <Grid className="searchBarOfTable">
              <BlueButton
                onClick={() => {
                  if (CompanyName) {
                    navigate(`/${CompanyName}/add-contract`, {
                      state: {
                        navigats: [
                          ...location?.state?.navigats,
                          "/add-contract",
                        ],
                      },
                    });
                  } else {
                    navigate(`/staff-member/add-contract`, {
                      state: {
                        navigats: [
                          ...location?.state?.navigats,
                          "/add-contract",
                        ],
                      },
                    });
                  }
                }}
                label="Add Contract"
              />
            </Grid>
          )}
        </Grid>
        <Card
          className="border-blue-color"
          style={{
            borderRadius: "20px",
            border: "2px solid",
            padding: 0,
          }}
        >
          <CardHeader
            className="d-flex justify-content-between align-items-center table-header bg-blue-color customerList_searchbar customersAddCustomers"
            style={{
              borderBottom: "2px solid ",
              borderTopLeftRadius: "15px",
              borderTopRightRadius: "15px",
            }}
          >
            <Typography className="contrac text-light customerList_head heading-five tableNameHead fw-medium">
              All Contracts
            </Typography>
            <Grid className="contractsearch gap-2 d-flex customer_searchBar searchBarOfTable">
              <JobberSorting
                dropdownItems={dropdownOptions}
                placeholder="Select status"
                onSelect={handleDropdownSelect}
              />

              <JobberSearch
                search={search}
                setSearch={setSearch}
                style={{ background: "transparant" }}
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
                //   "Customer Name",
                //   "Contract number",
                //   "Property",
                //   "Schedule",
                //   "Status",
                //   "Total",
                //   "Action",
                // ]}
                headerData={[
                  { label: "Sr No.", field: "CustomerId" },
                  { label: "Customer Name", field: "customer.FirstName" },
                  { label: "Contract number", field: "ContractNumber" },
                  { label: "Property", field: "location.Address" },
                  { label: "Schedule", field: "Schedule" },
                  { label: "Status", field: "Status" },
                  { label: "Total", field: "Total" },
                  ...(!staffData?.Contract?.ViewOnly
                    ? [{ label: "Action", field: "" }]
                    : []),
                ]} 
                setSortField={setSortField}
                setSortOrder={setSortOrder}
                sortOrder={sortOrder}
                sortField={sortField}
                cellData={cellData}
                isCollapse={false}
                page={page}
                isNavigate={true}
                navigatePath={
                  CompanyName
                    ? `/${CompanyName}/contractdetails`
                    : `/staff-member/worker-contract-details`
                }
              />
            </CardBody>
          )}
          <CardFooter
            className="bg-orange-color border-blue-color"
            style={{
              borderTop: "2px solid",
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

export default Contract;

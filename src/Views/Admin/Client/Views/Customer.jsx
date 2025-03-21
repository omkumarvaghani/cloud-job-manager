import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardBody, CardFooter, CardHeader } from "reactstrap";
import {
  JobberPagination,
  JobberSearch,
  JobberTable,
} from "../../../../components/MuiTable";
import { Grid, Typography } from "@mui/material";
import BlueButton from "../../../../components/Button/BlueButton";
import { LoaderComponent } from "../../../../components/Icon/Index";
import { useStaffContext } from "../../../../components/StaffData/Staffdata.jsx";

const Customer = ({
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
  setIsEditMode,
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
        <Grid className="d-flex justify-content-between mb-2 align-items-center customersAddCustomers">
          <Typography
            className="text-blue-color heading-three tableNameHead"
            style={{ fontWeight: 700 }}
          >
            Customers
          </Typography>
          {(staffData?.CustomersProperties
            ?.ViewAndEditFullCustomerAndPropertyInfo ||
            staffData?.CustomersProperties
              ?.ViewEditAndDeleteFullCustomerAndPropertyInfo ||
            !staffData) && (
            <Grid className="searchBarOfTable">
              <BlueButton
                onClick={() => {
                  if (companyName) {
                    navigate(`/${companyName}/add-customer`, {
                      state: {
                        navigats: [
                          ...location?.state?.navigats,
                          "/add-customer",
                        ],
                      },
                    });
                  } else {
                    navigate(`/staff-member/add-customer`, {
                      state: {
                        navigats: [
                          ...location?.state?.navigats,
                          "/add-customer",
                        ],
                      },
                    });
                  }
                }}
                // onClick={() => {
                //   const navigats = location?.state?.navigats || [];
                //   if (companyName) {
                //     navigate(`/${companyName}/add-customer`, {
                //       state: {
                //         navigats: [...navigats, "/add-customer"],
                //       },
                //     });
                //   } else {
                //     navigate(`/staff-member/add-customer`, {
                //       state: {
                //         navigats: [...navigats, "/add-customer"],
                //       },
                //     });
                //   }
                // }}

                label="Add customers"
              />
            </Grid>
          )}
        </Grid>
        <Card
          className="border-blue-color"
          style={{
            borderRadius: "20px",
            border: "1px solid",
            padding: 0,
          }}
        >
          <CardHeader
            className="d-flex justify-content-between align-items-center table-header border-blue-color bg-blue-color customerList_searchbar customersAddCustomers"
            style={{
              borderBottom: "1px solid",
              borderTopLeftRadius: "15px",
              borderTopRightRadius: "15px",
            }}
          >
            <Typography className="quot text-light customerList_head heading-five tableNameHead fw-medium">
              Customers List
            </Typography>
            <Grid className=" customersearch d-flex customer_searchBar searchBarOfTable">
              <JobberSearch
                search={search}
                setSearch={setSearch}
                style={{ background: "transparant", color: "white" }}
              />
            </Grid>
          </CardHeader>
          {loader ? (
            <Grid
              className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5"
              style={{ justifyContent: "center", textAlign: "center" }}
            >
              <LoaderComponent height="50" width="50" loader={loader} />
            </Grid>
          ) : (
            <CardBody style={{ padding: "10px 0px" }}>
              <JobberTable
                headerData={[
                  { label: "Sr No." },  
                  { label: "Full Name", field: "item.FirstName " },
                  { label: "Email", field: "EmailAddress" },
                  { label: "Address", field: "property.Address" },
                  ...(!staffData?.CustomersProperties
                    ?.ViewCustomerNameAndAddressOnly
                    ? [{ label: "Action", field: "" }]
                    : []),
                ]}
                setSortField={setSortField}
                setSortOrder={setSortOrder}
                sortOrder={sortOrder}
                sortField={sortField}
                cellData={cellData}
                collapseData={collapseData}
                isCollapse={false}
                page={page}
                isNavigate={true}
                navigatePath={
                  companyName
                    ? `/${companyName}/customerdetails`
                    : `/staff-member/ClientDetails`
                }
              />
            </CardBody>
          )}
          <CardFooter
            className="bg-orange-color border-blue-color text-blue-color "
            style={{
              borderTop: "1px solid",
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

export default Customer;

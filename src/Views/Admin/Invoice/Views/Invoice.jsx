import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Card, CardBody, CardFooter, CardHeader } from "reactstrap";
import { Grid, Typography } from "@mui/material";
import {
  JobberPagination,
  JobberSearch,
  JobberSorting,
  JobberTable,
} from "../../../../components/MuiTable";
import CustomerModal from "../../Quotes/CustomerModal";
import "./style.css";
import BlueButton from "../../../../components/Button/BlueButton";
import { LoaderComponent } from "../../../../components/Icon/Index";

const Invoice = ({
  loader,
  search,
  setSearch,
  cellData,
  setIsCustomer,
  setModalSource,
  page,
  setPage,
  setRowsPerPage,
  CompanyName,
  countData,
  rowsPerPage,
  isCustomer,
  formik,
  lineItems,
  propertyData,
  setPropertyData,
  isProperty,
  setIsProperty,
  customersData,
  setCustomersData,
  source,
  setStaffData,
  staffData,
  dropdownOptions,
  handleDropdownSelect,
  setSortField,
  setSortOrder,
  sortOrder,
  sortField,
}) => {
  return (
    <>
      <Grid className="justify-content-center align-items-center mb-3">
        <Grid className="d-flex justify-content-between mb-2 align-items-center customer_addCustomer_Grid customersAddCustomers">
          <Typography
            className="text-blue-color customer_para heading-three tableNameHead"
            style={{ fontWeight: 700 }}
          >
            Invoice
          </Typography>
          {(staffData?.Invoice?.ViewCreateAndEdit ||
            staffData?.Invoice?.ViewCreateEditAndDelete ||
            !staffData) && (
            <Grid className="searchBarOfTable">
              <BlueButton
                onClick={(e) => {
                  e.preventDefault();
                  setIsCustomer(true);
                  setModalSource("Invoice");
                }}
                label=" Add Invoice"
              />
            </Grid>
          )}
        </Grid>

        <Card
          className="border-blue-color"
          style={{
            borderRadius: "20px",
            border: "2px solid ",
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
            <Typography className="custe text-light customerList_head heading-five tableNameHead  fw-medium">
              Invoice
            </Typography>
            <Grid className="customer d-flex gap-2 customer_searchBar searchBarOfTable">
              <JobberSorting
                dropdownItems={dropdownOptions}
                placeholder="Select status"
                onSelect={handleDropdownSelect}
              />
              <JobberSearch
                search={search}
                setSearch={setSearch}
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
                //   "Customer Name",
                //   "Invoice Number",
                //   "Address",
                //   "Due Date",
                //   "Total Amount",
                //   "Due Amount",
                //   "Status",
                //   !staffData?.Invoice?.ViewOnly && "Action",
                // ]}
                // headerData={[
                //   { label: "Sr No.", field: "" },
                //   { label: "Customer Name", field: "customerData.FirstName" },
                //   { label: "Invoice Number", field: "customerData.EmailAddress" },
                //   { label: "Address", field: "locationData.Address" },
                //   { label: "Due Date", field: "DueDate" },
                //   { label: "Total Amount", field: " Total" },
                //   { label: "Due Amount", field: "properties.Address" },
                //   { label: "Status", field: "Status" },
                //   !staffData?.Invoice?.ViewOnly && "Action",
                // ]}
                headerData={[
                  { label: "Sr No.", field: "" },
                  { label: "Customer Name", field: "customerData.FirstName" },
                  {
                    label: "Invoice Number",
                    field: "customerData.EmailAddress",
                  },
                  { label: "Address", field: "locationData.Address" },
                  { label: "Due Date", field: "DueDate" },
                  { label: "Total Amount", field: "Total" },
                  { label: "Due Amount", field: "properties.Address" },
                  { label: "Status", field: "Status" },
                  ...(!staffData?.Invoice?.ViewOnly
                    ? [{ label: "Action", field: "" }]
                    : []), 
                ]}
                setSortField={setSortField}
                setSortOrder={setSortOrder}
                sortOrder={sortOrder}
                sortField={sortField}
                cellData={cellData}
                isNavigate={true}
                navigatePath={
                  CompanyName
                    ? `/${CompanyName}/invoice-details`
                    : "/staff-member/worker-invoice-detail"
                }
                isCollapse={false}
                page={page}
              />
            </CardBody>
          )}
          <CardFooter
            className="bg-orange-color border-blue-color"
            style={{
              borderTop: "2px solid ",
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
        <CustomerModal
          isCustomer={isCustomer}
          setIsCustomer={setIsCustomer}
          isProperty={isProperty}
          setIsProperty={setIsProperty}
          setFieldValue={formik?.setFieldValue}
          values={formik?.values}
          lineItems={lineItems}
          propertyData={propertyData}
          setPropertyData={setPropertyData}
          customersData={customersData}
          setCustomersData={setCustomersData}
          formik={formik}
          source={source}
        />
      </Grid>
    </>
  );
};

export default Invoice;

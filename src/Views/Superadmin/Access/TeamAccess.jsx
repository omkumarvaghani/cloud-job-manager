import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  TableHead,
} from "@mui/material";
import {
  JobberTable,
  JobberSearch,
  JobberPagination,
} from "../../../components/MuiTable/index.jsx";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import AxiosInstance from "../../AxiosInstance.jsx";
import swal from "sweetalert";
import "./style.css";
import { Card, CardBody, CardFooter, CardHeader, Table } from "reactstrap";
import { Circles } from "react-loader-spinner";
import Checkbox from "@mui/material/Checkbox";
import InputText from "../../../components/InputFields/InputText.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import { handleAuth } from "../../../components/Login/Auth.jsx";
import { LoaderComponent } from "../../../components/Icon/Index.jsx";
import { Grid } from "@mui/material";
import { Row, Col } from "react-bootstrap"; // React Bootstrap components
import showToast from "../../../components/Toast/Toster.jsx";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import BlueButton from "../../../components/Button/BlueButton.jsxx";

const TeamAccess = () => {
  const label = { inputProps: { "aria-label": "Checkbox demo" } };
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    handleAuth(navigate, location);
  }, []);
  const baseUrl = process.env.REACT_APP_BASE_API;
  const [modelOpen, setModelOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [selectedIndustryId, setSelectedIndustryId] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [accessData, setAccessData] = useState([]);
  const [loader, setLoader] = useState(true);
  const [countData, setCountData] = useState(0);

  const getData = async () => {
    try {
      const res = await AxiosInstance.get(`${baseUrl}/title`, {
        params: {
          pageSize: rowsPerPage,
          pageNumber: page,
          search: search || "",
        },
      });
      setAccessData(res?.data?.data);
      setCountData(res?.data?.count);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    getData();
  }, [rowsPerPage, page, search]);

  const handleSubmit = async (values) => {
    try {
      let res;
      if (!selectedIndustryId) {
        res = await AxiosInstance.post(`${baseUrl}/industry`, values);
      } else {
        res = await AxiosInstance.put(
          `${baseUrl}/industry/${selectedIndustryId}`,
          values
        );
      }

      if (res.data.statusCode === 200) {
        setModelOpen(false);
        getData();
        setTimeout(() => {
          showToast.success(res.data.message);
        }, 500);
      } else {
        showToast.error(res.data.message);
      }
    } catch (error) {
      showToast.error(error.message || "An error occurred");
    }
  };

  const handleEditClick = (item) => {
    setSelectedIndustry(item);
    setSelectedIndustryId(item?.industry_id);
    setModelOpen(true);
  };

  // Delete
  const handleDelete = (id) => {
    swal("Are you sure you want to delete?", {
      buttons: ["No", "Yes"],
    }).then(async (willDelete) => {
      if (willDelete) {
        try {
          const response = await AxiosInstance.delete(
            `${baseUrl}/industry/${id}`
          );
          if (response?.data.statusCode === 200) {
            setTimeout(() => {
              showToast.success(response?.data.message);
            }, 500);
            getData();
          } else if (response?.data.statusCode === 201) {
            setTimeout(() => {
              showToast.error(response?.data.message);
            }, 500);
          } else {
            showToast.warning("", response?.data.message, "error");
          }
        } catch (error) {
          console.error("Error:", error);
          showToast.error(error);
        }
      }
    });
  };

  const cellData = accessData?.map((item, index) => {
    return {
      key: item?.title_id,
      value: [page * rowsPerPage + index + 1, item?.title],
    };
  });

  const collapseData = accessData?.map((item) => ({
    createdAt: item?.createdAt || "No details provided",
  }));

  return (
    <>
      <Grid className="justify-content-center align-items-center mb-3 industry">
        <Grid className="d-flex justify-content-end mb-2 align-items-center">
          <Button
            style={{ color: "#fff" }}
            onClick={() => {
              setSelectedIndustry(null);
              setModelOpen(true);
              setSelectedIndustry(null);
              setSelectedIndustryId(null);
            }}
            className="text-capitalize bg-blue-color"
          >
            Add Access
          </Button>
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
            className="d-flex border-blue-color justify-content-between align-items-center table-header bg-blue-color"
            style={{
              borderBottom: "2px solid ",
              borderTopLeftRadius: "15px",
              borderTopRightRadius: "15px",
            }}
          >
            <Typography className="text-light heading-five">Access</Typography>
            <Grid className="d-flex">
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
                headerData={["Index", "Name"]}
                cellData={cellData}
                collapseData={collapseData}
                isCollapse={false}
                page={page}
                isNavigate={false}
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
      <Grid id="modals">
        <Dialog fullWidth open={modelOpen} onClose={() => setModelOpen(false)}>
          <DialogTitle className="text-blue-color">
            {"Manage-team access"}
          </DialogTitle>
          <DialogContent dividers>
            <Formik
              initialValues={{
                industry: selectedIndustry ? selectedIndustry.industry : "",
              }}
              enableReinitialize
              validationSchema={Yup.object().shape({
                industry: Yup.string().required("Industry is Required"),
              })}
              onSubmit={(values, { resetForm }) => {
                handleSubmit(values);
                resetForm(values);
              }}
            >
              {({ values, errors, touched, handleBlur, handleChange }) => (
                <Form>
                  <Grid>
                    <Grid className="mt-3">
                      <InputText
                        type="text"
                        size="small"
                        fullWidth
                        placeholder=" Enter title *"
                        label="Title *"
                        name="title"
                        value={values?.title}
                        onBlur={handleBlur}
                        onChange={handleChange}
                      />
                      {touched?.title && errors?.title ? (
                        <Grid className="text-danger text-blue-color">
                          {errors?.title}
                        </Grid>
                      ) : null}
                    </Grid>
                    <Grid className="mt-3">
                      <InputText
                        type="text"
                        size="small"
                        fullWidth
                        placeholder="Enter description *"
                        label="Description *"
                        name="description"
                        value={values?.description}
                        onBlur={handleBlur}
                        onChange={handleChange}
                      />
                      {touched?.description && errors?.description ? (
                        <Grid className="text-danger text-blue-color">
                          {errors?.description}
                        </Grid>
                      ) : null}
                    </Grid>
                    <Grid className="mt-3">
                      {/* <Table borderless>
                        <TableHead>
                          <tr>
                            <th></th>
                            <th className="text-center">Create</th>
                            <th className="text-center">Read</th>
                            <th className="text-center">Update</th>
                            <th className="text-center">Dalete</th>
                            <th className="text-center">changeable</th>
                          </tr>
                        </TableHead>
                        <tbody>
                          <tr>
                            <td>Requests</td>
                            <td className="text-center">
                              {" "}
                              <Checkbox {...label} className="p-0" />
                            </td>
                            <td className="text-center">
                              <Checkbox {...label} className="p-0" />
                            </td>
                            <td className="text-center">
                              <Checkbox {...label} className="p-0" />
                            </td>
                            <td className="text-center">
                              <Checkbox {...label} className="p-0" />
                            </td>
                            <td className="text-center">
                              <Checkbox {...label} className="p-0" />
                            </td>
                          </tr>
                          <tr>
                            <td>Quotes</td>
                            <td className="text-center">
                              <Checkbox {...label} className="p-0" />
                            </td>
                            <td className="text-center">
                              <Checkbox {...label} className="p-0" />
                            </td>
                            <td className="text-center">
                              <Checkbox {...label} className="p-0" />
                            </td>
                            <td className="text-center">
                              <Checkbox {...label} className="p-0" />
                            </td>
                            <td className="text-center">
                              <Checkbox {...label} className="p-0" />
                            </td>
                          </tr>
                          <tr>
                            <td>Contracts</td>
                            <td className="text-center">
                              <Checkbox {...label} className="p-0" />
                            </td>
                            <td className="text-center">
                              <Checkbox {...label} className="p-0" />
                            </td>
                            <td className="text-center">
                              <Checkbox {...label} className="p-0" />
                            </td>
                            <td className="text-center">
                              <Checkbox {...label} className="p-0" />
                            </td>
                            <td className="text-center">
                              <Checkbox {...label} className="p-0" />
                            </td>
                          </tr>
                          <tr>
                            <td>Invoices</td>
                            <td className="text-center">
                              <Checkbox {...label} className="p-0" />
                            </td>
                            <td className="text-center">
                              <Checkbox {...label} className="p-0" />
                            </td>
                            <td className="text-center">
                              <Checkbox {...label} className="p-0" />
                            </td>
                            <td className="text-center">
                              <Checkbox {...label} className="p-0" />
                            </td>
                            <td className="text-center">
                              <Checkbox {...label} className="p-0" />
                            </td>
                          </tr>
                        </tbody>
                      </Table> */}

                      <Table borderless>
                        <TableHead>
                          <TableRow>
                            <TableCell></TableCell>
                            <TableCell className="text-center">
                              Create
                            </TableCell>
                            <TableCell className="text-center">Read</TableCell>
                            <TableCell className="text-center">
                              Update
                            </TableCell>
                            <TableCell className="text-center">
                              Dalete
                            </TableCell>
                            <TableCell className="text-center">
                              changeable
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody >
                          <TableRow>
                            <TableCell>Requests</TableCell>
                            <TableCell className="text-center">
                              {" "}
                              <Checkbox {...label} className="p-0" />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox {...label} className="p-0" />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox {...label} className="p-0" />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox {...label} className="p-0" />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox {...label} className="p-0" />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Quotes</TableCell>
                            <TableCell className="text-center">
                              <Checkbox {...label} className="p-0" />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox {...label} className="p-0" />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox {...label} className="p-0" />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox {...label} className="p-0" />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox {...label} className="p-0" />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Contracts</TableCell>
                            <TableCell className="text-center">
                              <Checkbox {...label} className="p-0" />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox {...label} className="p-0" />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox {...label} className="p-0" />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox {...label} className="p-0" />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox {...label} className="p-0" />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Invoices</TableCell>
                            <TableCell className="text-center">
                              <Checkbox {...label} className="p-0" />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox {...label} className="p-0" />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox {...label} className="p-0" />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox {...label} className="p-0" />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox {...label} className="p-0" />
                            </TableCell>
                          </TableRow>
                        </TableBody >
                      </Table>
                    </Grid>
                    <Grid className="d-flex justify-content-end">
                      <BlueButton
                        className="mt-3 bg-button-blue-color"
                        type="submit"
                        label={selectedIndustry ? "Update" : "Add"}
                      />
                    </Grid>
                  </Grid>
                </Form>
              )}
            </Formik>
          </DialogContent>
        </Dialog>
      </Grid>
    </>
  );
};

export default TeamAccess;

import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import {
  JobberTable,
  JobberSearch,
  JobberPagination,
} from "../../components/MuiTable/index.jsx";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import axios from "axios";
import AxiosInstance from "../AxiosInstance.jsx";

import IconButton from "@mui/material/IconButton";
import Edit from "../../assets/image/icons/edit.svg";
import Delete from "../../assets/image/icons/delete.svg";
import swal from "sweetalert";
import "./style.css";
import { Card, CardBody, CardFooter, CardHeader } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { Circles } from "react-loader-spinner";
import InputText from "../../components/InputFields/InputText.jsx";
import { LoaderComponent } from "../../components/Icon/Index.jsx";
import { Grid } from "@mui/material";
import { Row, Col } from "react-bootstrap";
import showToast from "../../components/Toast/Toster.jsx";
import BlueButton from "../../components/Button/BlueButton.jsxx";

const Industry = () => {
  const navigate = useNavigate();
  const baseUrl = process.env.REACT_APP_BASE_API;
  const [modelOpen, setModelOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [selectedIndustryId, setSelectedIndustryId] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [industryType, setIndustryType] = useState([]);
  const [loader, setLoader] = useState(true);
  const [countData, setCountData] = useState(0);

  const getData = async () => {
    try {
      const res = await AxiosInstance.get(`${baseUrl}/industry`, {
        params: {
          pageSize: rowsPerPage,
          pageNumber: page,
          search: search || "",
        },
      });
      setIndustryType(res.data.data);
      setCountData(res.data.count);
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
    setSelectedIndustryId(item.industryId);
    setModelOpen(true);
  };

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

  const cellData = industryType?.map((item, index) => {
    return {
      key: item.industryId,
      value: [
        page * rowsPerPage + index + 1,
        item.industry,
        item.createdAt,
        item.updatedAt,
        <IconButton>
          <img src={Edit} onClick={() => handleEditClick(item)} />
          <img
            className="mx-1 customerEditImgToEdit"
            src={Delete}
            onClick={() => handleDelete(item.industryId)}
          />
        </IconButton>,
      ],
    };
  });

  const collapseData = industryType?.map((item) => ({
    createdAt: item.createdAt || "No details provided",
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
            Add Industry
          </Button>
        </Grid>
        <Card
          style={{
            borderRadius: "20px",
            border: "2px solid #063164",
            padding: 0,
          }}
        >
          <CardHeader
            className="d-flex justify-content-between align-items-center table-header bg-blue-color"
            style={{
              borderBottom: "2px solid #063164",
              borderTopLeftRadius: "15px",
              borderTopRightRadius: "15px",
            }}
          >
            <Typography className="industr text-light heading-five">
              Industry
            </Typography>
            <Grid className=" industrysearch d-flex">
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
                headerData={[
                  "Sr No.",
                  "Industry",
                  "createdAt",
                  "updatedAt",
                  "Action",
                ]}
                cellData={cellData}
                collapseData={collapseData}
                isCollapse={false}
                page={page}
                isNavigate={false}
              />
            </CardBody>
          )}
          <CardFooter
            className="bg-orange-color"
            style={{
              borderTop: "1px solid #063164",
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
      <Dialog fullWidth open={modelOpen} onClose={() => setModelOpen(false)}>
        <DialogTitle className="text-blue-color">{"Industry Form"}</DialogTitle>
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
                      itype="text"
                      size="small"
                      fullWidth
                      placeholder="Enter industry *"
                      label="Industry *"
                      name="industry"
                      value={values.industry}
                      onBlur={handleBlur}
                      onChange={handleChange}
                    />
                    {touched.industry && errors.industry ? (
                      <Grid className="text-danger text-blue-color">
                        {errors.industry}
                      </Grid>
                    ) : null}
                  </Grid>
                  <Grid className="d-flex justify-content-end">
                    <BlueButton
                      className="mt-3 bg-button-blue-color"
                      type="submit"
                      style={{ color: "white" }}
                      label={selectedIndustry ? "Update" : "Add"}
                    />
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Industry;

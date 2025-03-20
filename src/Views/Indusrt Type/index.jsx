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
import swal from "sweetalert";
import "./style.css";
import { Card, CardBody, CardFooter, CardHeader } from "reactstrap";
import { useLocation } from "react-router-dom";
import Edit from "../../assets/image/icons/edit.svg";
import Delete from "../../assets/image/icons/delete.svg";
import InputText from "../../components/InputFields/InputText.jsx";
import { Grid } from "@mui/material";
import { Row, Col } from "react-bootstrap";
import showToast from "../../components/Toast/Toster.jsx";

const Industry = () => {
  const baseUrl = process.env.REACT_APP_BASE_API;
  const [modelOpen, setModelOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndustryType, setSelectedIndustryType] = useState(null);
  const [industryTypeId, setIndustryTypeId] = useState("");
  const location = useLocation();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [teamSize, setTeamSize] = useState([]);

  const [loader, setLoader] = useState(true);
  const [countData, setCountData] = useState(0);

  const getData = async () => {
    try {
      const res = await AxiosInstance.get(
        `${baseUrl}/industrytype/${location?.state?.id}`,
        {
          params: {
            pageSize: rowsPerPage,
            pageNumber: page,
            search: search || "",
          },
        }
      );
      setLoader(false);
      setTeamSize(res.data.data);
      setCountData(res.data.count);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoader(false);
    }
  };

  useEffect(() => {
    getData();
  }, [rowsPerPage, page, search]);

  const handleSubmit = async (values) => {
    try {
      let res;
      if (!industryTypeId) {
        res = await AxiosInstance.post(`${baseUrl}/industrytype`, {
          ...values,
          industry_id: location?.state?.id,
        });
      } else {
        res = await AxiosInstance.put(
          `${baseUrl}/industrytype/${industryTypeId}`,
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
    setSelectedIndustryType(item);
    setIndustryTypeId(item.industrytype_id);
    setModelOpen(true);
  };

  const handleDelete = (id) => {
    swal("Are you sure you want to delete?", {
      buttons: ["No", "Yes"],
    }).then(async (willDelete) => {
      if (willDelete) {
        try {
          const response = await AxiosInstance.delete(
            `${baseUrl}/industrytype/${id}`
          );
          if (response?.data.statusCode === 200) {
            setTimeout(() => {
              showToast.success(response?.data.message);
            }, 500);
            getData();
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

  const cellData = teamSize?.map((item, index) => {
    return {
      key: item.industrytype_id,
      value: [
        page * rowsPerPage + index + 1,
        item.industry_type,
        item.createdAt,
        <IconButton>
          <img src={Edit} onClick={() => handleEditClick(item)} />
          <img
            alt="img"
            className="mx-1 customerEditImgToEdit"
            src={Delete}
            onClick={() => handleDelete(item.industrytype_id)}
          />
        </IconButton>,
      ],
    };
  });

  const collapseData = teamSize?.map((item) => ({
    createdAt: item.createdAt || "No details provided",
  }));

  return (
    <>
      <Grid className="justify-content-center align-items-center mb-3 mt-5">
        <Grid className="d-flex justify-content-between mb-2">
          <Button
            className="bg-blue-color"
            style={{ color: "#fff" }}
            onClick={() => {
              setSelectedIndustryType(null);
              setModelOpen(true);
              setSelectedIndustryType(null);
              setIndustryTypeId(null);
            }}
          >
            <Grid className="text-capitalize">Add industry</Grid>
          </Button>
        </Grid>
        <Card
          style={{ borderRadius: "20px", border: "2px solid " }}
          className="border-blue-color"
        >
          <CardHeader
            className="d-flex justify-content-between align-items-center table-header bg-blue-color border-blue-color"
            style={{
              borderBottom: "2px solid ",
              borderTopLeftRadius: "15px",
              borderTopRightRadius: "15px",
            }}
          >
            <Typography className="text-light heading-five">Industry Type</Typography>
            <Grid className="d-flex">
              <JobberSearch search={search} setSearch={setSearch} />
            </Grid>
          </CardHeader>
          <CardBody style={{ padding: "10px 0px" }}>
            <JobberTable
              headerData={["Sr No.", "Team Size", "Date", "Action"]}
              cellData={cellData}
              collapseData={collapseData}
              isCollapse={false}
              page={page}
            />
          </CardBody>
          <CardFooter
            className=" border-blue-color"
            style={{
              borderTop: "2px solid ",
              backgroundColor: "#D8E7EE",
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
        <DialogTitle>{"Industry Type Form"}</DialogTitle>
        <DialogContent dividers>
          <Formik
            initialValues={{
              industry_type: selectedIndustryType
                ? selectedIndustryType.industry_type
                : "",
            }}
            enableReinitialize
            validationSchema={Yup.object().shape({
              industry_type: Yup.string().required("Industry type is Required"),
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
                      placeholder="Add industry type here...* *"
                      label="Industry type *"
                      name="industry_type"
                      value={values.industry_type}
                      onBlur={handleBlur}
                      onChange={handleChange}
                    />
                    {touched.industry_type && errors.industry_type ? (
                      <Grid className="text-danger">
                        {errors.industry_type}
                      </Grid>
                    ) : null}
                  </Grid>
                  <Grid className="text-end">
                    <Button
                      className="mt-3 bg-blue-color"
                      type="submit"
                      style={{ color: "#fff" }}
                    >
                      {selectedIndustryType ? "Update" : "Add"}
                    </Button>
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

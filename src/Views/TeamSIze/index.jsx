import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import {
  JobberTable,
  JobberSearch,
  JobberPagination,
} from "../../components/MuiTable/index.jsx";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import AxiosInstance from "../AxiosInstance.jsx";
import IconButton from "@mui/material/IconButton";
import swal from "sweetalert";
import "./style.css";
import { Card, CardBody, CardFooter, CardHeader } from "reactstrap";
import { Circles } from "react-loader-spinner";
import Edit from "../../assets/image/icons/edit.svg";
import Delete from "../../assets/image/icons/delete.svg";
import InputText from "../../components/InputFields/InputText.jsx";
import { LoaderComponent } from "../../components/Icon/Index.jsx";
import { Grid } from "@mui/material";
import { Row, Col } from "react-bootstrap"; 
import showToast from "../../components/Toast/Toster.jsx";

const Industry = () => {
  const baseUrl = process.env.REACT_APP_BASE_API;
  const [modelOpen, setModelOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedTeamSize, setSelectedTeamSize] = useState(null);
  const [teamSizeId, setTeamSizeId] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [teamSize, setTeamSize] = useState([]);
  const [loader, setLoader] = useState(true);
  const [countData, setCountData] = useState(0);

  const getData = async () => {
    try {
      const res = await AxiosInstance.get(`${baseUrl}/teamsize`, {
        params: {
          pageSize: rowsPerPage,
          pageNumber: page,
          search: search || "",
        },
      });
      setTeamSize(res.data?.data);
      setCountData(res.data?.count);
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
      if (!teamSizeId) {
        res = await AxiosInstance.post(`${baseUrl}/teamsize`, values);
      } else {
        res = await AxiosInstance.put(
          `${baseUrl}/teamsize/${teamSizeId}`,
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
        setTimeout(() => {
          showToast.error(res.data.message);
        }, 500);
      }
    } catch (error) {
      setTimeout(() => {
        showToast.error(error.message || "An error occurred");
      }, 500);
    }
  };

  const handleEditClick = (item) => {
    setSelectedTeamSize(item);
    setTeamSizeId(item?.teamSizeId);
    setModelOpen(true);
  };

  const handleDelete = (id) => {
    swal("Are you sure you want to delete?", {
      buttons: ["No", "Yes"],
    }).then(async (willDelete) => {
      if (willDelete) {
        try {
          const response = await AxiosInstance.delete(
            `${baseUrl}/teamsize/${id}`
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
            setTimeout(() => {
              showToast.warning("", response?.data.message, "error");
            }, 500);
          }
        } catch (error) {
          console.error("Error:", error);
          setTimeout(() => {
            showToast.error(error);
          }, 500);
        }
      }
    });
  };

  const cellData = teamSize?.map((item, index) => {
    return {
      key: item?.teamSizeId,
      value: [
        page * rowsPerPage + index + 1,
        item?.teamSize,
        item?.createdAt,
        <IconButton>
          <img src={Edit} onClick={() => handleEditClick(item)} />
          <img
            className="mx-1 customerEditImgToEdit"
            alt="img"
            src={Delete}
            onClick={() => handleDelete(item?.teamSizeId)}
          />
        </IconButton>,
      ],
    };
  });

  const collapseData = teamSize?.map((item) => ({
    createdAt: item?.createdAt || "No details provided",
  }));

  return (
    <>
      <Grid className="justify-content-center align-items-center mb-3 mt-5">
        <Grid className="d-flex justify-content-end mb-2">
          <Button
            onClick={() => {
              setSelectedTeamSize(null);
              setModelOpen(true);
              setSelectedTeamSize(null);
              setTeamSizeId(null);
            }}
            className="text-capitalize bg-blue-color text-white-color"
          >
            Add team size
          </Button>
        </Grid>
        <Card
          className="border-blue-color"
          style={{ borderRadius: "20px", border: "2px solid " }}
        >
          <CardHeader
            className="d-flex border-blue-color justify-content-between align-items-center table-header bg-blue-color"
            style={{
              borderBottom: "2px solid ",
              borderTopLeftRadius: "15px",
              borderTopRightRadius: "15px",
            }}
          >
            <Typography className="team text-light heading-five">Team Size</Typography>
            <Grid className="teamsearch d-flex">
              <JobberSearch
                search={search}
                setSearch={setSearch}
                style={{ background: "transparant", color: "#fff" }}
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
                headerData={["Sr No.", "Team Size", "Date", "Action"]}
                cellData={cellData}
                collapseData={collapseData}
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
      </Grid>
      <Dialog fullWidth open={modelOpen} onClose={() => setModelOpen(false)}>
        <DialogTitle className="text-blue-color">{"Teamsize Form"}</DialogTitle>
        <DialogContent dividers>
          <Formik
            initialValues={{
              teamSize: selectedTeamSize ? selectedTeamSize.teamSize : "",
            }}
            enableReinitialize
            validationSchema={Yup.object().shape({
              teamSize: Yup.string().required("TeamSize is Required"),
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
                      placeholder="Enter add team size"
                      label="Team Size"
                      name="teamSize"
                      value={values?.teamSize}
                      onBlur={handleBlur}
                      onChange={handleChange}
                    />
                    {touched?.teamSize && errors?.teamSize ? (
                      <Grid className="text-danger">{errors?.teamSize}</Grid>
                    ) : null}
                  </Grid>
                  <Grid style={{ display: "flex", justifyContent: "end" }}>
                    <Button
                      className="mt-3 text-capitalize bg-blue-color"
                      type="submit"
                      style={{ color: "white" }}
                    >
                      {selectedTeamSize ? "Update" : "Add"}
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

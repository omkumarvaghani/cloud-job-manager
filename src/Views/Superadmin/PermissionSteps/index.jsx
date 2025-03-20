import React, { useState } from "react";
import { Card, CardBody, CardTitle, FormGroup, Input, Label } from "reactstrap";
import { TextField, Typography } from "@mui/material";

import "./style.css";
import { useNavigate } from "react-router-dom";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import {
  LoaderComponent,
} from "../../../components/Icon/Index";
import { Grid } from "@mui/material";
import BlueButton from "../../../components/Button/BlueButton";
import WhiteButton from "../../../components/Button/WhiteButton";
function PermissionSteps() {
  const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
  };

  const [checkboxes, setCheckboxes] = useState({
    view: false,
    complete: false,
    editOwn: false,
    editEveryone: false,
    editDeleteEveryone: false,
  });
  const toggleCheckbox = (checkboxName) => {
    setCheckboxes((prevState) => ({
      ...prevState,
      [checkboxName]: !prevState[checkboxName],
    }));
  };
  return (
    <>
      <Grid className="justify-content-center align-items-center mb-3 mt-5 client">
        <Grid className="d-flex">
          <BlueButton
            style={{
              marginRight: "10px",
              width: "50px",
              height: "40px",
              marginBottom: "10px",
              padding: "0px 0px",
              borderRadius: "4px",
            }}
            onClick={() => {
              navigate(-1);
            }}
            className="text-capitalize bg-button-blue-color text-white-color"
            label={
              <>
                <ArrowBackOutlinedIcon />
              </>
            }
          />
          {/* <NavigateButton   onClick={() => {
              navigate(-1);
            }} /> */}
        </Grid>
        <Card
          className="my-2 col-12 p-4 main-chek border-blue-color"
          style={{ borderRadius: "20px" }}
        >
          <Grid className="client-main">
            <Grid container spacing={3}>
              <Grid
                item
                xs={12}
                md={6}
                className="text-box"
                style={{ paddingRight: "20px" }}
              >
                <CardTitle
                  tag="h5"
                  className="text-blue-color"
                  style={{
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    fontSize: "22px",
                  }}
                >
                  Preset permission levels
                </CardTitle>
                <Grid item xs={12} className="my-4 mb-0">
                  <TextField
                    className="mb-3 text-blue-color"
                    id="title"
                    name="FirstName"
                    onChange={handleChange}
                    label="Title"
                    defaultValue=""
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#063164",
                        },
                        "&:hover fieldset": {
                          borderColor: "#063164",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#063164",
                        },
                      },
                    }}
                    placeholder="Enter title"
                    type="text"
                    InputProps={{
                      readOnly: false,
                    }}
                    style={{ width: "100%", padding: 0 }}
                    InputLabelProps={{
                      style: { fontSize: "15px" },
                    }}
                  />
                </Grid>
                <Grid item xs={12} className="my-2 mb-0 lastnametxt lastnamemb">
                  <TextField
                    className="mb-3 text-blue-color"
                    id="title"
                    name="LastName"
                    onChange={handleChange}
                    label="Description"
                    defaultValue=""
                    placeholder="Enter description"
                    type="text"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#063164",
                        },
                        "&:hover fieldset": {
                          borderColor: "#063164",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#063164",
                        },
                      },
                    }}
                    InputProps={{
                      readOnly: false,
                    }}
                    style={{ height: "56px", width: "100%" }}
                    InputLabelProps={{
                      style: { fontSize: "15px" },
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Card
            style={{
              borderRadius: "15px",
              boxShadow: "rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px",
            }}
          >
            <CardBody style={{ padding: "30px" }}>
              <Typography
                className="text-blue-color"
                style={{ fontSize: "18px", fontWeight: 600 }}
              >
                Schedule
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      id="viewCheckbox"
                      checked={checkboxes?.view}
                      onChange={() => toggleCheckbox("view")}
                    />
                    <Label
                      style={{ cursor: "pointer" }}
                      for="viewCheckbox"
                      check
                      onClick={() => toggleCheckbox("View")}
                    >
                      View
                    </Label>
                  </FormGroup>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      id="viewCheckbox"
                      checked={checkboxes?.Complete}
                      onChange={() => toggleCheckbox("Complete")}
                    />
                    <Label
                      style={{ cursor: "pointer" }}
                      for="CompleteCheckbox"
                      check
                      onClick={() => toggleCheckbox("Complete")}
                    >
                      Complete
                    </Label>
                  </FormGroup>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      id="EditOwnCheckbox"
                      checked={checkboxes?.EditOwn}
                      onChange={() => toggleCheckbox("EditOwn")}
                    />
                    <Label
                      style={{ cursor: "pointer" }}
                      for="EditOwnCheckbox"
                      check
                      onClick={() => toggleCheckbox("Edit Own")}
                    >
                      Edit Own
                    </Label>
                  </FormGroup>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      id="EditEveryoneCheckbox"
                      checked={checkboxes?.EditEveryone}
                      onChange={() => toggleCheckbox("EditEveryone")}
                    />
                    <Label
                      style={{ cursor: "pointer" }}
                      for="EditEveryoneCheckbox"
                      check
                      onClick={() => toggleCheckbox("Edit Everyone")}
                    >
                      Edit Everyone
                    </Label>
                  </FormGroup>
                </Grid>
                <Grid item xs={12}>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      id="DeleteEveryoneCheckbox"
                      checked={checkboxes?.DeleteEveryone}
                      onChange={() => toggleCheckbox("DeleteEveryone")}
                    />
                    <Label
                      style={{ cursor: "pointer" }}
                      for="DeleteEveryoneCheckbox"
                      check
                      onClick={() => toggleCheckbox("Edit And Delete Everyone")}
                    >
                      Edit And Delete Everyone
                    </Label>
                  </FormGroup>
                </Grid>
              </Grid>
            </CardBody>
          </Card>
          <Card
            className="my-3"
            style={{
              borderRadius: "15px",
              boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
            }}
          >
            <CardBody style={{ padding: "30px" }}>
              <Typography
                className="text-blue-color"
                style={{ fontSize: "18px", fontWeight: 600 }}
              >
                Time tracking and timesheets
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      id="ViewAndRecordCheckbox"
                      checked={checkboxes?.ViewAndRecord}
                      onChange={() => toggleCheckbox("ViewAndRecord")}
                    />
                    <Label
                      style={{ cursor: "pointer" }}
                      for="ViewAndRecordCheckbox"
                      check
                      onClick={() => toggleCheckbox("View And Record")}
                    >
                      View And Record
                    </Label>
                  </FormGroup>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      id="ViewRecordCheckbox"
                      checked={checkboxes?.ViewRecord}
                      onChange={() => toggleCheckbox("ViewRecord")}
                    />
                    <Label
                      style={{ cursor: "pointer" }}
                      for="ViewRecordCheckbox"
                      check
                      onClick={() => toggleCheckbox("View Record And Edit")}
                    >
                      View Record And Edit
                    </Label>
                  </FormGroup>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      id="RecordEditEveryoneCheckbox"
                      checked={checkboxes?.RecordEditEveryone}
                      onChange={() => toggleCheckbox("RecordEditEveryone")}
                    />
                    <Label
                      style={{ cursor: "pointer" }}
                      for="RecordEditEveryoneCheckbox"
                      check
                      onClick={() =>
                        toggleCheckbox("Vied , Record And Edit Everyone")
                      }
                    >
                      Vied , Record And Edit Everyone
                    </Label>
                  </FormGroup>
                </Grid>
              </Grid>
            </CardBody>
          </Card>
          <Card
            className="my-3"
            style={{
              borderRadius: "15px",
              boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
            }}
          >
            <CardBody style={{ padding: "30px" }}>
              <Typography
                className="text-blue-color"
                style={{ fontSize: "18px", fontWeight: 600 }}
              >
                Notes
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      id="ViewnotesCheckbox"
                      checked={checkboxes?.Viewnotes}
                      onChange={() => toggleCheckbox("Viewnotes")}
                    />
                    <Label
                      style={{ cursor: "pointer" }}
                      for="ViewnotesCheckbox"
                      check
                      onClick={() =>
                        toggleCheckbox("View notes on jobs and visits only")
                      }
                    >
                      View notes on jobs and visits only
                    </Label>
                  </FormGroup>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      id="allnotesCheckbox"
                      checked={checkboxes?.allnotes}
                      onChange={() => toggleCheckbox("allnotes")}
                    />
                    <Label
                      style={{ cursor: "pointer" }}
                      for="allnotesCheckbox"
                      check
                      onClick={() => toggleCheckbox("View all notes")}
                    >
                      View all notes
                    </Label>
                  </FormGroup>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      id="ViewandeditCheckbox"
                      checked={checkboxes?.Viewandedit}
                      onChange={() => toggleCheckbox("Viewandedit")}
                    />
                    <Label
                      style={{ cursor: "pointer" }}
                      for="ViewandeditCheckbox"
                      check
                      onClick={() => toggleCheckbox("View and edit all")}
                    >
                      View and edit all
                    </Label>
                  </FormGroup>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      id="deleteallCheckbox"
                      checked={checkboxes?.deleteall}
                      onChange={() => toggleCheckbox("deleteall")}
                    />
                    <Label
                      style={{ cursor: "pointer" }}
                      for="deleteallCheckbox"
                      check
                      onClick={() =>
                        toggleCheckbox("View, edit, and delete all")
                      }
                    >
                      View, edit, and delete all
                    </Label>
                  </FormGroup>
                </Grid>
              </Grid>
            </CardBody>
          </Card>
          <Card
            className="my-3"
            style={{
              borderRadius: "15px",
              boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
            }}
          >
            <CardBody style={{ padding: "30px" }}>
              <Typography
                className="text-blue-color"
                style={{ fontSize: "18px", fontWeight: 600 }}
              >
                Expenses
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      id="theirownCheckbox"
                      checked={checkboxes?.theirown}
                      onChange={() => toggleCheckbox("theirown")}
                    />
                    <Label
                      style={{ cursor: "pointer" }}
                      for="theirownCheckbox"
                      check
                      onClick={() =>
                        toggleCheckbox("View, record, and edit their own")
                      }
                    >
                      View, record, and edit their own
                    </Label>
                  </FormGroup>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      id="andeditCheckbox"
                      checked={checkboxes?.andedit}
                      onChange={() => toggleCheckbox("andedit")}
                    />
                    <Label
                      style={{ cursor: "pointer" }}
                      for="andeditCheckbox"
                      check
                      onClick={() =>
                        toggleCheckbox("View, record, and edit everyone")
                      }
                    >
                      View, record, and edit everyone
                    </Label>
                  </FormGroup>
                </Grid>
              </Grid>
            </CardBody>
          </Card>
          <Card
            className="my-3"
            style={{
              borderRadius: "15px",
              boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
            }}
          >
            <CardBody style={{ padding: "30px" }}>
              <Typography
                className="text-blue-color"
                style={{ fontSize: "18px", fontWeight: 600 }}
              >
                Show pricing
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      id="AllowseditingCheckbox"
                      checked={checkboxes?.Allowsediting}
                      onChange={() => toggleCheckbox("Allowsediting")}
                    />
                    <Label
                      style={{ cursor: "pointer" }}
                      for="AllowseditingCheckbox"
                      check
                      onClick={() =>
                        toggleCheckbox(
                          "Allows editing of quotes, invoices, and line items on jobs."
                        )
                      }
                    >
                      Allows editing of quotes, invoices, and line items on
                      jobs.
                    </Label>
                  </FormGroup>
                </Grid>
              </Grid>
            </CardBody>
          </Card>
          <Card
            className="my-3"
            style={{
              borderRadius: "15px",
              boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
            }}
          >
            <CardBody style={{ padding: "30px" }}>
              <Typography
                className="text-blue-color"
                style={{ fontSize: "18px", fontWeight: 600 }}
              >
                Customers and properties
              </Typography>
              <Grid container spacing={3} className="client-check">
                <Grid item xs={12} md={6}>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      id="addressonlyCheckbox"
                      checked={checkboxes?.addressonly}
                      onChange={() => toggleCheckbox("addressonly")}
                    />
                    <Label
                      style={{ cursor: "pointer" }}
                      for="addressonlyCheckbox"
                      check
                      onClick={() =>
                        toggleCheckbox("View Customer name and address only")
                      }
                    >
                      View Customer name and address only
                    </Label>
                  </FormGroup>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      id="propertyinfoCheckbox"
                      checked={checkboxes?.propertyinfo}
                      onChange={() => toggleCheckbox("propertyinfo")}
                    />
                    <Label
                      style={{ cursor: "pointer" }}
                      for="propertyinfoCheckbox"
                      check
                      onClick={() =>
                        toggleCheckbox("View full client and property info")
                      }
                    >
                      View full customer and property info
                    </Label>
                  </FormGroup>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      id="fullclientCheckbox"
                      checked={checkboxes?.fullclient}
                      onChange={() => toggleCheckbox("fullclient")}
                    />
                    <Label
                      style={{ cursor: "pointer" }}
                      for="fullclientCheckbox"
                      check
                      onClick={() =>
                        toggleCheckbox(
                          "View and edit full client and property info"
                        )
                      }
                    >
                      View and edit full customer and property info
                    </Label>
                  </FormGroup>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      id="anddeleteCheckbox"
                      checked={checkboxes?.anddelete}
                      onChange={() => toggleCheckbox("anddelete")}
                    />
                    <Label
                      style={{ cursor: "pointer" }}
                      for="anddeleteCheckbox"
                      check
                      onClick={() =>
                        toggleCheckbox(
                          "View, edit, and delete full client and property info"
                        )
                      }
                    >
                      View, edit, and delete full customer and property info
                    </Label>
                  </FormGroup>
                </Grid>
              </Grid>
            </CardBody>
          </Card>
          <Card
            className="my-3"
            style={{
              borderRadius: "15px",
              boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
            }}
          >
            <CardBody style={{ padding: "30px" }}>
              <Typography
                className="text-blue-color"
                style={{ fontSize: "18px", fontWeight: 600 }}
              >
                Requests
              </Typography>
              <Grid
                container
                spacing={2}
                className="request-check justify-content-between"
              >
                <Grid item xs={12} sm={6} md={3}>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      id="rViewCheckbox"
                      checked={checkboxes?.rView}
                      onChange={() => toggleCheckbox("rView")}
                    />
                    <Label
                      style={{ cursor: "pointer" }}
                      for="rViewCheckbox"
                      check
                      onClick={() => toggleCheckbox("View")}
                    >
                      View
                    </Label>
                  </FormGroup>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      id="cCreateCheckbox"
                      checked={checkboxes?.cCreate}
                      onChange={() => toggleCheckbox("cCreate")}
                    />
                    <Label
                      style={{ cursor: "pointer" }}
                      for="cCreateCheckbox"
                      check
                      onClick={() => toggleCheckbox("Create")}
                    >
                      Create
                    </Label>
                  </FormGroup>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      id="rEditCheckbox"
                      checked={checkboxes?.rEdit}
                      onChange={() => toggleCheckbox("rEdit")}
                    />
                    <Label
                      style={{ cursor: "pointer" }}
                      for="rEditCheckbox"
                      check
                      onClick={() => toggleCheckbox("Edit")}
                    >
                      Edit
                    </Label>
                  </FormGroup>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      id="rDeleteCheckbox"
                      checked={checkboxes?.rDelete}
                      onChange={() => toggleCheckbox("rDelete")}
                    />
                    <Label
                      style={{ cursor: "pointer" }}
                      for="rDeleteCheckbox"
                      check
                      onClick={() => toggleCheckbox("Delete")}
                    >
                      Delete
                    </Label>
                  </FormGroup>
                </Grid>
              </Grid>
            </CardBody>
          </Card>
          <Card
            className="my-3"
            style={{
              borderRadius: "15px",
              boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
            }}
          >
            <CardBody style={{ padding: "30px" }}>
              <Typography
                className="text-blue-color"
                style={{ fontSize: "18px", fontWeight: 600 }}
              >
                Quotes
              </Typography>
              <Grid
                container
                spacing={2}
                className="request-check justify-content-between"
              >
                <Grid item xs={12} sm={6} md={3}>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      id="qviewCheckbox"
                      checked={checkboxes?.qview}
                      onChange={() => toggleCheckbox("qview")}
                    />
                    <Label
                      style={{ cursor: "pointer" }}
                      for="qviewCheckbox"
                      check
                      onClick={() => toggleCheckbox("View")}
                    >
                      View
                    </Label>
                  </FormGroup>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      id="qCreateCheckbox"
                      checked={checkboxes?.qCreate}
                      onChange={() => toggleCheckbox("qCreate")}
                    />
                    <Label
                      style={{ cursor: "pointer" }}
                      for="qCreateCheckbox"
                      check
                      onClick={() => toggleCheckbox("Create")}
                    >
                      Create
                    </Label>
                  </FormGroup>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      id="qEditCheckbox"
                      checked={checkboxes?.qEdit}
                      onChange={() => toggleCheckbox("qEdit")}
                    />
                    <Label
                      style={{ cursor: "pointer" }}
                      for="qEditCheckbox"
                      check
                      onClick={() => toggleCheckbox("Edit")}
                    >
                      Edit
                    </Label>
                  </FormGroup>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      id="qDeleteCheckbox"
                      checked={checkboxes?.qDelete}
                      onChange={() => toggleCheckbox("qDelete")}
                    />
                    <Label
                      style={{ cursor: "pointer" }}
                      for="qDeleteCheckbox"
                      check
                      onClick={() => toggleCheckbox("Delete")}
                    >
                      Delete
                    </Label>
                  </FormGroup>
                </Grid>
              </Grid>
            </CardBody>
          </Card>
          <Card
            className="my-3"
            style={{
              borderRadius: "15px",
              boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
            }}
          >
            <CardBody style={{ padding: "30px" }}>
              <Typography
                className="text-blue-color"
                style={{ fontSize: "18px", fontWeight: 600 }}
              >
                Jobs
              </Typography>
              <Grid
                container
                spacing={2}
                className="request-check justify-content-between"
              >
                <Grid item xs={12} sm={6} md={3}>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      id="jViewCheckbox"
                      checked={checkboxes?.jView}
                      onChange={() => toggleCheckbox("jView")}
                    />
                    <Label
                      style={{ cursor: "pointer" }}
                      for="jViewCheckbox"
                      check
                      onClick={() => toggleCheckbox("View")}
                    >
                      View
                    </Label>
                  </FormGroup>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      id="jCreateCheckbox"
                      checked={checkboxes?.jCreate}
                      onChange={() => toggleCheckbox("jCreate")}
                    />
                    <Label
                      style={{ cursor: "pointer" }}
                      for="jCreateCheckbox"
                      check
                      onClick={() => toggleCheckbox("Create")}
                    >
                      Create
                    </Label>
                  </FormGroup>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      id="jEditCheckbox"
                      checked={checkboxes?.jEdit}
                      onChange={() => toggleCheckbox("jEdit")}
                    />
                    <Label
                      style={{ cursor: "pointer" }}
                      for="jEditCheckbox"
                      check
                      onClick={() => toggleCheckbox("Edit")}
                    >
                      Edit
                    </Label>
                  </FormGroup>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      id="jDeleteCheckbox"
                      checked={checkboxes?.jDelete}
                      onChange={() => toggleCheckbox("jDelete")}
                    />
                    <Label
                      style={{ cursor: "pointer" }}
                      for="jDeleteCheckbox"
                      check
                      onClick={() => toggleCheckbox("Delete")}
                    >
                      Delete
                    </Label>
                  </FormGroup>
                </Grid>
              </Grid>
            </CardBody>
          </Card>
          <Card
            className="my-3"
            style={{
              borderRadius: "15px",
              boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
            }}
          >
            <CardBody style={{ padding: "30px" }}>
              <Typography
                className="text-blue-color"
                style={{ fontSize: "18px", fontWeight: 600 }}
              >
                Reports
              </Typography>

              {/* Grid container for the checkbox */}
              <Grid
                container
                spacing={2}
                className="request-check justify-content-between"
              >
                <Grid item xs={12}>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      id="UsersCheckbox"
                      checked={checkboxes?.Users}
                      onChange={() => toggleCheckbox("Users")}
                    />
                    <Label
                      style={{ cursor: "pointer" }}
                      for="UsersCheckbox"
                      check
                      onClick={() =>
                        toggleCheckbox(
                          "Users will only be able to see reports available to them based on their other permissions."
                        )
                      }
                    >
                      Users will only be able to see reports available to them
                      based on their other permissions.
                    </Label>
                  </FormGroup>
                </Grid>
              </Grid>
            </CardBody>
          </Card>
          <Grid
            className="d-flex justify-content-between button-responsive"
            style={{ marginTop: "70px" }}
          >
            <Grid>
              <WhiteButton
                className="footer-buttons  outline-button-blue-color customerSaveCancelBtn quote_cancel_btn "
                style={{ fontSize: "16px" }}
                onClick={() => navigate("/compnay_name/clientclient")}
              />
              Cancel
            </Grid>
            {loader ? (
              <LoaderComponent loader={loader} height="20" width="20" />
            ) : (
              <Grid className="gap-3 d-flex sec-button-section">
                <BlueButton
                  className="save-client-button bg-blue-color customerSaveCancelBtn quote_cancel_btn "
                  style={{ fontSize: "16px" }}
                  label="Save Customer"
                />
              </Grid>
            )}
          </Grid>
        </Card>
      </Grid>
    </>
  );
}

export default PermissionSteps;

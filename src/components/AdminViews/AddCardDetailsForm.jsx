import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Typography,
} from "@mui/material";
import { addCardDetails } from "../../plugins/ApiHandler";
import AddCardForm from "../../components/AddPayment/AddCardForm";
import "./style.css";
import showToast from "../Toast/Toster";

const AddCardDetailsForm = (props) => {
  const [loading, setLoading] = useState(false);

  const addCardInfo = async (data) => {
    const CompanyId = localStorage.getItem("CompanyId") || props?.CompanyId;
    const CustomerIds = props.CustomerId;

    data.CompanyId = CompanyId || "";
    data.CustomerId = CustomerIds || "";
    data.type = "card";

    try {
      setLoading(true);
      await addCardDetails(data);
      props.onHide();
      showToast.success("Card details added successfully");
      props.fetchData();
    } catch (error) {
      showToast.error(error || "Something went wrong");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={props?.show}
        onClose={props?.onHide}
        fullWidth
        maxWidth="md"
        scroll="paper"
      >
        <DialogTitle className="borerBommoModel">
          <Typography
            variant="h5"
            className="text-lg text-blue-color cardInformationDetail"
            style={{ fontWeight: "bold", fontSize: "18px" }}
          >
            User Information
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {!props?.scriptGenerating && !props?.scriptError && (
                <AddCardForm
                  addCardInfo={addCardInfo}
                  onHide={props?.onHide}
                  CustomerId={props?.CustomerId}
                  loader={loading}
                />
              )}
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddCardDetailsForm;

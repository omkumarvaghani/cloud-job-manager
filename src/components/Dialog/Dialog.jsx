import {
  Avatar,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  Paper,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Grid } from "@mui/material";
import AxiosInstance from "../../Views/AxiosInstance";
import { Card, Table } from "reactstrap";
import { Money } from "@mui/icons-material";
import styled from "styled-components";
import CloseIcon from "@mui/icons-material/Close";
import { LoaderComponent } from "../Icon/Index";
import { NoDataFound } from "../Contract Component/Index";

const DialogComponent = ({
  addStatusOpen,
  handleDialogClose,
  setStatusData,
  statusData,
  recurringId,
}) => {
  const [loader, setLoader] = useState(false);

  const getDatas = async () => {
    try {
      setLoader(true);
      const res = await AxiosInstance.get(
        `/recurring-payment/recurring-status/${recurringId}`
      );
      setStatusData(res?.data?.data);
    } catch (error) {
      console.error("Error fetching status data:", error);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    if (addStatusOpen && recurringId) {
      getDatas();
    }
  }, [addStatusOpen, recurringId]);

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    fontWeight: "bold",
    padding: "16px",
    borderBottom: "1px solid #ddd",
  }));

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
      backgroundColor: theme?.palette?.action?.hover,
    },
    "&:hover": {
      backgroundColor: theme?.palette?.action?.selected,
    },
  }));

  return (
    <Dialog
      // fullWidth
      open={addStatusOpen}
      onClose={handleDialogClose}
      PaperProps={{
        style: {
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.15)",
        },
      }}
    >
      <DialogTitle
        className="text-blue-color border-orange-color"
        style={{
          fontSize: "18px",
          fontWeight: "bold",
          borderBottom: "3px solid",
          paddingLeft: "10px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        Recurring Payment Logs
        <CloseIcon onClick={handleDialogClose} style={{ cursor: "pointer" }} />
      </DialogTitle>

      <DialogContent dividers style={{ padding: "1px" }}>
        {loader ? (
          <Grid className="d-flex flex-direction-row justify-content-center align-items-center Typography-5 m-5">
            <LoaderComponent loader={loader} height="50" width="50" />
          </Grid>
        ) : (
          <Grid
            container
            direction="column"
            spacing={2}
            style={{
              maxHeight: "400px",
              msOverflowY: "auto",
              scrollbarWidth: "thin",
            }}
          >
            <Grid item xs={12}>
              {/* <CardContent> */}
              <TableContainer
                component={Paper}
                sx={{ boxShadow: 3, width: "100%" }}
              >
                <Table sx={{ Width: "100%" }} aria-label="payment log table">
                  {/* Table Head (Header) */}
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>Date</StyledTableCell>
                      <StyledTableCell align="left">Amount</StyledTableCell>
                      <StyledTableCell align="left">Method</StyledTableCell>
                      <StyledTableCell align="left">
                        TransactionId
                      </StyledTableCell>
                      <StyledTableCell align="left">Status</StyledTableCell>
                      <StyledTableCell align="left">Reason</StyledTableCell>
                    </TableRow>
                  </TableHead>

                  {/* Table Body (Data) */}
                  <TableBody>
                    {statusData && statusData.length > 0 ? (
                      statusData.map((item, index) => (
                        <StyledTableRow key={index}>
                          <StyledTableCell component="th" scope="row">
                            <Typography variant="body2">
                              <strong>{item.createdAt || "createdAt not available"}</strong>
                            </Typography>
                          </StyledTableCell>
                          <StyledTableCell align="left">
                            <Typography variant="body2">
                              {item.amount || "amount not available"}
                            </Typography>
                          </StyledTableCell>
                          <StyledTableCell align="left">
                            <Typography variant="body2">
                              {item.method || "method not available"}
                            </Typography>
                          </StyledTableCell>
                          <StyledTableCell align="left">
                            <Typography variant="body2">
                              {item.transactionid || "transactionid not available"}
                            </Typography>
                          </StyledTableCell>
                          <StyledTableCell align="left">
                            <Typography
                              variant="body2"
                              color={item.IsPaymentSuccess ? "green" : "red"}
                            >
                              {item.IsPaymentSuccess ? "Success" : "Fail"}
                            </Typography>
                          </StyledTableCell>
                          <StyledTableCell align="left">
                            <Typography
                              variant="body2"
                              color={item.IsPaymentSuccess ? "green" : "red"}
                            >
                              {item.responsetext}
                            </Typography>
                          </StyledTableCell>
                        </StyledTableRow>
                      ))
                    ) : (
                      <StyledTableRow>
                        <StyledTableCell colSpan={5} align="center">
                          <NoDataFound />
                        </StyledTableCell>
                      </StyledTableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              {/* </CardContent> */}
            </Grid>
          </Grid>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DialogComponent;

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Card, CardBody, CardFooter, CardHeader, Col, Input } from "reactstrap";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import {
  LoaderComponent,
  WhiteLoaderComponent,
} from "../../../../components/Icon/Index";
import {
  JobberPagination,
  JobberSearch,
  JobberTable,
} from "../../../../components/MuiTable";
import BlueButton from "../../../../components/Button/BlueButton";
import SettingSidebar from "../../../../components/Setting/SettingSidebar";
import WhiteButton from "../../../../components/Button/WhiteButton";
import { width } from "@mui/system";
import InputText from "../../../../components/InputFields/InputText";
import AxiosInstance from "../../../AxiosInstance";
// import "./style.css";
import SettingDropdown from "../../Setting/Materials&Labor/SettingComponent";
import showToast from "../../../../components/Toast/Toster";
import { handleAuth } from "../../../../components/Login/Auth";
function AddAccount({fetchAccounts,modelOpen,setModelOpen}) {
  const fetchData = async () => {
    try {
      const res = await handleAuth(navigate, location);
      setTokenDecode(res?.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchData();
    handleAuth(navigate, location);
  }, []);

  const navigate = useNavigate();
  const location = useLocation();
  const { CompanyName } = useParams();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [customersData, setcustomersData] = useState([]);
  const [loader, setLoader] = useState(false);
  const [countData, setCountData] = useState(0);
  const [tokenDecode, setTokenDecode] = useState(null);
  const isEdited = true;
  const CompanyId = localStorage.getItem("CompanyId");
  const companyId = tokenDecode?.companyId;
//   const [modelOpen, setModelOpen] = useState(false);


  const handleSubmit = async () => {
    try {
      setLoader(true);
      const dataToSend = {
        ...formData,
        CompanyId: localStorage.getItem("CompanyId"),
      };
      let response;
      if (formData.account_id) {
        response = await AxiosInstance.put(
          `/account/${formData.account_id}`,
          dataToSend
        );
      } else {
        response = await AxiosInstance.post("/account", dataToSend);
      }
      if (response?.data?.statusCode === 200) {
        setTimeout(() => {
          showToast.success(response?.data?.message);
        }, 500);
        // Clear form data after successful submission
        setFormData({
          account_id: "",
          account_type: "",
          account_name: "",
          notes: "",
        });
        fetchAccounts();
      } else {
        setTimeout(() => {
          showToast.error(response?.data?.message);
        }, 500);
      }
    } catch (error) {
      console.error(
        "Error during submit:",
        error.response?.data || error.message
      );
      showToast.error("An error occurred while submitting data.");
    } finally {
      setLoader(false);
    }
  };


  const [formData, setFormData] = useState({
    account_id: "",
    account_type: "",
    account_name: "",
    notes: "",
  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const handleCloseDialog = () => {
    setModelOpen(false);
    setFormData({
      account_id: "",
      account_type: "",
      account_name: "",
      notes: "",
    });
  };

  return (
    <div>
      <Dialog fullWidth open={modelOpen} onClose={handleCloseDialog}>
        <DialogTitle className="text-blue-color borerBommoModel">
          Select Account
        </DialogTitle>
        <DialogContent dividers>
          <Typography
            className="text-blue-color mb-3"
            style={{ fontWeight: 500, textDecoration: "underline" }}
          >
            Select Account Type
          </Typography>
          <Grid>
            <Input
              className="mb-3 border-blue-color text-blue-color"
              style={{ fontSize: "15px", height: "46px" }}
              type="select"
              name="account_type"
              value={formData.account_type}
              onChange={handleInputChange}
            >
              <option value="">Select Account Type</option>
              <option value="Asset">Asset</option>
              <option value="Liability">Liability</option>
              <option value="Equity">Equity</option>
              <option value="Revenue">Revenue</option>
              <option value="Expense">Expense</option>
            </Input>
          </Grid>
          <Input
            placeholder="Enter title"
            label="account_name"
            name="account_name"
            type="text"
            value={formData.account_name}
            onChange={handleInputChange}
            className="text-blue-color border-blue-color w-100"
            style={{ fieldHeight: "56px", margin: 0 }}
          />
          <TextField
            className="note-details mt-3 text-blue-color border-blue-color"
            name="notes"
            label="Description"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Enter A description"
            multiline
            rows={3}
          />
        </DialogContent>
        <Grid
          style={{
            paddingLeft: "20px",
            display: "flex",
            justifyContent: "space-between",
            paddingRight: "20px",
          }}
          className="managebuttonModel"
        >
          <WhiteButton
            className="my-2 text-blue-color border-blue-color"
            onClick={() => {
              setModelOpen(false);
              setFormData({
                account_id: "",
                account_type: "",
                account_name: "",
                notes: "",
              });
            }}
            // style={{ width: "20%" }}
            label="Cancel"
          />

          <BlueButton
            className="my-2 text-blue-color border-blue-color"
            onClick={() => {
              setModelOpen(false);
              handleSubmit();
              setFormData({
                account_id: "",
                account_type: "",
                account_name: "",
                notes: "",
              });
            }}
            style={{ width: "20%" }}
            label={
              loader ? (
                <WhiteLoaderComponent
                  height="20"
                  width="20"
                  padding="20"
                  loader={loader}
                />
              ) : (
                "Add"
              )
            }
          />
        </Grid>
      </Dialog>
    </div>
  );
}

export default AddAccount;

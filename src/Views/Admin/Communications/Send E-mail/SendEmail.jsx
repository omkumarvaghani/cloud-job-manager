import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Grid,
} from "@mui/material";
import TemplatesViews from "./Views/SendEmail.jsx";
import { handleAuth } from "../../../../components/Login/Auth.jsx";
import AxiosInstance from "../../../AxiosInstance.jsx";
import showToast from "../../../../components/Toast/Toster.jsx";
import { DeleteIcone, EditIcon } from "../../../../components/Icon/Index.jsx";
import sendSwal from "../../../../components/Swal/sendSwal.jsx";
import moment from "moment";
import Customer from "../../../../assets/Blue-sidebar-icon/customers.svg";
import WhiteButton from "../../../../components/Button/WhiteButton.jsx";
import template from "../../../../assets/White-sidebar-icon/Send E-Mail.svg";
import DoneAllIcon from "@mui/icons-material/DoneAll";

const SendEmail = () => {
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
  const { companyName } = useParams();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [customersData, setcustomersData] = useState([]);
  const [loader, setLoader] = useState(true);
  const [countData, setCountData] = useState(0);
  const [tokenDecode, setTokenDecode] = useState(null);
  const isEdited = true;
  const CompanyId = localStorage.getItem("CompanyId");
  const companyId = tokenDecode?.companyId;
  const getData = async () => {
    setLoader(true);
    try {
      const activeCompanyId = CompanyId || companyId;

      if (!activeCompanyId) {
        console.error("Company ID is not available.");
        return;
      }

      const res = await AxiosInstance.get(`/email-log/${CompanyId}`, {
        params: {
          pageSize: rowsPerPage,
          pageNumber: page,
          search: search || "",
        },
      });

      if (res?.data) {
        setcustomersData(res.data.emails || []);
        setCountData(res.data.totalCount || 0);
      } else {
        console.error("No data received from the server.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    if (CompanyId || companyId) {
      getData();
    }
  }, [rowsPerPage, page, search, CompanyId, companyId]);

  const handleDelete = (id) => {
    sendSwal().then(async (deleteReason) => {
      if (deleteReason) {
        try {
          const response = await AxiosInstance.delete(`/email-log/${id}`, {
            data: { DeleteReason: deleteReason },
          });
          if (response?.data?.statusCode === 200) {
            showToast.success(response?.data?.message);
            setcustomersData((prevData) =>
              prevData.filter((item) => item.EmailId !== id)
            );
            getData();
          } else {
            showToast.warning(response?.data?.message);
          }
        } catch (error) {
          console.error("Error:", error);
          showToast.error(error?.message || "An error occurred");
        }
      } else {
        showToast.success("Template is safe!", {
          position: "top-center",
          autoClose: 1000,
        });
      }
    });
  };

  const maxCharacters = 40;

  const truncateText = (text, maxCharacters) => {
    if (text.length > maxCharacters) {
      return text.slice(0, maxCharacters) + " ...";
    }
    return text;
  };
  const [open, setOpen] = useState(false);
  const [datas, setdatas] = useState();
  const handleOpen = (item) => {
    setOpen(true);
    setdatas(item);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const cellData = customersData?.map((item, index) => {
    if (!item) return {};

    return {
      key: item?.TemplateId || "TemplateId not available",
      value: [
        page * rowsPerPage + index + 1,
        `${item?.Subject || "No Name"}`,
        Array.isArray(item?.To) ? item.To.join(", ") : item?.To || "No Type",
        <p>{truncateText(item?.Body || "No Body", maxCharacters)}</p>,
        moment(item.createdAt).format("MM-DD-YYYY"),
        <>
          <img
            src={Customer}
            style={{ marginRight: "5px", cursor: "pointer" }}
            alt="Customer"
            onClick={(e) => {
              e.stopPropagation();
              handleOpen(item);
            }}
          />
          <DeleteIcone
            className="customerEditImgToEdit"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(item?.EmailId);
            }}
          />
        </>,
      ],
    };
  });

  const collapseData = customersData?.map((item) => ({
    createdAt: item?.createdAt || "No details provided",
  }));
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogData, setDialogData] = useState(null);

  const handleDialogOpen = (rowData) => {
    const filteredData = customersData?.filter(
      (item) => item?.EmailId === rowData?.key
    );
    setDialogData(filteredData);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setDialogData(null);
  };

  return (
    <>
      <TemplatesViews
        loader={loader}
        search={search}
        setSearch={setSearch}
        cellData={cellData}
        collapseData={collapseData}
        page={page}
        setPage={setPage}
        setRowsPerPage={setRowsPerPage}
        rowsPerPage={rowsPerPage}
        companyName={companyName}
        countData={countData}
        isEdited={isEdited}
        customersData={customersData}
        openDialog={openDialog}
        dialogData={dialogData}
        handleDialogOpen={handleDialogOpen}
        handleDialogClose={handleDialogClose}
      />

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle className="d-flex align-items-center">
          <Typography
            style={{
              padding: "13px 12px 9px 12px ",
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginRight: "!2px",
            }}
            className="bg-blue-color"
          >
            <img src={template} />
          </Typography>{" "}
          Email Recipients
        </DialogTitle>
        <DialogContent>
          <Grid>
            <Grid
              style={{
                border: "1px solid",
                padding: "8px",
                borderRadius: "4px",
              }}
              className="border-blue-color"
            >
              {datas?.To?.map((item, index) => (
                <Typography
                  key={index}
                  className="text-blue-color border-blue-color"
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  {item} <DoneAllIcon style={{ color: "#089F57" }} />
                </Typography>
              ))}
            </Grid>

            <Typography
              className="text-blue-color border-blue-color mt-4"
              style={{ fontStyle: "italic", fontWeight: "600" }}
            >
              Total Recipients : {datas?.To?.length || "length not available"}
            </Typography>
          </Grid>
        </DialogContent>
        <DialogActions style={{ paddingRight: "24px" }}>
          <WhiteButton
            style={{
              height: "38px",
              marginTop: "13px",
            }}
            onClick={handleClose}
            variant="outline"
            label="Cancel"
          />
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SendEmail;

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { handleAuth } from "../../../components/Login/Auth";
import AxiosInstance from "../../AxiosInstance";
import InvoiceDetail from "./Views/InvoiceDetail";
import swal from "sweetalert";

import sendToast from "../../../components/Toast/sendToast";
import showToast from "../../../components/Toast/Toster";
import sendSwal from "../../../components/Swal/sendSwal";
import { LoaderComponent } from "../../../components/Icon/Index";

const options = { year: "numeric", month: "short", day: "numeric" };

function InvoiceDetails() {
  const cdnUrl = process.env.REACT_APP_CDN_API;

  useEffect(() => {
    handleAuth(navigate, location);
  }, []);
  const navigate = useNavigate();
  const location = useLocation();
  const { companyName } = useParams();
  const [invoicedata, setInvoicedata] = useState({});
  const [data, setdata] = useState({});
  const [loader, setLoader] = useState(true);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState("");
  const [mail, setMail] = useState(false);
  const [selectedFileUri, setSelectedFileUri] = useState(null);
  const [openSignPDF, setOpenSignPDF] = useState(false);
  const [collectSignatureLoader, setCollectSignatureLoader] = useState(false);
  const [progress, setProgress] = useState(0); // State to track progress

  const simulateProgress = () => {
    let simulatedProgress = 0;
    const interval = setInterval(() => {
      simulatedProgress += 5; // Increment by 5% every interval
      setProgress(simulatedProgress);

      if (simulatedProgress >= 100) {
        clearInterval(interval); // Stop once it reaches 100%
      }
    }, 200); // Update every 200ms
  };

  const [tokenDecode, setTokenDecode] = useState({});
  const [DateDecode, setDateDecode] = useState({});
  const fetchDatas = async () => {
    try {
      const res = await handleAuth(navigate, location);
      setTokenDecode(res.data);
      setDateDecode(res.themes);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchDatas();
  }, []);

  const [dateFormat, setDateFormat] = useState("MM-DD-YYYY");
  useEffect(() => {
    const handleDateFormat = () => {
      if (DateDecode?.Format) {
        setDateFormat(DateDecode?.Format);
      } else {
        setDateFormat("MM-DD-YYYY");
      }
    };

    handleDateFormat();
  }, [DateDecode]);

  let fetchData = async () => {
    try {
      const res = await AxiosInstance.get(
        `/invoice/invoice_detail/${location?.state?.id}`
      );
      setInvoicedata(res?.data?.data);
    } catch (error) {
      console.error("Error: ", error?.messae);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  const handleCopy = () => {
    const fullName = `${invoicedata?.customer?.FirstName?.charAt(
      0
    )?.toUpperCase()}${invoicedata?.customer?.FirstName?.slice(
      1
    )} ${invoicedata?.customer?.LastName?.charAt(
      0
    )?.toUpperCase()}${invoicedata?.customer?.LastName?.slice(1)}`;
    navigator.clipboard.writeText(fullName);
  };

  const handleEditClick = (id) => {
    // navigate(`/${companyName}/addinvoice`, {
    //   state: {
    //     invoiceId: location?.state?.id,
    //     navigats: [...location?.state?.navigats, "/addinvoice"],
    //   },
    // });
    if (companyName) {
      navigate(`/${companyName}/addinvoice`, {
        state: {
          invoiceId: location?.state?.id,
          navigats: [...location?.state?.navigats, "/addinvoice"],
        },
      });
    } else {
      navigate(`/staff-member/workeraddinvoice`, {
        state: {
          invoiceId: location?.state?.id,
          navigats: [...location?.state?.navigats, "/workeraddinvoice"],
        },
      });
    }
  };

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggle = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // const sendMail = async () => {
  //   try {
  //     const mailRes = await AxiosInstance.post(
  //       `/invoice-payment/send_mail/${location?.state?.id}`
  //     );
  //     if (mailRes?.data?.statusCode === 200) {
  //       showToast.success(mailRes?.data?.message);
  //     } else {
  //       sendToast(mailRes?.data?.message);
  //     }
  //   } catch (error) {
  //     sendToast(error?.response?.data?.error);
  //   }
  // };
  const sendMail = async () => {
    try {
      setLoader(true); // Loader start
      const mailRes = await AxiosInstance.post(
        `/invoice-payment/send_mail/${location?.state?.id}`
      );

      if (mailRes?.data?.statusCode === 200) {
        showToast.success(mailRes?.data?.message);
      } else {
        sendToast(mailRes?.data?.message);
      }
    } catch (error) {
      sendToast(error?.response?.data?.error);
    } finally {
      setLoader(false);
    }
  };

  const downloadPdf = async () => {
    try {
      const res = await AxiosInstance.post(
        `/invoice/invoicepdf/${location?.state?.id}`
      );
      if (res?.data?.statusCode === 200) {
        const url = `${cdnUrl}/upload/${res?.data?.fileName}`;

        fetch(url)
          .then((response) => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.blob();
          })
          .then((blob) => {
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = "invoice_document.pdf";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          })
          .catch((error) =>
            console.error(
              "There was a problem with the fetch operation:",
              error
            )
          );
      }
    } catch (error) {
      console.error("Error downloading the PDF:", error);
    }
  };

  const generatePDF = async () => {
    try {
      const res = await AxiosInstance.post(
        `/invoice/invoicepdf/${location?.state?.id}`
      );
      if (res.data.statusCode === 200) {
        const url = `${cdnUrl}/upload/${res?.data?.fileName}`;

        fetch(url)
          .then((response) => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.blob();
          })
          .then((blob) => {
            const pdfUrl = window.URL.createObjectURL(blob);

            const newTab = window.open(pdfUrl, "_blank");
            if (newTab) {
              newTab.focus();
            } else {
              alert("Please allow popups for this site.");
            }
          })
          .catch((error) => {
            console.error(
              "There was a problem with the fetch operation:",
              error
            );
          });
      }
    } catch (error) {
      console.error("Error downloading the PDF:", error);
    }
  };
  const [invoiceStatus, setInvoiceStatus] = useState(
    invoicedata?.Status || "Unpaid"
  );
  useEffect(() => {
    if (invoicedata?.Status) {
      setInvoiceStatus(invoicedata.Status);
    }
  }, [invoicedata]);
  const handleCancelInvoice = () => {
    swal({
      title: "Are you sure?",
      text: "Once cancelled , you will not be able to Active this Invoice!",
      icon: "warning",
      content: {
        element: "input",
        attributes: {
          placeholder: "Enter reason for cancelling",
          type: "text",
          id: "delete-reason",
          oninput: (e) => {
            const reason = e.target.value;

            const deleteButton = document.querySelector(
              ".swal-button--confirm"
            );
            deleteButton.disabled = reason.trim() === "";
          },
        },
      },
      buttons: {
        cancel: "Cancel",
        confirm: {
          text: "Confirm",
          closeModal: true,
          value: true,
          className: "bg-orange-color",
        },
      },
      dangerMode: true,
    }).then(async (deleteReason) => {
      if (deleteReason) {
        try {
          const response = await AxiosInstance.put(
            `/invoice/cancel/${location?.state?.id}`,
            {
              data: { DeleteReason: deleteReason },
            }
          );
          setInvoiceStatus("Canceled");
        } catch (error) {
          console.error("Error cancelling invoice:", error);
        }
      } else {
        showToast.success("Invoice is safe!", {
          position: "top-center",
          autoClose: 1000,
        });
      }
    });
    setTimeout(() => {
      const deleteButton = document.querySelector(".swal-button--confirm");
      if (deleteButton) {
        deleteButton.disabled = true;
      }
    }, 0);
  };

  const handleOpenSignPDFDialog = (fileUri) => {
    setSelectedFileUri(fileUri);
    setOpenSignPDF(true);
  };

  const handleCloseDialog = () => {
    setOpenSignPDF(false);
    setSelectedFileUri(null);
  };
  const toggleDropdown = () => setDropdownOpen((prev) => !prev);
  const menuItems = [
    {
      label: "Collect Signature",

      onClick: async () => {
        try {
          const willDelete = await swal({
            title: "Are you sure?",
            text: "Are you sure you want to collect the customer's signature?",
            icon: "warning",
            buttons: {
              cancel: "Cancel",
              confirm: {
                text: "Process",
                value: true,
                visible: true,
                className: "bg-orange-color",
                closeModal: true,
              },
            },
            dangerMode: true,
          });
          if (willDelete) {
            setCollectSignatureLoader(true);
            setProgress(0);
            simulateProgress();

            try {
              const res = await AxiosInstance.post(
                `/invoice/invoicepdf/${location?.state?.id}`
              );
              const staticFilePath = `${cdnUrl}/upload/${res.data.fileName}`;

              // const staticFilePath =
              //   "https://app.cloudjobmanager.com/cdn/upload/20241204124543_quotes_document123.pdf";

              const data = {
                title: "Agreement",
                subject: "Please sign the agreement",
                message: "Please review and sign the document",
                signers: [
                  {
                    email: invoicedata?.customer?.EmailAddress,
                    name: invoicedata?.customer?.FirstName,
                    order: 0,
                  },
                ],
                CompanyId: invoicedata?.CompanyId,
                InvoiceId: invoicedata?.InvoiceId,
                fileUrls: [staticFilePath],
              };

              const response = await AxiosInstance.post(
                "/dropbox/signature_request/send",
                data,
                {
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );

              if (response.status === 200) {
                showToast.success("PDF successfully sent to Dropbox!");
              }
              fetchData();
            } catch (error) {
              if (error?.response) {
                console.error(
                  "Server responded with an error:",
                  error?.response?.data
                );
                showToast.error("Failed to send the PDF. Please try again.");
              } else {
                console.error("Error posting PDF to Dropbox:", error?.message);
                showToast.error(
                  "An unexpected error occurred. Please try again."
                );
              }
            } finally {
              setCollectSignatureLoader(false);
              setProgress(0);
            }
          }
        } catch (err) {
          console.error("Swal Error:", err);
        }
      },
    },
    {
      label: "Download PDF",
      onClick: async () => {
        try {
          const willDelete = await swal({
            title: "Are you sure?",
            text: "You want to download!",
            icon: "warning",
            buttons: {
              cancel: "Cancel",
              confirm: {
                text: "Process",
                value: true,
                visible: true,
                className: "bg-orange-color",
                closeModal: true,
              },
            },
            dangerMode: true,
          });
          if (willDelete) {
            setCollectSignatureLoader(true);
            setProgress(0);
            simulateProgress();
            try {
              await downloadPdf();
            } catch (error) {
              console.error("Error:", error);
              showToast.error("Failed to send the PDF. Please try again.");
            } finally {
              setCollectSignatureLoader(false);
              setProgress(0);
            }
          }
        } catch (err) {
          console.error("Swal Error:", err);
        }
      },
    },
    {
      label: loader ? (
        <LoaderComponent height="20" width="20" />
      ) : (
        "Send Receipt to Mail"
      ),
      onClick: () => {
        sendMail();
      },
    },

    {
      label: "Print",
      onClick: async () => {
        try {
          const willDelete = await swal({
            title: "Are you sure?",
            text: "You want to Print!",
            icon: "warning",
            buttons: {
              cancel: "Cancel",
              confirm: {
                text: "Process",
                value: true,
                visible: true,
                className: "bg-orange-color",
                closeModal: true,
              },
            },
            dangerMode: true,
          });
          if (willDelete) {
            setCollectSignatureLoader(true);
            setProgress(0);
            simulateProgress();
          }
          try {
            await generatePDF();
          } catch (error) {
            console.error("Error:", error);
            showToast.error("Failed to send the PDF. Please try again.");
          } finally {
            setCollectSignatureLoader(false);
            setProgress(0);
          }
        } catch (err) {
          console.error("Swal Error:", err);
        }
      },
    },
  ];
  const handleDropboxDelete = async (id) => {
    sendSwal().then(async (deleteReason) => {
      if (deleteReason) {
        try {
          const response = await AxiosInstance.delete(`/dropbox/delete/${id}`, {
            data: { DeleteReason: deleteReason },
          });
          if (response?.data?.statusCode === 200) {
            showToast.success(response?.data?.message);
            setInvoicedata((prevData) => ({
              ...prevData,
              dropboxFiles: prevData?.dropboxFiles.filter(
                (file) => file?.signatureRequestId !== id
              ),
            }));
          } else {
            showToast.warning(response?.data?.message);
          }
        } catch (error) {
          if (error?.response) {
            showToast.error(
              error?.response?.data?.message || "An error occurred"
            );
          } else {
            showToast.error(error?.message || "An error occurred");
          }
        }
      } else {
        showToast.success("Quote is safe!", {
          position: "top-center",
          autoClose: 1000,
        });
      }
    });
  };

  return (
    <>
      <InvoiceDetail
        loader={loader}
        companyName={companyName}
        location={location}
        invoicedata={invoicedata}
        data={data}
        setMail={setMail}
        setFile={setFile}
        handleEditClick={handleEditClick}
        dropdownOpen={dropdownOpen}
        toggle={toggle}
        downloadPdf={downloadPdf}
        generatePDF={generatePDF}
        handleCopy={handleCopy}
        open={open}
        setOpen={setOpen}
        file={file}
        mail={mail}
        options={options}
        navigate={navigate}
        sendMail={sendMail}
        handleCancelInvoice={handleCancelInvoice}
        setInvoiceStatus={setInvoiceStatus}
        invoiceStatus={invoiceStatus}
        cdnUrl={cdnUrl}
        toggleDropdown={toggleDropdown}
        menuItems={menuItems}
        collectSignatureLoader={collectSignatureLoader}
        progress={progress}
        handleOpenSignPDFDialog={handleOpenSignPDFDialog}
        openSignPDF={openSignPDF}
        handleCloseDialog={handleCloseDialog}
        selectedFileUri={selectedFileUri}
        handleDropboxDelete={handleDropboxDelete}
        dateFormat={dateFormat}
      />
    </>
  );
}

export default InvoiceDetails;

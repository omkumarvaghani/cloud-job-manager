import React, { useEffect, useState } from "react";
import edit from "../../../assets/image/icons/edit.svg";
import Copy from "../../../assets/image/icons/copy.svg";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { handleAuth } from "../../../components/Login/Auth";
import Previous from "../../../assets/image/icons/Previous.png";
import moment from "moment";
import AxiosInstance from "../../AxiosInstance";
import quotteImage from "../../../assets/Blue-sidebar-icon/Quote.svg";
import QuotesDetails from "./Views/QuoteDetails";
import showToast from "../../../components/Toast/Toster";
import sendSwal from "../../../components/Swal/sendSwal";
import swal from "sweetalert";

const options = { year: "numeric", month: "short", day: "numeric" };

function QuotesDetail() {
  const cdnUrl = process.env.REACT_APP_CDN_API;

  const navigate = useNavigate();
  const location = useLocation();
  const { CompanyName } = useParams();
  const [collectSignatureLoader, setCollectSignatureLoader] = useState(false);
  const [progress, setProgress] = useState(0);

  const [quotesData, setQuotesData] = useState({});
  const [requestData, setRequestData] = useState({});
  const [loader, setLoader] = useState(true);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modal, setModal] = useState(false);
  const [mail, setMail] = useState(false);

  let fetchData = async () => {
    try {
      handleAuth(navigate, location);
      const res = await AxiosInstance.get(
        `/v1/quote/quote_details/${location?.state?.id}`
      );
      setQuotesData(res?.data?.data);
    } catch (error) {
      console.error("Error: ", error?.messae);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  let fetchCustomerData = async () => {
    try {
      handleAuth(navigate, location);
      const res = await AxiosInstance.get(
        `/requestchange/${location?.state?.id}/${
          localStorage?.getItem("CompanyId") || tokenDecode?.companyId
        }`
      );
      setRequestData(res?.data?.data);
    } catch (error) {
      console.error("Error: ", error?.messae);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const simulateProgress = () => {
    let simulatedProgress = 0;
    const interval = setInterval(() => {
      simulatedProgress += 5;
      setProgress(simulatedProgress);

      if (simulatedProgress >= 100) {
        clearInterval(interval);
      }
    }, 200);
  };
  const [tokenDecode, setTokenDecode] = useState({});

  // const fetchDatas = async () => {
  //   try {
  //     const res = await handleAuth(navigate, location);
  //     setTokenDecode(res?.data);
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   }
  // };

  // useEffect(() => {
  //   fetchDatas();
  // }, []);

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

  const handleCopy = () => {
    const firstName = quotesData?.customer?.FirstName || "";
    const lastName = quotesData?.customer?.LastName || "";
    const fullName = `${firstName} ${lastName}`.trim();
    navigator.clipboard.writeText(fullName);
  };

  const moreActiontoggle = () => setDropdownOpen((prevState) => !prevState);

  const handleEditClick = (id) => {
    // navigate(`/${CompanyName}/add-quotes`, {
    //   state: {
    //     id: location?.state?.id,
    //     navigats: [...location?.state?.navigats, "/add-quotes"],
    //   },
    // });
    if (CompanyName) {
      navigate(`/${CompanyName}/add-quotes`, {
        state: {
          id: location?.state?.id,
          navigats: [...location?.state?.navigats, "/add-quotes"],
        },
      });
    } else {
      navigate(`/staff-member/add-quotes`, {
        state: {
          id: location?.state?.id,
          navigats: [...location?.state?.navigats, "/add-quotes"],
        },
      });
    }
  };

  const toggle = () => setModal(!modal);

  const downloadPdf = async () => {
    try {
      const res = await AxiosInstance.post(
        `/quote/quotepdf/${location?.state?.id}`
      );
      if (res.data.statusCode === 200) {
        const url = `${cdnUrl}/upload/${res?.data?.fileName}`;

        fetch(url)
          .then((response) => {
            if (!response?.ok) throw new Error("Network response was not ok");
            return response.blob();
          })
          .then((blob) => {
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = "quotes_document.pdf";
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
        `/quote/quotepdf/${location?.state?.id}`
      );
      if (res?.data?.statusCode === 200) {
        const url = `${cdnUrl}/upload/${res?.data?.fileName}`;

        fetch(url)
          .then((response) => {
            if (!response?.ok) throw new Error("Network response was not ok");
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

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  const menuItems = [
    {
      // convrt to contarct is comment but the in live got error so that temporarily this is comment
      label: "Convert to contract",
      // UCOMMENT FOR THE CONVERT TO CONTRACT
      // onClick: () => {
      //   navigate(`/${CompanyName}/add-contract`, {
      //     state: {
      //       navigats: [...location?.state?.navigats, "/add-contract"],
      //       QuoteId: location?.state?.id,
      //       formData: quotesData,
      //       products: quotesData?.products,
      //     },
      //   });
      // },
      onClick: () => {
        if (CompanyName) {
          navigate(`/${CompanyName}/add-contract`, {
            state: {
              QuoteId: location?.state?.id,
              formData: quotesData,
              products: quotesData?.products,
              navigats: [...location?.state?.navigats, "/add-contract"],
            },
          });
        } else {
          navigate(`/staff-member/add-contract`, {
            state: {
              QuoteId: location?.state?.id,
              formData: quotesData,
              products: quotesData?.products,
              navigats: [...location?.state?.navigats, "/add-contract"],
            },
          });
        }
      },
    },
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
                `/quote/quotepdf/${location?.state?.id}`
              );

              const staticFilePath = `${cdnUrl}/upload/${res.data.fileName}`;

              // const staticFilePath =
              //   "${cdnUrl}/upload/20241204124543_quotes_document123.pdf";

              const data = {
                title: "Agreement",
                subject: "Please sign the agreement",
                message: "Please review and sign the document",
                signers: [
                  {
                    email: quotesData?.customer?.EmailAddress,
                    name: quotesData?.customer?.FirstName,
                    order: 0,
                  },
                ],
                CompanyId: quotesData?.CompanyId,
                QuoteId: quotesData?.QuoteId,
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
              if (response?.status === 200) {
                showToast.success("PDF successfully sent to Dropbox!");
              }
              fetchData();
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
  const [selectedFileUri, setSelectedFileUri] = useState(null);
  const [openSignPDF, setOpenSignPDF] = useState(false);

  const handleOpenSignPDFDialog = (fileUri) => {
    setSelectedFileUri(fileUri);
    setOpenSignPDF(true);
  };

  const handleCloseDialog = () => {
    setOpenSignPDF(false);
    setSelectedFileUri(null);
  };
  const handleDelete = async (id) => {
    sendSwal().then(async (deleteReason) => {
      if (deleteReason) {
        try {
          const response = await AxiosInstance.delete(`/dropbox/delete/${id}`, {
            data: { DeleteReason: deleteReason },
          });
          if (response?.data?.statusCode === 200) {
            showToast.success(response?.data?.message);
            setQuotesData((prevData) => ({
              ...prevData,
              dropboxFiles: prevData?.dropboxFiles?.filter(
                (file) => file?.signatureRequestId !== id
              ),
            }));
          } else {
            showToast.warning(response?.data?.message);
          }
        } catch (error) {
          if (error.response) {
            showToast?.error(
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
      <QuotesDetails
        loader={loader}
        Previous={Previous}
        toggle={toggle}
        setMail={setMail}
        CompanyName={CompanyName}
        handleEditClick={handleEditClick}
        dropdownOpen={dropdownOpen}
        moreActiontoggle={moreActiontoggle}
        quotesData={quotesData}
        edit={edit}
        downloadPdf={downloadPdf}
        generatePDF={generatePDF}
        quotteImage={quotteImage}
        Copy={Copy}
        handleCopy={handleCopy}
        options={options}
        open={open}
        setOpen={setOpen}
        file={file}
        cdnUrl={cdnUrl}
        setFile={setFile}
        moment={moment}
        mail={mail}
        fetchCustomerData={fetchCustomerData}
        requestData={requestData}
        toggleDropdown={toggleDropdown}
        menuItems={menuItems}
        handleOpenSignPDFDialog={handleOpenSignPDFDialog}
        openSignPDF={openSignPDF}
        handleCloseDialog={handleCloseDialog}
        selectedFileUri={selectedFileUri}
        collectSignatureLoader={collectSignatureLoader}
        progress={progress}
        handleDelete={handleDelete}
        dateFormat={dateFormat}
      />
    </>
  );
}

export default QuotesDetail;

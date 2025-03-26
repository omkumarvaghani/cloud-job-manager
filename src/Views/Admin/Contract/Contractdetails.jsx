import React, { useEffect, useState } from "react";
import edit from "../../../assets/image/icons/edit.svg";
import Copy from "../../../assets/image/icons/copy.svg";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { handleAuth } from "../../../components/Login/Auth";
import axios from "axios";
import Previous from "../../../assets/image/icons/Previous.png";
import Contract from "../../../assets/Blue-sidebar-icon/Contract.svg";
import AxiosInstance from "../../AxiosInstance";
import ContractDetailsViews from "./views/ContractDetails";
import sendSwal from "../../../components/Swal/sendSwal";
import showToast from "../../../components/Toast/Toster";
import swal from "sweetalert";

const options = { year: "numeric", month: "short", day: "numeric" };

function ContractDetails() {
  const [tokenDecode, setTokenDecode] = useState({});
  // const fetchDatas = async () => {
  //   try {
  //     const res = await handleAuth(navigate, location);
  //     setTokenDecode(res.data);
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

  useEffect(() => {
    handleAuth(navigate, location);
  }, []);
  const navigate = useNavigate();
  const location = useLocation();
  const { CompanyName } = useParams();

  const baseUrl = process.env.REACT_APP_BASE_API;
  const cdnUrl = process.env.REACT_APP_CDN_API;

  const [contractData, setContractData] = useState({});
  const [loader, setLoader] = useState(true);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState("");
  const [mail, setMail] = useState(false);
  const [savedSignature, setSavedSignature] = useState(null);
  const [signatureSaved, setSignatureSaved] = useState(false);
  const [modal, setModal] = useState(false);
  const [collectSignatureLoader, setCollectSignatureLoader] = useState(false);
  const [selectedFileUri, setSelectedFileUri] = useState(null);
  const [openSignPDF, setOpenSignPDF] = useState(false);
  const [progress, setProgress] = useState(0);

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

  const CompanyId = localStorage.getItem("CompanyId") || tokenDecode?.CompanyId;
  const CustomerId = contractData?.CustomerId;

  let fetchData = async () => {
    try {
      const res = await AxiosInstance.get(
        `/v1/contract/contract_details/${location?.state?.id}`
      );
      setContractData({
        ...res?.data?.data,
        // laborData: labourRes?.data?.data,
        // expenseData: expenseRes?.data?.result,
        // visitsData: visitsRes?.data?.data,
      });
      if (res.data.statusCode === 200) {
        const labourRes = await AxiosInstance.get(
          `/labour/${location?.state?.id}/${
            localStorage.getItem("CompanyId") || tokenDecode?.CompanyId
          }`
        );
        setContractData({
          // ...res?.data?.data,
          laborData: labourRes?.data?.data,
          // expenseData: expenseRes?.data?.result,
          // visitsData: visitsRes?.data?.data,
        });
        const expenseRes = await AxiosInstance.get(
          `/expenses/${location?.state?.id}/${
            localStorage.getItem("CompanyId") || tokenDecode?.CompanyId
          }`
        );
        setContractData({
          // ...res?.data?.data,
          // laborData: labourRes?.data?.data,
          expenseData: expenseRes?.data?.result,
          // visitsData: visitsRes?.data?.data,
        });
        const visitsRes = await AxiosInstance.get(
          `/visits/${location?.state?.id}/${
            localStorage.getItem("CompanyId") || tokenDecode?.CompanyId
          }`
        );
        setContractData({
          // ...res?.data?.data,
          // laborData: labourRes?.data?.data,
          // expenseData: expenseRes?.data?.result,
          visitsData: visitsRes?.data?.data,
        });
      }
    } catch (error) {
      console.error("Error: ", error?.messae);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tokenDecode]);

  const handleOpenSignPDFDialog = (fileUri) => {
    setSelectedFileUri(fileUri);
    setOpenSignPDF(true);
  };

  const handleCloseDialog = () => {
    setOpenSignPDF(false);
    setSelectedFileUri(null);
  };

  const handleCopy = () => {
    const fullName = `${contractData?.customer?.FirstName || ""} ${
      contractData?.customer?.LastName || ""
    }`;
    navigator.clipboard.writeText(fullName).catch((err) => {});
  };

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const moreActiontoggle = () => setDropdownOpen((prevState) => !prevState);

  const [signatureRef, setSignatureRef] = useState(null);
  const clearSignature = () => {
    signatureRef?.clear();
  };

  const saveSignature = async () => {
    let image = "";
    try {
      const signatureCanvas = signatureRef;
      const signatureDataURL = signatureCanvas?.toDataURL();
      const signatureBlob = await fetch(signatureDataURL).then((res) =>
        res.blob()
      );

      const imageData = new FormData();
      imageData.append("files", signatureBlob, "signature.png");

      const url = `${cdnUrl}/upload`;
      const result = await axios.post(url, imageData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setSavedSignature(signatureDataURL);
      image = result?.data?.files[0]?.filename;
    } catch (error) {
      console.error(error, "");
    }

    setSignatureSaved(true);

    const quoteApiUrl = `${baseUrl}/quotes/clientdashboard/${contractData?.quote_id}`;

    try {
      setLoader(true);

      const response = await AxiosInstance.put(quoteApiUrl, {
        signature: image || "",
      });

      if (response?.data?.statusCode === 200) {
        fetchData();
        setModal(false);
        showToast.success(response?.data?.message);
      } else {
        showToast.error(response?.data?.message);
        console.error(
          "Failed to update quote status:",
          response?.data?.message
        );
      }
    } catch (error) {
      console.error(
        "Error updating quote status:",
        error?.response?.data || error?.message
      );
      showToast.error(
        error?.response?.data?.message || "Error updating quote status"
      );
    } finally {
      setLoader(false);
      setModal(false);
    }
  };

  const handleEditClick = (id) => {
    if (CompanyName) {
      navigate(`/${CompanyName}/add-contract`, {
        state: {
          id: location?.state?.id,
          navigats: [...location?.state?.navigats, "/add-contract"],
        },
      });
    } else {
      navigate(`/staff-member/add-contract`, {
        state: {
          id: location?.state?.id,
          navigats: [...location?.state?.navigats, "/add-contract"],
        },
      });
    }
  };

  const toggle = () => setModal(!modal);
  const [isTimeEmptyModalOpen, setIsTimeEmptyModalOpen] = useState({
    isOpen: false,
    propertyData: null,
  });

  const handleTimeEmptyModalOpen = () => {
    setIsTimeEmptyModalOpen({ isOpen: true, propertyData: null });
  };

  const handleTimeEmptyeditModalOpen = (LabourId) => {
    setIsTimeEmptyModalOpen({ isOpen: true, propertyData: null });
  };

  const [isExpanseModalOpen, setIsExpanseModalOpen] = useState({
    isOpen: false,
    propertyData: null,
  });

  const handleExpanseModalOpen = (ExpenseId) => {
    setIsExpanseModalOpen({ isOpen: true, propertyData: null });
  };

  const [isVisitModalOpen, setIsVisitModalOpen] = useState({
    isOpen: false,
    propertyData: null,
  });

  const handleVisitModalOpen = () => {
    setIsVisitModalOpen({ isOpen: true, propertyData: null });
  };

  const downloadPdf = async () => {
    try {
      const res = await AxiosInstance.post(
        `/contract/contractpdf/${location?.state?.id}`
      );
      if (res.data.statusCode === 200) {
        const url = `${cdnUrl}/upload/${res.data.fileName}`;
        fetch(url)
          .then((response) => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response?.blob();
          })
          .then((blob) => {
            const link = document?.createElement("a");
            link.href = window?.URL?.createObjectURL(blob);
            link.download = "contract_document.pdf";
            document?.body?.appendChild(link);
            link.click();
            document?.body?.removeChild(link);
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
        `/contract/contractpdf/${location?.state?.id}`
      );
      if (res?.data?.statusCode === 200) {
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

  const handleDelete = async (event, LabourId, ContractId) => {
    event.preventDefault();

    if (!LabourId || !ContractId) {
      showToast.error("Cannot delete. Invalid ID.");
      return;
    }
    sendSwal().then(async (deleteReason) => {
      if (deleteReason) {
        try {
          const response = await AxiosInstance.delete(
            `/labour/${LabourId}/${ContractId}`,
            {
              data: { DeleteReason: deleteReason },
            }
          );
          if (response?.data?.statusCode === 200) {
            setTimeout(() => {
              showToast.success(response?.data?.message);
            }, 500);
            fetchData();
          } else {
            showToast.warning(response?.data?.message);
          }
        } catch (error) {
          console.error("Error:", error);
          showToast.error("An error occurred while deleting.");
        }
      } else {
        showToast.success("Lobour is safe!", {
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

  const handleDropboxDelete = async (id) => {
    sendSwal().then(async (deleteReason) => {
      if (deleteReason) {
        try {
          const response = await AxiosInstance.delete(`/dropbox/delete/${id}`, {
            data: { DeleteReason: deleteReason },
          });
          if (response?.data?.statusCode === 200) {
            showToast.success(response?.data?.message);
            setContractData((prevData) => ({
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
  const handleExpensesDelete = async (event, ExpenseId, ContractId) => {
    event.preventDefault();

    if (!ExpenseId || !ContractId) {
      showToast.error("Cannot delete. Invalid ID.");
      return;
    }
    sendSwal().then(async (deleteReason) => {
      if (deleteReason) {
        try {
          const response = await AxiosInstance.delete(
            `/expenses/${ExpenseId}/${ContractId}`,
            {
              data: { DeleteReason: deleteReason },
            }
          );
          if (response?.data?.statusCode === 200) {
            setTimeout(() => {
              showToast.success(response?.data?.message);
            }, 500);
            fetchData();
          } else {
            showToast.error(response?.data?.message);
          }
        } catch (error) {
          console.error("Error:", error);
          showToast.error("An error occurred while deleting.");
        }
      } else {
        showToast.success("Expenses is safe!", {
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

  const handlevisitDelete = async (event, VisitId, ContractId) => {
    event.preventDefault();

    if (!VisitId || !ContractId) {
      console.error("Invalid IDs: labourId or contractId is undefined");
      showToast.error("Cannot delete. Invalid ID.");
      return;
    }
    sendSwal().then(async (deleteReason) => {
      if (deleteReason) {
        try {
          const response = await AxiosInstance.delete(
            `/visits/${VisitId}/${ContractId}`,
            {
              data: { DeleteReason: deleteReason },
            }
          );
          if (response?.data?.statusCode === 200) {
            setTimeout(() => {
              showToast.success(response?.data?.message);
            }, 500);
            fetchData();
          } else {
            showToast.error(response?.data?.message);
          }
        } catch (error) {
          console.error("Error:", error);
          showToast.error("An error occurred while deleting.");
        }
      } else {
        showToast.success("Visits is safe!", {
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

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);
  const menuItems = [
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
              // Simulate an API call
              const res = await AxiosInstance.post(
                `/contract/contractpdf/${location?.state?.id}`
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
                    email: contractData?.customer?.EmailAddress,
                    name: contractData?.customer?.FirstName,
                    order: 0,
                  },
                ],
                CompanyId: contractData?.CompanyId,
                ContractId: contractData?.ContractId,
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
              setCollectSignatureLoader(false); // Stop loader
              setProgress(0); // Reset progress to 0 after completion
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

  return (
    <>
      <ContractDetailsViews
        loader={loader}
        Previous={Previous}
        toggle={toggle}
        setMail={setMail}
        CompanyName={CompanyName}
        handleEditClick={handleEditClick}
        dropdownOpen={dropdownOpen}
        moreActiontoggle={moreActiontoggle}
        edit={edit}
        Copy={Copy}
        handleCopy={handleCopy}
        options={options}
        open={open}
        setOpen={setOpen}
        file={file}
        cdnUrl={cdnUrl}
        setFile={setFile}
        mail={mail}
        Contract={Contract}
        contractData={contractData}
        handleTimeEmptyModalOpen={handleTimeEmptyModalOpen}
        handleTimeEmptyeditModalOpen={handleTimeEmptyeditModalOpen}
        handleVisitModalOpen={handleVisitModalOpen}
        modal={modal}
        handleExpanseModalOpen={handleExpanseModalOpen}
        clearSignature={clearSignature}
        setSignatureRef={setSignatureRef}
        saveSignature={saveSignature}
        isTimeEmptyModalOpen={isTimeEmptyModalOpen}
        setIsTimeEmptyModalOpen={setIsTimeEmptyModalOpen}
        fetchData={fetchData}
        isExpanseModalOpen={isExpanseModalOpen}
        setIsExpanseModalOpen={setIsExpanseModalOpen}
        isVisitModalOpen={isVisitModalOpen}
        setIsVisitModalOpen={setIsVisitModalOpen}
        CompanyId={CompanyId}
        downloadPdf={downloadPdf}
        generatePDF={generatePDF}
        handleDelete={handleDelete}
        handleExpensesDelete={handleExpensesDelete}
        handlevisitDelete={handlevisitDelete}
        CustomerId={CustomerId}
        toggleDropdown={toggleDropdown}
        menuItems={menuItems}
        setContractData={setContractData}
        collectSignatureLoader={collectSignatureLoader}
        progress={progress}
        fetchDatas={fetchDatas}
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

export default ContractDetails;

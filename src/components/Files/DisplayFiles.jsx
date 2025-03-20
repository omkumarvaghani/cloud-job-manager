import React, { useState } from "react";
import { Button, Modal, ModalBody } from "reactstrap";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import PDFIcon from "../../assets/image/icons/pdficon.png";
import DOCSIcon from "../../assets/image/icons/docs.svg";
import FitbitIcon from "@mui/icons-material/Fitbit";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material";

const DisplayImage = ({ files, setFiles, IsDeleted, IsIndex = true }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const cdnUrl = process.env.REACT_APP_CDN_API;

  const renderFile = (file, index) => {
    const fileType =
      file?.type || (typeof file === "string" ? file?.split(".").pop() : "");
    let fileURL = "";
    if (file instanceof File) {
      fileURL = URL.createObjectURL(file);
    } else if (typeof file === "string") {
      fileURL = `${cdnUrl}/upload/${file}`;
    }

    const handleFileClick = () => {
      setSelectedFile(fileURL); 
      setModalOpen(true); 
    };

    const fileName = file instanceof File ? file.name : file;
    const shortenedFileName = fileName?.substring(0, 100);

    return (
      <Grid
        className="d-flex gap-2 align-items-center display-file-main"
        key={fileName}
      >
        <Grid className="d-flex gap-2 align-items-center image-main-section">
          {IsIndex && (
            <Grid
              style={{
                borderRadius: "50%",
                padding: "2px",
                marginRight: "10px",
                width: "25px",
                height: "25px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                overflow: "hidden",
              }}
              className="text-white-color bg-blue-color"
            >
              {index + 1}
            </Grid>
          )}
          {IsDeleted && (
            <DeleteForeverRoundedIcon
              style={{ color: "red", cursor: "pointer" }}
              onClick={() => handleDelete(file)}
            />
          )}
          <span
            onClick={handleFileClick}
            style={{ cursor: "pointer" }}
            className="text-blue-color"
          >
            {fileType?.includes("image/") ||
            fileURL?.match(/\.(jpg|jpeg|png|webp)$/i) ? (
              <img
                src={fileURL}
                height={"30px"}
                style={{ paddingRight: "10px" }}
                alt={shortenedFileName}
              />
            ) : fileType === "application/pdf" || fileURL?.match(/\.pdf$/i) ? (
              <img
                src={PDFIcon}
                alt="PDF Icon"
                style={{
                  cursor: "pointer",
                  width: "30px",
                  height: "30px",
                  paddingRight: "10px",
                }}
              />
            ) : fileType === "application/msword" ||
              fileType ===
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
              fileURL?.match(/\.(doc|docx)$/i) ? (
              <img
                src={DOCSIcon}
                alt="DOCS Icon"
                style={{
                  cursor: "pointer",
                  width: "30px",
                  height: "30px",
                  paddingRight: "10px",
                }}
              />
            ) : fileType === "application/vnd.ms-excel" ||
              fileType ===
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
              fileURL?.match(/\.(xls|xlsx)$/i) ? (
              <FitbitIcon />
            ) : (
              shortenedFileName
            )}
            {shortenedFileName}
          </span>
        </Grid>
      </Grid>
    );
  };

  const handleDelete = (fileToDelete) => {
    setFiles(files.filter((file) => file !== fileToDelete));
  };

  const closeFileModal = () => {
    setModalOpen(false);
  };

  if (files?.length === 0) {
    return null;
  }

  return (
    <Grid
      className="d-flex flex-column gap-3 mt-2 border-blue-color"
      style={{
        border: "2px dashed ",
        padding: "15px",
        borderRadius: "10px",
      }}
    >
      {files?.map((file, index) => renderFile(file, index))}
      {selectedFile && (
        <Dialog
          open={modalOpen}
          onClose={closeFileModal}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            <Typography className="text-blue-color borerBommoModel">File Preview</Typography>
          </DialogTitle>
          <DialogContent style={{ textAlign: "center" }}>
            {selectedFile?.endsWith(".pdf") ? (
              <iframe
                src={selectedFile}
                style={{ width: "100%", height: "600px" }}
                title="File Preview"
              />
            ) : (
              <img
                src={selectedFile}
                alt="Preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "600px",
                  borderRadius: "10px",
                }}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={closeFileModal}
              className="bg-blue-color text-white"
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Grid>
  );
};
const FileModal = ({ open, setOpen, file }) => {
  const cdnUrl = process.env.REACT_APP_CDN_API;
  const fileURL =
    file instanceof File
      ? URL.createObjectURL(file)
      : `${cdnUrl}/upload/${file}`;
  const fileType =
    file?.type ||
    (typeof file === "string" ? `application/${file?.split(".").pop()}` : "");

  const renderContent = () => {
    if (!fileURL) return <p>No file to display.</p>;

    if (
      fileType?.includes("image/") ||
      fileURL?.match(/\.(jpg|jpeg|png|webp)$/i)
    ) {
      return <img src={fileURL} width={"100%"} alt="Image" />;
    } else if (fileType === "application/pdf" || fileURL?.match(/\.pdf$/i)) {
      return (
        <iframe
          src={fileURL}
          style={{ width: "100%", height: "80vh" }}
          className="p-0 m-0"
          title="PDF Viewer"
        />
      );
    } else if (
      fileType === "application/msword" ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileURL?.match(/\.(doc|docx)$/i)
    ) {
      const encodedURL = encodeURIComponent(fileURL);
      return (
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodedURL}`}
          style={{ width: "100%", height: "100vh" }}
          title="Document Viewer"
        />
      );
    } else if (
      fileType === "application/vnd.ms-excel" ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      fileURL?.match(/\.(xls|xlsx)$/i)
    ) {
      const encodedURL = encodeURIComponent(fileURL);
      return (
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodedURL}`}
          style={{ width: "100%", height: "100vh" }}
          title="Excel Viewer"
        />
      );
    } else {
      return (
        <Grid>
          <p>Unable to display this file type.</p>
          <a href={fileURL} target="_blank" rel="noopener noreferrer">
            Open file
          </a>
        </Grid>
      );
    }
  };

  return (
    <Modal isOpen={open} toggle={() => setOpen(!open)}>
      <ModalBody className="p-0 m-0">{renderContent()}</ModalBody>
    </Modal>
  );
};

export { DisplayImage, FileModal };

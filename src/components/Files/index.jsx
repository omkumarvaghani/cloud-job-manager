import React, { useEffect, useState } from "react";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import ModeEditOutlineRoundedIcon from "@mui/icons-material/ModeEditOutlineRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import { FileModal } from "./DisplayFiles";
import "./files.css";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material";
import { Row, Col } from "react-bootstrap";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { Button } from "reactstrap";
import Upload from "../../assets/Blue-sidebar-icon/upload.svg"
const allowedTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",

];


const Files = ({ files, setFiles }) => {
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const validFiles = droppedFiles.filter((file) =>
        allowedTypes.includes(file.type)
      );

      if (validFiles.length !== droppedFiles.length) {
        alert("Some files are not allowed and were skipped.");
      }

      setFiles([...files, ...validFiles]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = selectedFiles.filter((file) =>
        allowedTypes.includes(file.type)
      );

      if (validFiles.length !== selectedFiles.length) {
        alert("Some files are not allowed and were skipped.");
      }

      setFiles([...files, ...validFiles]);
    }
  };

  return (
    <Grid className="file-upload-container">
      <Grid
        className="file-upload" style={{marginTop:"10px"}}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="Attachment"
          name="Attachment"
          className="file-input"
          multiple={true}
          accept=".jpg,.jpeg,.png"
          onChange={handleChange}
        />
        <label className="upload-files-label addQUoteFileSelect text-blue-color">
          Drag your files here or{" "}
          <span
            onClick={() => document.getElementById("Attachment").click()}
            className="select-file-link text-blue-color"
          >
            Select a File
          </span>
        </label>
      </Grid>
    </Grid>
  );
};

const File = ({ file, setFile, index }) => {
  const cdnUrl = process.env.REACT_APP_CDN_API;
  const [modalOpen, setModalOpen] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (allowedTypes.includes(droppedFile.type)) {
        setFile(index, droppedFile);
      }
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (allowedTypes.includes(selectedFile.type)) {
        setFile(index, selectedFile);
      }
    }
  };

  const handleRemove = () => {
    setFile(index, "");
  };
  const [previewFile, setPreviewFile] = useState(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const openPreviewModal = () => {
    setPreviewFile(file);
    setPreviewModalOpen(true);
  };

  const closePreviewModal = () => {
    setPreviewModalOpen(false);
    setPreviewFile(null);
  };

  useEffect(() => {
    return () => {
      if (file instanceof Blob) {
        URL.revokeObjectURL(file.preview);
      }
    };
  }, [file]);

  return (
    <Grid>
      <Grid
        className="file-upload px-3 py-2 fileUpload border-blue-color"
        style={{
          maxHeight: "70px",
          minHeight: "55px",
          height: "100%",
          border: "1px dashed",
          cursor: !file ? "pointer" : "default",
        }}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() =>
          !file && document.getElementById(`single-attachment-${index}`).click()
        }
      >
        <input
          type="file"
          id={`single-attachment-${index}`}
          name="single-attachment"
          accept=".jpg,.jpeg,.png"
          style={{ display: "none" }}
          onChange={handleChange}
          multiple={false}
        />
        <span
          className="d-flex flex-column w-100 justify-content-center align-items-center"
          style={{ minHeight: "120px" }}
        >
          {!file ? (
            // <CameraAltOutlinedIcon />
            <img src={Upload}/>
          ) : (
            <Row className="w-100 p-0 d-flex ">
              <Col
                className="col-8 p-0 d-flex"
                onClick={openPreviewModal}
                xl={8}
              >
                {file ? (
                  typeof file === "string" ? (
                    file.endsWith(".pdf") ? (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <PictureAsPdfIcon
                          style={{
                            width: "40px",
                            height: "40px",
                            marginRight: "10px",
                          }}
                        />
                        <span>{file}</span>
                      </div>
                    ) : (
                      <div>
                        <img
                          src={`${cdnUrl}/upload/${file}`}
                          height="120px"
                          alt={file}
                          style={{ width: "100%" }}
                        />
                      </div>
                    )
                  ) : file instanceof Blob ? (
                    file.type === "application/pdf" ? ( // Check if Blob is a PDF
                      <div style={{ display: "flex",}}>
                        <PictureAsPdfIcon
                          style={{
                            width: "40px",
                            height: "40px",
                            // marginRight: "10px",
                          }}
                        />
                        <span>{file?.name || "Uploaded File"}</span>
                      </div>
                    ) : (
                      <div>
                        <img
                          src={URL.createObjectURL(file)}
                          height="50px"
                          alt={file?.name || "Uploaded File"}
                          style={{ width: "50px",marginTop:"35px" }}
                          onLoad={(e) => URL.revokeObjectURL(e.target.src)} // Free memory
                        />
                      </div>
                    )
                  ) : (
                    ""
                  )
                ) : (
                  <span>No file uploaded</span>
                )}
              </Col>

              <Dialog
                open={previewModalOpen}
                onClose={closePreviewModal}
                fullWidth
                maxWidth="sm"
              >
                <DialogTitle>
                  <Typography className="text-blue-color borerBommoModel">
                    File Preview
                  </Typography>
                </DialogTitle>
                <DialogContent style={{ textAlign: "center" }}>
                  {typeof previewFile === "string" &&
                  previewFile.endsWith(".pdf") ? (
                    <iframe
                      src={`${cdnUrl}/upload/${previewFile}`}
                      style={{ width: "100%", height: "600px" }}
                      title="File Preview"
                    />
                  ) : previewFile instanceof Blob ? (
                    previewFile.type === "application/pdf" ? (
                      <iframe
                        src={URL.createObjectURL(previewFile)} 
                        style={{ width: "100%", height: "600px" }}
                        title="File Preview"
                      />
                    ) : (
                      <img
                        src={URL.createObjectURL(previewFile)}
                        alt="Preview"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "600px",
                          borderRadius: "10px",
                        }}
                      />
                    )
                  ) : (
                    <img
                      src={previewFile ? `${cdnUrl}/upload/${previewFile}` : ""}
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
                    onClick={closePreviewModal}
                    className="bg-blue-color text-white"
                  >
                    Close
                  </Button>
                </DialogActions>
              </Dialog>

              <Col
                className="col-4 d-flex flex-column justify-content-around align-items-end"
                style={{ minHeight: "120px" }}
                xl={4}
              >
                {/* <ModeEditOutlineRoundedIcon
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    document
                      .getElementById(`single-attachment-${index}`)
                      .click()
                  }
                /> */}
                <DeleteForeverRoundedIcon
                  style={{ color: "red", cursor: "pointer" }}
                  onClick={handleRemove}
                />
              </Col>
            </Row>
          )}
        </span>
      </Grid>
      <FileModal open={modalOpen} setOpen={setModalOpen} file={file} />
    </Grid>
  );
};

const SingleFileUpload = ({ file, setFile }) => {
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (allowedTypes.includes(droppedFile.type)) {
        setFile(droppedFile);
      } else {
        alert("File type not allowed");
      }
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (allowedTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
      } else {
        alert("File type not allowed");
      }
    }
  };

  return (
    <Grid className="file-upload-container productDragFole">
      <Grid
        className="file-upload " style={{marginTop:"10px"}}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="Attachment"
          name="Attachment"
          className="file-input"
          accept=".jpg,.jpeg,.png"
          onChange={handleChange}
        />
        <label className="upload-files-label addQUoteFileSelect">
          Drag your file here or{" "}
          <span
            onClick={() => document.getElementById("Attachment").click()}
            className="select-file-link"
          >
            Select a File
          </span>
        </label>
      </Grid>
    </Grid>
  );
};

export { Files, File, SingleFileUpload };

import React, { useState } from "react";
import { Grid } from "@mui/material";
import  {Typography} from "@mui/material";


const FileUpload = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (event) => {
    setSelectedFiles([...event?.target?.files]);
  };

  const handleDragOver = (event) => {
    event?.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setSelectedFiles([...event?.dataTransfer?.files]);
  };

  return (
    <Grid
      className="file-upload text-blue-color"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        padding: "20px",
        textAlign: "center",
        width:" 100%",
        
      }}
      
    >
      <input
        type="file"
        id="file-input"
        multiple
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <label for="file-input text-blue-color">
        Drag your files here or <Typography className="text-blue-color" style={{  cursor: "pointer" }}>Select a File</Typography>
      </label>
      <Grid>
        {selectedFiles.length > 0 && (
          <Grid>
            <Typography className="heading-four">Selected Files:</Typography>
            <ul>
              {selectedFiles.map((file, index) => (
                <li key={index}>{file?.name}</li>
              ))}
            </ul>
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};

export default FileUpload;

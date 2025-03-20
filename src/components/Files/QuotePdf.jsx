import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";

const postFile = async (file) => {
  const cdnUrl = process.env.REACT_APP_CDN_API;
  let strings;
  try {
    const fileData = new FormData();

    if (Array.isArray(file)) {
      file.forEach((f) => fileData.append("files", f));
    } else {
      fileData.append("files", file);
    }
    if (!strings) {
      const res = await axios.post(`${cdnUrl}/upload`, fileData);
      strings = Array.isArray(file)
        ? res.data.files.map((file) => file.filename)
        : res.data.files[0]?.filename;
    }

    return strings;
  } catch (error) {
    console.error("Error: ", error.message);
    throw error;
  }
};

const putFile = async (name, file) => {
  const cdnUrl = process.env.REACT_APP_CDN_API;
  try {
    const fileData = new FormData();
    fileData.append("files", file);
    const res = await axios.put(`${cdnUrl}/upload/${name}`, fileData);
    return res.data;
  } catch (error) {
    console.error("Error: ", error.message);
  }
};

const deleteFile = async (name) => {
  const cdnUrl = process.env.REACT_APP_CDN_API;
  try {
    const res = await axios.delete(`${cdnUrl}/upload/${name}`);
    return res.data;
  } catch (error) {
    console.error("Error: ", error.message);
  }
};
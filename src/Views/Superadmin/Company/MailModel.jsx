import { Dialog } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Button, Col, Row } from "reactstrap";
import AxiosInstance from "../../AxiosInstance";
import { handleAuth } from "../../../components/Login/Auth";
import { Navigate, useLocation } from "react-router-dom";
import showToast from "../../../components/Toast/Toster";

const MailModel = ({ setIsOpen, isOpen, item }) => {
  const [mailConfigurations, setMailConfigurations] = useState([]);
  const location = useLocation();
  const [tokenDecode, setTokenDecode] = useState({});

  const fetchTokenData = async () => {
    try {
      const res = await handleAuth(Navigate, location);
      setTokenDecode(res.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchTokenData();
  }, []);

  useEffect(() => {
    AxiosInstance.get("/mailconfiguration")
      .then((response) => {
        if (response?.data.statusCode === 200) {
          setMailConfigurations(response?.data?.result);
        } else {
          console.error("Failed to fetch data");
        }
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }, []);

  const [data, setData] = useState("");
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await AxiosInstance.get(
          `/CompanyMail/company/${item?.companyId}`
        );
        const mailData = res.data?.data;
        setData(mailData);

        if (mailData && mailData.length > 0) {  
          setSelectedConfigId(mailData[0].MailConfigurationId);
        } else {
          console.warn("No mail data found.");
        }
      } catch (error) {
        console.error("Error:", error.message);
      }
    };
    fetchData();
  }, [item]);

  const [selectedConfigId, setSelectedConfigId] = useState(null);

  const handleSave = async () => {
    if (!selectedConfigId || !item?.companyId) {
      console.error(
        "MailConfigurationId or CompanyId is missing from local storage"
      );
      return;
    }

    const postData = {
      MailConfigurationId: selectedConfigId,
      CompanyId: item?.companyId,
      IsSelected: selectedConfigId ? true : false,
      SelectedConfigId: selectedConfigId,
    };

    try {
      const response = await AxiosInstance.post("/companymail", postData);
      if (response?.data.statusCode === 200) {
        setTimeout(() => {
          showToast.success(response?.data.message);
        }, 500);
        setIsOpen(false);
      }
    } catch (error) {
      console.error(
        "Error posting data:",
        error.response ? error.response?.data : error.message
      );
    } finally {
      setIsOpen(false);
    }
  };
  const handleCloseModal = () => {
    setIsOpen(false);
    // setSelectedConfigId(null);
  };

  const handleRadioChange = (configId) => {
    if (selectedConfigId === configId) {
      setSelectedConfigId(null);
    } else {
      setSelectedConfigId(configId);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onClose={handleCloseModal}>
        <Row
          className="mx-2  d-flex align-items-center py-1"
          style={{
            borderRadius: "10px",
            height: "auto",
          }}
        >
          <Col className="scrollFortheReposnsive">
            <Row className="mb-4 mt-3 d-flex borerBommoModel">
              <Col
                className="col-8 head-text text-blue-color"
                style={{ fontSize: "25px" }}
              >
                Change Mail Configuration
              </Col>
              <Col
                className=" col-4 close-btn text-end closeMailCOnfigurationModel"
                style={{ fontSize: "32px", cursor: "pointer" }}
                onClick={handleCloseModal}
              >
                &times;
              </Col>
            </Row>
            <hr
              style={{
                width: "100%",
                padding: "0",
                border: "none",
                borderTop: "2px solid rgba(6, 49, 100, 0.2)",
              }}
            />
            <Row>
              <Col lg="1" md="1" sm="1" xs="1"></Col>
              <Col lg="11" md="11" sm="11" xs="11" className="">
                <Row
                  className=" mx-0 d-flex align-items-center  text-white-color "
                  style={{
                    border: "2px solid rgba(50, 69, 103, 1)",
                    borderRadius: "10px",
                    height: "45px",
                    fontSize: "14px",
                    fontFamily: "poppins",
                    fontWeight: "600",
                    boxShadow: "0px 4px 4px 0px #00000040",
                    backgroundColor: "rgba(6, 49, 100, 1)",
                  }}
                >
                  <Col>Host</Col>
                  <Col>Port </Col>
                  <Col>Email</Col>
                </Row>
              </Col>
            </Row>

            {mailConfigurations.map((config) => (
              <Row key={config._id} className="">
                <Col lg="1" md="1" sm="1" xs="1">
                  <input
                    className="mt-4"
                    value={data}
                    type="radio"
                    name="mail-config"
                    checked={selectedConfigId === config?.MailConfigurationId}
                    onChange={() =>
                      handleRadioChange(config?.MailConfigurationId)
                    }
                    style={{
                      width: "20px",
                      height: "20px",
                    }}
                  />
                </Col>
                <Col
                  lg="11"
                  md="11"
                  sm="11"
                  xs="11"
                  style={{ overflowX: "auto" }}
                  className=""
                >
                  <Row
                    className="mx-0 mt-3 "
                    style={{
                      border: "0.5px solid rgba(50, 69, 103, 1)",
                      borderRadius: "10px",
                      overflow: "hidden",
                      fontSize: "16px",
                      fontWeight: "600",
                      cursor: "pointer",
                      height: "auto",
                      fontFamily: "Poppins",
                      alignItems: "center",
                    }}
                  >
                    <Col
                      style={{
                        whiteSpace: "normal",
                        wordWrap: "break-word",
                        maxWidth: "150px",
                      }}
                      className="text-blue-color"
                    >
                      {config?.Host || "Hoat not available"}
                    </Col>
                    <Col
                      className="text-blue-color"
                      style={{
                        whiteSpace: "normal",
                        wordWrap: "break-word",
                        maxWidth: "150px",
                      }}
                    >
                      {config?.Port}
                    </Col>
                    <Col
                      className="text-blue-color"
                      style={{
                        whiteSpace: "normal",
                        wordWrap: "break-word",
                        maxWidth: "150px",
                      }}
                    >
                      {config?.User || "User not available"}
                    </Col>
                  </Row>
                  <style jsx>{`
                    @media (max-width: 575px) {
                      .scroll-wrapper {
                        overflow-x: auto;
                        min-width: 600px;
                      }
                    }
                  `}</style>
                </Col>
              </Row>
            ))}

            <Col className="d-flex justify-content-between mt-3 mb-2">
              <Button
                color="secondary"
                className="text-blue-color me-2"
                style={{
                  background: "none",
                  color: "#063164",
                  borderColor: "#063164",
                }}
                onClick={handleCloseModal}
              >
                Cancel
              </Button>
              <Button
                className=" bg-blue-color save-mail-btn"
                style={{ fontSize: "1rem" }}
                onClick={handleSave}
              >
                Save
              </Button>
            </Col>
          </Col>
        </Row>
      </Dialog>
    </>
  );
};

export default MailModel;

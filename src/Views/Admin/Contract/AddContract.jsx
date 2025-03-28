import React, { useEffect, useState } from "react";
import "../Client/style.css";
import { handleAuth } from "../../../components/Login/Auth";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./style.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useFormik } from "formik";
import * as Yup from "yup";
import { postFile } from "../../../components/Files/Functions";
import AxiosInstance from "../../AxiosInstance";
import AddContractView from "./views/AddContract";
import showToast from "../../../components/Toast/Toster";

function AddContract() {
  useEffect(() => {
    handleAuth(navigate, location);
  }, []);

  const { CompanyName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const fetchDatas = async () => {
    try {
      const res = await handleAuth(navigate, location);
      setTokenDecode(res.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchDatas();
  }, []);

  const [isProperty, setIsProperty] = useState(false);
  const [isNumChange, setIsNumChange] = useState(false);
  const [isCalendarVisible, setIsCalendarVisible] = React.useState(true);
  const [propertyData, setPropertyData] = useState({});
  const [contractData, setContractData] = useState({});
  const [activeTab, setActiveTab] = useState(1);
  const [isCustomer, setIsCustomer] = useState(false);
  const [loader, setloader] = useState(false);
  const [customersData, setCustomersData] = useState({});
  const [tokenDecode, setTokenDecode] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [teamData, setTeamData] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [showDiscount, setShowDiscount] = useState(false);
  const [showTax, setShowTax] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [checkedState, setCheckedState] = useState({});
  const [workerId, setAssignPersonId] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ids, setIds] = useState([]);
  const [isAddTeam, setIsAddTeam] = useState(false);
  const [mail, setMail] = useState(false);

  const [lineItems, setLineItems] = useState([
    {
      Description: "",
      Name: "",
      Attachment: "",
      Type: "",
      Unit: "",
      CostPerUnit: "",
      Hourly: "",
      CostPerHour: "",
      Fixed: "",
      CostPerFixed: "",
      Square: "",
      CostPerSquare: "",
      Total: "",
      isNew: true,
    },
  ]);

  const toggle = () => setDropdownOpen((prevState) => !prevState);
  const { startDate } = location.state || {};
  const formik = useFormik({
    initialValues: {
      Title: "",
      QuoteId: "",
      Description: "",
      ContractNumber: 1,
      UserId: "",
      CompanyId: "",
      LocationId: "",
      contract_disclaimer:
        "Contract/ Disclaimer\nThis quote is valid for the next 30 days, after which values may be subject to change.",
      Notes: "",
      Attachment: [],
      Discount: "",
      Tax: "",
      OneoffJob: {
        StartDate: startDate || "",
        EndDate: "",
        StartTime: "",
        EndTime: "",
        ScheduleLetter: false,
        Repeats: "Weekly",
      },
      RecuringJob: {
        StartDate: "",
        StartTime: "",
        EndTime: "",
        Repeats: "",
        Duration: "",
        Frequency: "",
      },
      selectedTeams: [],
      subTotal: "",
      Discount: "",
      Tax: "",
    },
    validationSchema: Yup.object({
      Title: Yup.string().required("Title Required"),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const attachmentURLs = [];
        for (let file of formik.values.Attachment) {
          if (typeof file !== "string") {
            const uploadedFilePath = await postFile(file);
            attachmentURLs.push(uploadedFilePath);
          } else {
            attachmentURLs.push(file);
          }
        }

        for (let item of lineItems) {
          if (typeof item?.Attachment !== "string") {
            const string = await postFile(item?.Attachment);
            item.Attachment = string;
          }
        }
        const object = {
          ...values,
          Attachment: attachmentURLs,
          products: lineItems,
          selectedTeams: selectedTeams,
          IsOneoffJob: activeTab === 1 ? true : false,
          IsRecuringJob: activeTab === 2 ? true : false,
          Total: Total,
          subTotal: subTotal,
          WorkerId: workerId,
          QuoteId: location?.state?.QuoteId,
          Frequency: values?.RecuringJob?.Frequency,
          Duration: values?.RecuringJob?.Duration,
          AddedAt: new Date(),
          CompanyId:
            localStorage.getItem("CompanyId") || tokenDecode?.CompanyId,
        };

        if (activeTab === 1) {
          delete object?.IsRecuringJob;
        } else if (activeTab === 2) {
          delete object?.OneoffJob;
        }

        let response;
        if (!location.state?.id) {
          response = await AxiosInstance.post(`/v1/contract`, object);
        } else {
          response = await AxiosInstance.put(
            `/contract/${location?.state?.id}`,
            object
          );
        }
        if (response?.data?.statusCode === 200) {
          setTimeout(() => {
            showToast.success(response?.data?.message);
          }, 500);
          navigate(
            CompanyName
              ? `/${CompanyName}/contract`
              : `/staff-member/workercontract`,
            {
              replace: true,
              state: {
                navigats: [
                  "/index",
                  CompanyName ? "/contract" : "/workercontract",
                ],
              },
            }
          );
        }
        return response?.data;
      } catch (error) {
        console.error("Error: ", error);

        if (error?.response?.status === 400) {
          const errorMessages = error?.response?.data?.errors || [];
          const message = errorMessages.join(", ");
          showToast.warning(`Validation Error: ${message}`);
        } else {
          showToast.error("An error occurred while submitting the form.");
        }
      } finally {
        setLoading(false);
      }
    },
  });
  console.log(formik, "formik");

  useEffect(() => {
    if (location?.state && location?.state?.id) {
      if (location?.state?.id === "someValueForOneOff") {
        setActiveTab(1);
      } else if (location?.state?.id === "someValueForRecurring") {
        setActiveTab(2);
      }
    }
  }, [location?.state]);

  const [showCosts, setShowCosts] = useState(
    new Array(lineItems?.length).fill(false)
  );
  const [menuIsOpen, setMenuIsOpen] = useState(
    new Array(lineItems?.length).fill(false)
  );
  const handleSelectChange = (index, selectedOption) => {
    const newLineItems = [...lineItems];

    newLineItems[index] = {
      ...newLineItems[index],
      ProductId: selectedOption?.ProductId,
      Description: selectedOption?.Description,
      Name: selectedOption?.Name,
      Type: selectedOption?.Type,
      Unit: selectedOption?.Unit,
      Attachment: selectedOption?.Attachment,
      CostPerUnit: selectedOption?.CostPerUnit,
      Hourly: selectedOption?.Hourly,
      CostPerHour: selectedOption?.CostPerHour,
      Fixed: selectedOption?.Fixed,
      CostPerFixed: selectedOption?.CostPerFixed,
      Square: selectedOption?.Square,
      CostPerSquare: selectedOption?.CostPerSquare,
      isNew: true,
      Total: selectedOption?.Unit
        ? Number(selectedOption?.Unit || 0) *
          Number(selectedOption?.CostPerUnit || 0)
        : selectedOption?.Square
        ? Number(selectedOption?.Square || 0) *
          Number(selectedOption?.CostPerSquare || 0)
        : selectedOption?.Hourly
        ? Number(selectedOption?.Hourly || 0) *
          Number(selectedOption?.CostPerHour || 0)
        : Number(selectedOption?.Fixed || 0) *
          Number(selectedOption?.CostPerFixed || 0),
    };

    setLineItems(newLineItems);
    setMenuIsOpen((prevState) => {
      const newState = [...prevState];
      newState[index] = false;
      return newState;
    });
  };

  const addLineItem = () => {
    setLineItems([...lineItems, {}]);
  };
  const deleteLineItem = (index) => {
    const newLineItems = lineItems.filter((_, i) => i !== index);
    setLineItems(newLineItems);
  };

  const handleSaveQuote = async () => {
    try {
      await formik.submitForm();
    } catch (error) {
      console.error("Error saving quote: ", error);
    }
  };

  const fetchData = async () => {
    if (location.state?.id) {
      setloader(true);
      try {
        const res = await AxiosInstance.get(
          `/v1/contract/contract_details/${location.state.id}`
        );

        console.log(res, "resres");
        console.log(location.state.id, "location?.state?.id");
        console.log(res?.data?.data?.statusCode, "res?.data?.data?.statusCode");

        if (res?.data?.statusCode === 200) {
          const data = res.data.data;

          console.log(data, "datadatadata");

          // Ensure that the keys match the response structure
          formik.setValues({
            Title: data.Title || "", // Default to empty string if undefined
            Firstname: data.customer?.Firstname || "",
            LastName: data.customer?.LastName || "",
            ContractNumber: data.ContractNumber || "",
            CompanyId: data.CompanyId || "",
            UserId: data.UserId || "",
            LocationId: data.LocationId || "",
            CustomerMessage: data.CustomerMessage || "",
            ContractDisclaimer: data.ContractDisclaimer || "",
            Notes: data.Notes || "",
            Attachment: data.Attachment || [],
            Discount: data.Discount || "",
            Tax: data.Tax || "",
            subTotal: data.subTotal || "",
            Description: data.Description || "",
            OneoffJob: data.OneoffJob || false,
            RecuringJob: data.RecuringJob || false,
            IsOneoffJob: data.IsOneoffJob || false,
            IsRecuringJob: data.IsRecuringJob || false,
            WorkerId: data.WorkerId?.[0] || "", // Default to empty string if undefined
          });

          console.log(data.Title, "res.data?.data?.Title");
          setContractData(data);
          setActiveTab(data.IsOneoffJob ? 1 : 2);

          const members = teamData.filter((item) =>
            data.WorkerId.includes(item.WorkerId)
          );

          if (members.length > 0) {
            setSelectedTeams(
              members.map((member) => ({
                FirstName: member.FirstName,
                LastName: member.LastName,
                EmailAddress: member.EmailAddress,
                WorkerId: member.WorkerId,
              }))
            );

            setCheckedState((prevState) => {
              const updatedState = { ...prevState };
              members.forEach((member) => {
                updatedState[member.WorkerId] = true;
              });
              return updatedState;
            });

            setAssignPersonId(members.map((member) => member.WorkerId));
          }

          setLineItems(
            data.Items || [
              {
                Description: "",
                Name: "",
                Type: "",
                Unit: "",
                Attachment: "",
                CostPerUnit: "",
                Hourly: "",
                CostPerHour: "",
                Fixed: "",
                CostPerFixed: "",
                Square: "",
                CostPerSquare: "",
                Total: "",
                isNew: true,
              },
            ]
          );
        }
      } catch (error) {
        console.error("Error: ", error);
      } finally {
        setloader(false);
      }
    }
  };
  useEffect(() => {
    fetchData();
  }, [location, tokenDecode]);

  useEffect(() => {
    const getNumber = async () => {
      try {
        if (!location.state?.id) {
          const res = await AxiosInstance.get(
            `/v1/contract/get_number/${
              localStorage.getItem("CompanyId") || tokenDecode?.CompanyId
            }`
          );
          if (res.data?.statusCode === 200) {
            const nextContractNumber = res?.data?.contractNumber + 1;
            formik.setValues((values) => {
              return {
                ...values,
                ContractNumber: nextContractNumber,
              };
            });
          }
        }
      } catch (error) {
        console.error("Error fetching quote number: ", error);
      }
    };

    const initialize = async () => {
      if (location?.state?.previewData) {
        formik.setValues(location?.state?.previewData?.values);
        setLineItems(
          location?.state?.previewData?.lineItems || [
            {
              Description: "",
              Name: "",
              Type: "",
              Unit: "",
              Attachment: "",
              CostPerUnit: "",
              Hourly: "",
              CostPerHour: "",
              Fixed: "",
              CostPerFixed: "",
              Square: "",
              CostPerSquare: "",
              Total: "",
              isNew: true,
              subTotal: "",
            },
          ]
        );
        formik.setFieldValue("UserId", location?.state?.UserId);
        formik.setFieldValue("LocationId", location?.state?.LocationId);
        window.history.replaceState(
          {
            id: location.state?.previewData?.id
              ? location.state?.previewData?.id
              : null,
          },
          ""
        );
      } else if (location?.state?.id) {
        await fetchData();
      } else if (location?.state?.formData) {
        formik.setValues(location?.state?.formData);
        setLineItems(location?.state?.products);
      }
      await getNumber();
    };

    initialize();
    fetchData();
    return () => {
      formik.resetForm();
      setLineItems([
        {
          FirstName: "",
          LastName: "",
          Description: "",
          Name: "",
          Type: "",
          Unit: "",
          Attachment: "",
          CostPerUnit: "",
          Hourly: "",
          CostPerHour: "",
          Fixed: "",
          CostPerFixed: "",
          Square: "",
          CostPerSquare: "",
          Total: "",
          isNew: true,
          subTotal: "",
        },
      ]);
    };
  }, [tokenDecode]);

  const calculateSubTotal = () => {
    const Total = lineItems?.reduce(
      (sum, item) => sum + Number(item.Total || 0),
      0
    );
    return Total;
  };

  const subTotal = calculateSubTotal();
  const handleCahngeIds = (value) => {};

  const handleContractNumberChange = async () => {
    const enteredContractNumber = Number(formik?.values?.ContractNumber);
    const CompanyId =
      localStorage.getItem("CompanyId") || tokenDecode?.CompanyId;

    try {
      const res = await AxiosInstance.post(
        `/v1/contract/check_number/${CompanyId}`,
        {
          ContractNumber: enteredContractNumber,
        }
      );
      if (res?.data?.statusCode === 200) {
        setTimeout(() => {
          showToast.success("Contract number is valid and added successfully.");
        }, 500);
        setIsNumChange(false);
      } else if (res?.data?.statusCode === 203) {
        setTimeout(() => {
          showToast.error(
            "Contract number already exists. Please choose a different number."
          );
        }, 500);
        formik.setFieldValue("ContractNumber", "");
      } else {
        setTimeout(() => {
          showToast.error("Failed to check Contract number. Please try again.");
        }, 500);
      }
    } catch (error) {
      console.error(
        "Error checking Contract number: ",
        error?.response || error?.message
      );
      setTimeout(() => {
        showToast.error(
          "An error occurred while checking the Contract number."
        );
      }, 500);
    }
  };

  const discountAmount = formik?.values?.Discount
    ? (Number(formik?.values?.Discount) * subTotal) / 100
    : 0;
  const discountedTotal = Math.max(0, subTotal - discountAmount);
  const taxAmount = formik?.values?.Tax
    ? (Number(formik?.values?.Tax) * subTotal) / 100
    : 0;
  const Total = (discountedTotal + taxAmount)?.toFixed(2);

  const baseUrl = process.env.REACT_APP_BASE_API;

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleOutsideClick = () => {
    toggleDropdown();
  };

  const handleRemoveTeam = (team) => {
    setSelectedTeams((prevTeams) =>
      prevTeams.filter(
        (selectedTeam) => selectedTeam?.WorkerId !== team?.WorkerId
      )
    );

    setCheckedState((prevState) => {
      const updatedState = { ...prevState };
      delete updatedState[team?.WorkerId];
      return updatedState;
    });

    setAssignPersonId((prevIds) =>
      prevIds.filter((id) => id !== team?.WorkerId)
    );

    setIds((prevIds) => prevIds.filter((id) => id !== team?.WorkerId));
  };

  const handleTeamSelect = (event, team) => {
    if (event.target.checked) {
      setSelectedTeams((prevTeams) => [
        ...prevTeams,
        {
          FirstName: team?.FirstName,
          LastName: team?.LastName,
          EmailAddress: team?.EmailAddress,
          WorkerId: team?.WorkerId,
        },
      ]);

      setCheckedState((prevState) => ({
        ...prevState,
        [team?.WorkerId]: true,
      }));

      setIds((prevIds) => [...prevIds, team?.WorkerId]);
      setAssignPersonId((prevIds) => [...prevIds, team?.WorkerId]);
    } else {
      setSelectedTeams((prevTeams) =>
        prevTeams.filter(
          (selectedTeam) => selectedTeam?.WorkerId !== team?.WorkerId
        )
      );

      setCheckedState((prevState) => ({
        ...prevState,
        [team?.WorkerId]: false,
      }));

      setIds((prevIds) => prevIds.filter((id) => id !== team?.WorkerId));
      setAssignPersonId((prevIds) =>
        prevIds.filter((id) => id !== team?.WorkerId)
      );
    }
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };
  const fetchTeamData = async () => {
    setloader(true);
    try {
      const CompanyId =
        localStorage.getItem("CompanyId") || tokenDecode?.CompanyId;

      if (!CompanyId) {
        console.error("CompanyId is not found in localStorage or tokenDecode.");
        return;
      }

      const response = await AxiosInstance.get(`/v1/user/${CompanyId}`);

      if (response?.status === 200) {
        setTeamData(response?.data?.data);
      } else {
        console.error("Error fetching team data:", response);
      }
    } catch (error) {
      console.error("Error fetching team data:", error);
    } finally {
      setloader(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, [tokenDecode]);

  const formikTeam = useFormik({
    initialValues: {
      FirstName: "",
      LastName: "",
      EmailAddress: "",
      MobileNumber: "",
      WorkerId: "",
    },
    validationSchema: Yup.object({
      // FullName: Yup.string().required("Full Name is required"),
      EmailAddress: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      MobileNumber: Yup.string()
        .required("Phone number is required")
        .matches(
          /^\(\d{3}\) \d{3}-\d{4}$/,
          "Phone number must be in the format (xxx) xxx-xxxx"
        ),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const CompanyId =
          localStorage.getItem("CompanyId") || tokenDecode?.CompanyId;

        if (!CompanyId) {
          console.error("CompanyId is not found in localStorage");
          return;
        }
        const object = {
          ...values,
          CompanyId: CompanyId,
          WorkerId: values?.WorkerId,
          FullName: values?.FullName,
          EmailAddress: values?.EmailAddress,
          PhoneNumber: values?.PhoneNumber,
          AddedAt: new Date(),
          Role: "Worker",
        };

        const response = await AxiosInstance.post(`${baseUrl}/v1/user`, object);
        if (response?.data?.statusCode == "200") {
          showToast.success(response?.data?.message);
          toggleModal();
          fetchTeamData();
          formikTeam.resetForm();
        } else if (response?.data?.statusCode === 202) {
          showToast.error(response?.data?.message);
        }
      } catch (error) {
        if (error?.response) {
          console.error(
            "Server responded with an error:",
            error?.response?.data
          );
          console.log(error, "error");

          setTimeout(() => {
            showToast.error(
              error?.response?.data?.message || "Something went wrong!"
            );
          }, 500);
        } else if (error?.request) {
          console.error("No response received:", error?.request);
          setTimeout(() => {
            showToast.error(
              "No response from the server, please try again later."
            );
          }, 500);
        } else {
          console.error("Error during request setup:", error?.message);
          setTimeout(() => {
            showToast.error("Error occurred while sending request.");
          }, 500);
        }
      } finally {
        setLoading(false);
      }
    },
  });
  const formatPhoneNumber = (value) => {
    const PhoneNumber = value.replace(/[^\d]/g, "");
    const limitedPhoneNumber = PhoneNumber.slice(0, 10);
    const match = limitedPhoneNumber.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);

    if (match) {
      let formattedNumber = "";
      if (match[1].length >= 3) {
        formattedNumber = `(${match[1]}) `;
      } else {
        formattedNumber = match[1];
      }
      formattedNumber += match[2];
      if (match[3]) {
        formattedNumber += `-${match[3]}`;
      }

      return formattedNumber;
    }
    return limitedPhoneNumber;
  };
  const handlePhoneChange = (e) => {
    if (formikTeam?.values?.MobileNumber?.length > e.target.value?.length) {
      formikTeam?.setFieldValue("MobileNumber", e.target.value);
    } else {
      const formattedValue = formatPhoneNumber(e.target.value);
      formikTeam?.setFieldValue("MobileNumber", formattedValue);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (formik.dirty || lineItems.some((item) => item.isNew)) {
        const message =
          "You have unsaved changes. Are you sure you want to leave?";
        event.returnValue = message;
        return message;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [formik.dirty, lineItems]);

  return (
    <>
      <AddContractView
        lineItems={lineItems}
        isProperty={isProperty}
        setIsProperty={setIsProperty}
        setIsCustomer={setIsCustomer}
        isCustomer={isCustomer}
        setPropertyData={setPropertyData}
        mail={mail}
        startDate={startDate}
        setMail={setMail}
        customersData={customersData}
        propertyData={propertyData}
        formik={formik}
        CompanyName={CompanyName}
        handleSaveQuote={handleSaveQuote}
        toggle={toggle}
        dropdownOpen={dropdownOpen}
        setLoading={setLoading}
        loading={loading}
        Total={Total}
        taxAmount={taxAmount}
        showTax={showTax}
        setShowTax={setShowTax}
        showDiscount={showDiscount}
        contractData={contractData}
        setShowDiscount={setShowDiscount}
        discountAmount={discountAmount}
        deleteLineItem={deleteLineItem}
        subTotal={subTotal}
        addLineItem={addLineItem}
        showCosts={showCosts}
        setShowCosts={setShowCosts}
        setMenuIsOpen={setMenuIsOpen}
        menuIsOpen={menuIsOpen}
        handleSelectChange={handleSelectChange}
        setLineItems={setLineItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleCahngeIds={handleCahngeIds}
        selectedTeams={selectedTeams}
        setSelectedTeams={setSelectedTeams}
        isCalendarVisible={isCalendarVisible}
        setIsCalendarVisible={setIsCalendarVisible}
        isNumChange={isNumChange}
        setIsNumChange={setIsNumChange}
        handleContractNumberChange={handleContractNumberChange}
        setCustomersData={setCustomersData}
        toggleDropdown={toggleDropdown}
        isDropdownOpen={isDropdownOpen}
        handleOutsideClick={handleOutsideClick}
        teamData={teamData}
        setTeamData={setTeamData}
        checkedState={checkedState}
        setCheckedState={setCheckedState}
        handleRemoveTeam={handleRemoveTeam}
        handleTeamSelect={handleTeamSelect}
        isAddTeam={isAddTeam}
        toggleModal={toggleModal}
        isModalOpen={isModalOpen}
        ids={ids}
        setIds={setIds}
        setIsAddTeam={setIsAddTeam}
        formikTeam={formikTeam}
        handlePhoneChange={handlePhoneChange}
        loader={loader}
      />
    </>
  );
}

export default AddContract;

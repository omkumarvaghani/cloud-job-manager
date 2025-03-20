import React, { useEffect, useState } from "react";
import {
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  FormGroup,
} from "reactstrap";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import {
  Divider,
  ListItemText,
  MenuItem,
  Select,
  Grid,
  Typography,
} from "@mui/material";
import AxiosInstance from "../../../Views/AxiosInstance";
import { LoaderComponent } from "../../Icon/Index";
import BlueButton from "../../Button/BlueButton";
import {
  getCardType,
  getCardLogo,
  getCustomerVaultId,
  addRecurringCards,
  getRecurringCards,
  getCardDetails,
  updateRecurringCard,
} from "../../../plugins/ApiHandler";
import { getTokenizationKeyCustomer } from "../../../plugins/ApiHandler";
import { addTokenizationScript } from "../../../plugins/helpers";
import AddCardDetailsForm from "../../AdminViews/AddCardDetailsForm";
import { useLocation, useNavigate } from "react-router-dom";
import { handleAuth } from "../../Login/Auth";
import InputText from "../../InputFields/InputText";
import sendSwal from "../../Swal/sendSwal";
import showToast from "../../Toast/Toster";
import "./style.css";
import { width } from "@mui/system";

const RecurringPayment = ({
  isOpen,
  toggle,
  customersData,
  companyId,
  fetchCustomerData,
  recurringId,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loader, setLoader] = useState(true);
  const [customerData, setCustomerData] = useState([]);
  const [selectedReccuringCards, setSelectedReccuringCards] = useState([]);
  const handleSetCardDetails = async (item) => {
    try {
      const cardType = await getCardType(item.cc_bin, item.cc_type);
      const cardLogo = await getCardLogo(item.cc_type);

      return {
        billing_id: item["@attributes"].id,
        cc_number: item.cc_number,
        cc_exp: item.cc_exp,
        cc_type: item.cc_type,
        cc_bin: item.cc_bin,
        customer_vault_id: item.customer_vault_id,
        card_type: cardType,
        card_logo: cardLogo,
      };
    } catch (error) {
      console.error(error, "error in bin check");
      return {};
    }
  };

  const [tokenDecode, setTokenDecode] = useState({});

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

  const fetchAllCustomerData = async () => {
    setLoader(true);
    try {
      const recurrings = [];
      const customers = [];

      const promises = customersData.map(async (customer) => {
        const CustomerId = customer.CustomerId;

        try {
          const customerData = await getCustomerVaultId(CustomerId);
          const customer_vault_id = customerData.customer_vault_id;

          const cardDetails = await getCardDetails({
            CustomerId,
            type: "card",
            CompanyId: companyId,
          });

          const cards = [];
          const billingData = cardDetails?.data?.customer;

          if (!billingData) {
            customers.push({ ...customer, cards });
            return;
          }

          if (Array.isArray(billingData.billing)) {
            const extractedData = await Promise.all(
              billingData.billing.map((item) => handleSetCardDetails(item))
            );
            cards.push(...extractedData.filter((item) => item));
          } else if (billingData) {
            const extractedData = await handleSetCardDetails(
              billingData.billing
            );
            if (extractedData) cards.push(extractedData);
          }

          if (!cards.length) {
            recurrings.push({
              CustomerId: customer.CustomerId,
              customer_vault_id,
              CompanyId: companyId || "",
              recurrings: [
                { billing_id: "", amount: "", card_type: "", account_id: "" },
              ],
            });
            customers.push({ ...customer, cards });
            return;
          }

          customers.push({ ...customer, cards });

          if (recurringId) {
            const recurringData = await getRecurringCards(recurringId);

            if (recurringData && recurringData?.data) {
              recurrings.push({
                ...recurringData?.data,
                recurrings: [
                  {
                    billing_id: recurringData?.data.billing_id,
                    amount: recurringData?.data?.amount,
                    card_type: recurringData?.data?.card_type,
                    account_id: recurringData?.data?.account_id,
                    frequency: recurringData?.data?.frequency,
                    day_of_month: recurringData?.data?.day_of_month,
                    day_of_year: recurringData?.data?.day_of_year,
                    days_after_quarter: recurringData?.data?.days_after_quarter,
                    month: recurringData?.data?.month,
                    frequency_interval: recurringData?.data?.frequency_interval,
                  },
                ],
              });
            } else {
              recurrings.push({
                CustomerId: customer.CustomerId,
                customer_vault_id,
                CompanyId: companyId || "",
                recurrings: [
                  { billing_id: "", amount: "", card_type: "", account_id: "" },
                ],
              });
            }
          } else {
            recurrings.push({
              CustomerId: customer.CustomerId,
              customer_vault_id,
              CompanyId: companyId || "",
              recurrings: [
                { billing_id: "", amount: "", card_type: "", account_id: "" },
              ],
            });
          }
        } catch (customerError) {
          recurrings.push({
            CustomerId: customer.CustomerId,
            customer_vault_id: "",
            CompanyId: companyId || "",
            recurrings: [
              {
                billing_id: "",
                amount: "",
                card_type: "",
                account_id: "",
                date: "",
              },
            ],
          });
          customers.push({ ...customer, cards: [] });
          console.error(
            `Error processing customer ${CustomerId}: `,
            customerError
          );
        }
      });

      await Promise.all(promises);

      setCustomerData(customers);
      setSelectedReccuringCards(recurrings);
    } catch (error) {
      console.error("Error: ", error);
    } finally {
      setLoader(false);
    }
  };
  useEffect(() => {
    fetchAllCustomerData();
  }, [customersData, isOpen]);

  const [recAccounts, setRecAccounts] = useState([]);

  const fetchAccounts = async () => {
    if (companyId) {
      try {
        const res = await AxiosInstance.get(`/account/accounts/${companyId}`);
        if (res.data.statusCode === 200) {
          const filteredData2 = res.data.data.filter(
            (item) => item.account_type === "Asset"
          );
          setRecAccounts(filteredData2);
        } else if (res.data.statusCode === 201) {
          setRecAccounts();
        }
      } catch (error) {
        console.error("Error:", error.message);
      }
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [companyId]);

  const handleSelection = (selectedCard, customer, recurringIndex) => {
    const updatedRecurringCards = selectedReccuringCards?.map((t) => {
      if (t.CustomerId === customer.CustomerId) {
        const updatedRecurrings = t.recurrings.map((recurring, index) => {
          if (index === recurringIndex) {
            return {
              ...recurring,
              billing_id: selectedCard?.billing_id,
              card_type: selectedCard?.card_type,
            };
          }
          return recurring;
        });
        return { ...t, recurrings: updatedRecurrings };
      }
      return t;
    });

    setSelectedReccuringCards(updatedRecurringCards);
  };
  const CustomerDropDowns = ({ customer, value, recurringIndex }) => {
    const card = customer?.cards?.find((item) => item?.billing_id === value);

    return (
      <>
        <FormGroup className="d-flex flex-column">
          <label
            className="form-control-label fontstylerentr titleecolor fontfamilysty"
            htmlFor="input-unitadd"
            style={{
              fontWeight: "500",
              fontSize: "16px",
              textAlign: "left",
            }}
          >
            Choose Card *
          </label>

          <Select
            labelId="user-select-label"
            id="user-select"
            placeholder="jello"
            className="border-blue-color text-blue-color"
            value={card}
            onChange={(e) =>
              handleSelection(e.target.value, customer, recurringIndex)
            }
            displayEmpty
            renderValue={(selected) => {
              return selected?.cc_number || "Select Card";
            }}
            style={{ minWidth: "100%", height: "50px" }}
          >
            {isPublicKeyAvailable && (
              <MenuItem
                className="background-colorsty bgtextwhite"
                onClick={() => setModalShow(true)}
              >
                Add Card
              </MenuItem>
            )}
            {customer?.cards?.length > 0 ? (
              customer?.cards?.map((item) => (
                <MenuItem
                  key={item.billing_id}
                  value={item}
                  className="d-flex"
                  style={{ gap: "10px" }}
                >
                  <div className="d-flex">
                    <img src={item?.card_logo} width={30} />
                  </div>
                  <div className="d-flex flex-column w-100">
                    <ListItemText
                      primary={`${item?.cc_number || ""}`}
                      primaryTypographyProps={{ style: { fontSize: "12px" } }}
                    />
                    <div className="d-flex justify-content-between">
                      <ListItemText
                        primaryTypographyProps={{ style: { fontSize: "12px" } }}
                        primary={`${item?.card_type || ""}`}
                      />
                      <ListItemText
                        primaryTypographyProps={{ style: { fontSize: "12px" } }}
                        primary={`${item?.cc_exp || ""}`}
                      />
                    </div>
                  </div>
                </MenuItem>
              ))
            ) : (
              <MenuItem value="">No card added</MenuItem>
            )}
          </Select>
        </FormGroup>
      </>
    );
  };
  const handleSubmit = async () => {
    try {
      const dataToPost = selectedReccuringCards.flatMap((customer) =>
        customer.recurrings.map((recurring) => ({
          CompanyId: companyId,
          CustomerId: customer.CustomerId,
          customer_vault_id: customer.customer_vault_id,
          account_id: recurring.account_id,
          amount: recurring.amount,
          billing_id: recurring.billing_id,
          card_type: recurring.card_type,
          day_of_month: recurring.day_of_month,
          frequency: recurring.frequency,
          weekday: recurring.weekday,
          frequency_interval: recurring.frequency_interval,
          nextDueDate: recurring.nextDueDate,
          day_of_year: recurring.day_of_year,
          month: recurring.month,
          days_after_quarter: recurring.days_after_quarter,
          IsDelete: false,
        }))
      );
  
  
      if (dataToPost.every((item) => item.amount > 0 && item.billing_id)) {
        for (const data of dataToPost) {
          if (recurringId) {
            const response = await updateRecurringCard(recurringId, data);
          } else {
            const response = await addRecurringCards(data);
          }
        }
        fetchCustomerData();
        toggle();
        setSelectedReccuringCards([]);
      } else {
        showToast.error("Please fill in all required fields.");
      }
    } catch (error) {
      console.error("❌ Error during update:", error);
    }
  };
  
  

  const dueAmount =
    selectedReccuringCards?.reduce(
      (acc1, customer) =>
        acc1 +
        Number(
          customer?.recurrings?.reduce(
            (acc2, item) => acc2 + Number(item?.amount),
            0
          )
        ),
      0
    ) || 0;

  const [modalShow, setModalShow] = useState(false);
  const [scriptGenerating, setScriptGenerating] = useState(false);
  const [scriptError, setScriptError] = useState("");
  const [isPublicKeyAvailable, setIsPublicKeyAvailable] = useState(false);

  const getNmiKey = async (Company_Id) => {
    setScriptGenerating(true);
    setScriptError("");

    try {
      const keyResponse = await getTokenizationKeyCustomer(Company_Id);
      if (keyResponse?.PublicKey) {
        setIsPublicKeyAvailable(true);
      } else {
        setIsPublicKeyAvailable(false);
      }
      await addTokenizationScript(keyResponse?.PublicKey);
    } catch (error) {
      setScriptError(
        error ||
          "Failed to load the tokenization script. Make sure you have suitable internet connection."
      );
    } finally {
      setScriptGenerating(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const CompanyId = location?.state?.id;
      await getNmiKey(CompanyId);
    };
    fetchData();
  }, []);

  return (
    <>
      <Modal
        isOpen={isOpen}
        toggle={toggle}
        className="modal-dialog-centered  "
      >
        <Grid
          className="border-orange-color "
          style={{
            borderBottom: "5px solid",
            display: "flex",
            widows: "100%",
            justifyContent: "space-between",
            padding: "20px",
          }}
        >
          <Grid>
            <h2
              className="text-blue-color bottomLeaveup"
              style={{ fontSize: "15px" }}
            >
              Recurring Payment
            </h2>
          </Grid>
        </Grid>
        <Divider />
        <ModalBody style={{ height: "420px", overflowY: "auto" }}>
          {loader ? (
            <Grid
              className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5"
              style={{ justifyContent: "center", textAlign: "center" }}
            >
              <LoaderComponent height="50" width="50" loader={loader} />
            </Grid>
          ) : (
            customerData?.map((customer, index) => {
              const selectedCustomer = selectedReccuringCards?.find(
                (t) => customer.CustomerId === t.CustomerId
              );
              return (
                <div className="d-flex flex-column w-100 mt-1" key={index}>
                  {selectedCustomer?.recurrings?.map((recurring, i) => (
                    <>
                      <div
                        className="d-flex textcolorblue "
                        style={{ gap: "20px" }}
                        key={i}
                      >
                        <Grid style={{ width: "100%" }}>
                          <CustomerDropDowns
                            customer={customer}
                            value={recurring?.billing_id}
                            recurringIndex={i}
                          />
                          <Grid className="">
                            <Grid>
                              <label
                                className="form-control-label fontstylerentr titleecolor fontfamilysty d-flex flex-column"
                                htmlFor="input-recurring-frequency"
                                style={{
                                  fontWeight: "500",
                                  fontSize: "16px",
                                }}
                              >
                                Frequency *
                              </label>

                              <Select
                                labelId="recurrence-frequency-label"
                                id="recurrence-frequency"
                                value={recurring?.frequency || ""}
                                style={{ height: "50px", width: "100%" }}
                                className="text-blue-color"
                                onChange={(e) => {
                                  const updatedRecurrings = [
                                    ...selectedCustomer.recurrings,
                                  ];
                                  updatedRecurrings[i].frequency =
                                    e.target.value;
                                  setSelectedReccuringCards((prev) =>
                                    prev.map((t) =>
                                      t.CustomerId === customer.CustomerId
                                        ? {
                                            ...t,
                                            recurrings: updatedRecurrings,
                                          }
                                        : t
                                    )
                                  );
                                }}
                                displayEmpty
                                renderValue={(selected) =>
                                  selected || "Frequency"
                                }
                              >
                                <MenuItem value="Weekly">Weekly</MenuItem>
                                <MenuItem value="Every n Weeks">
                                  Every n weeks
                                </MenuItem>
                                <MenuItem value="Monthly">Monthly</MenuItem>
                                <MenuItem value="Every n Months">
                                  Every n months
                                </MenuItem>
                                <MenuItem value="Yearly">Yearly</MenuItem>
                                <MenuItem value="Quarterly">Quarterly</MenuItem>
                              </Select>
                            </Grid>

                            {/* Frequency Interval Input */}
                            {recurring?.frequency === "Every n Months" ||
                            recurring?.frequency === "Every n Weeks" ? (
                              <FormGroup className="d-flex flex-column">
                                <label
                                  className="d-flex flex-direction-column mt-2"
                                  htmlFor="input-n-value"
                                  style={{
                                    fontWeight: "500",
                                    fontSize: "16px",
                                  }}
                                >
                                  Every N *
                                </label>
                                <InputText
                                  value={recurring?.frequency_interval || ""}
                                  onChange={(e) => {
                                    let value = parseInt(e.target.value, 10);

                                    if (
                                      recurring?.frequency ===
                                        "Every n Weeks" &&
                                      value > 4
                                    ) {
                                      value = 4;
                                    } else if (
                                      recurring?.frequency ===
                                        "Every n Months" &&
                                      value > 12
                                    ) {
                                      value = 12;
                                    }

                                    if (value < 1 || isNaN(value)) {
                                      value = "";
                                    }

                                    const updatedRecurrings = [
                                      ...selectedCustomer.recurrings,
                                    ];
                                    updatedRecurrings[i].frequency_interval =
                                      value;

                                    setSelectedReccuringCards((prev) =>
                                      prev.map((t) =>
                                        t.CustomerId === customer.CustomerId
                                          ? {
                                              ...t,
                                              recurrings: updatedRecurrings,
                                            }
                                          : t
                                      )
                                    );
                                  }}
                                  name="frequency_interval"
                                  placeholder="Enter number of weeks/months"
                                  type="number"
                                  min="1"
                                  max={
                                    recurring?.frequency === "Every n Weeks"
                                      ? "4"
                                      : "12"
                                  }
                                  className="text-blue-color"
                                />
                              </FormGroup>
                            ) : null}

                            {/* Day of the Month (Monthly, Every n Months) */}
                            {(recurring?.frequency === "Monthly" ||
                              recurring?.frequency === "Every n Months") && (
                              <Grid>
                                <label
                                  className="form-control-label fontstylerentr titleecolor fontfamilysty"
                                  htmlFor="input-day-of-month"
                                  style={{
                                    fontWeight: "500",
                                    fontSize: "16px",
                                  }}
                                >
                                  Day of the Month *
                                </label>
                                <InputText
                                  value={recurring?.day_of_month || ""}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (
                                      value === "" ||
                                      (value >= 1 && value <= 28)
                                    ) {
                                      const updatedRecurrings = [
                                        ...selectedCustomer.recurrings,
                                      ];
                                      updatedRecurrings[i].day_of_month = value;
                                      setSelectedReccuringCards((prev) =>
                                        prev.map((t) =>
                                          t.CustomerId === customer.CustomerId
                                            ? {
                                                ...t,
                                                recurrings: updatedRecurrings,
                                              }
                                            : t
                                        )
                                      );
                                    }
                                  }}
                                  name="day_of_month"
                                  placeholder="Enter day of the month (1-28)"
                                  type="number"
                                  min="1"
                                  max="28"
                                  className="text-blue-color"
                                  style={{ width: "100%" }}
                                />
                              </Grid>
                            )}

                            {/* Weekday (Weekly, Every n Weeks) */}
                            {(recurring?.frequency === "Weekly" ||
                              recurring?.frequency === "Every n Weeks") && (
                              <Grid>
                                <label
                                  className="form-control-label mt-2 fontstylerentr titleecolor fontfamilysty"
                                  htmlFor="input-weekday"
                                  style={{
                                    fontWeight: "500",
                                    fontSize: "16px",
                                    textAlign: "left",
                                  }}
                                >
                                  Day of the Week *
                                </label>
                                <Select
                                  labelId="recurrence-weekday-label"
                                  id="recurrence-weekday"
                                  value={recurring?.weekday || ""}
                                  style={{ height: "50px", width: "100%" }}
                                  className="text-blue-color"
                                  onChange={(e) => {
                                    const updatedRecurrings = [
                                      ...selectedCustomer.recurrings,
                                    ];
                                    updatedRecurrings[i].weekday =
                                      e.target.value;
                                    setSelectedReccuringCards((prev) =>
                                      prev.map((t) =>
                                        t.CustomerId === customer.CustomerId
                                          ? {
                                              ...t,
                                              recurrings: updatedRecurrings,
                                            }
                                          : t
                                      )
                                    );
                                  }}
                                  displayEmpty
                                  renderValue={(selected) =>
                                    selected || "Select Day"
                                  }
                                >
                                  {[
                                    "Sunday",
                                    "Monday",
                                    "Tuesday",
                                    "Wednesday",
                                    "Thursday",
                                    "Friday",
                                    "Saturday",
                                  ].map((day) => (
                                    <MenuItem key={day} value={day}>
                                      {day}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </Grid>
                            )}

                            {/* Day of the Year (Yearly) */}
                            {recurring?.frequency === "Yearly" && (
                              <>
                                <Grid>
                                  <label
                                    className="form-control-label fontstylerentr titleecolor fontfamilysty"
                                    htmlFor="input-day-of-year"
                                    style={{
                                      fontWeight: "500",
                                      fontSize: "16px",
                                      textAlign: "left",
                                    }}
                                  >
                                    Day of the Month *
                                  </label>
                                  <InputText
                                    value={recurring?.day_of_year || ""}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      if (
                                        value === "" ||
                                        (value >= 1 && value <= 365)
                                      ) {
                                        const updatedRecurrings = [
                                          ...selectedCustomer.recurrings,
                                        ];
                                        updatedRecurrings[i].day_of_year =
                                          value;
                                        setSelectedReccuringCards((prev) =>
                                          prev.map((t) =>
                                            t.CustomerId === customer.CustomerId
                                              ? {
                                                  ...t,
                                                  recurrings: updatedRecurrings,
                                                }
                                              : t
                                          )
                                        );
                                      }
                                    }}
                                    name="day_of_year"
                                    placeholder="Enter day of the year (1-365)"
                                    type="number"
                                    min="1"
                                    max="365"
                                    style={{
                                      marginLeft: "20px",
                                    }}
                                    className="text-blue-color"
                                  />
                                </Grid>
                                <Grid>
                                  <label
                                    className="form-control-label fontstylerentr titleecolor fontfamilysty"
                                    htmlFor="input-month"
                                    style={{
                                      fontWeight: "500",
                                      fontSize: "16px",
                                      textAlign: "left",
                                    }}
                                  >
                                    Month *
                                  </label>
                                  <InputText
                                    value={recurring?.month || ""}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      if (
                                        value === "" ||
                                        (value >= 1 && value <= 12)
                                      ) {
                                        const updatedRecurrings = [
                                          ...selectedCustomer.recurrings,
                                        ];
                                        updatedRecurrings[i].month = value;
                                        setSelectedReccuringCards((prev) =>
                                          prev.map((t) =>
                                            t.CustomerId === customer.CustomerId
                                              ? {
                                                  ...t,
                                                  recurrings: updatedRecurrings,
                                                }
                                              : t
                                          )
                                        );
                                      }
                                    }}
                                    name="month"
                                    placeholder="Enter month (1-12)"
                                    type="number"
                                    min="1"
                                    max="12"
                                    style={{
                                      marginLeft: "20px",
                                    }}
                                    className="text-blue-color"
                                  />
                                </Grid>
                              </>
                            )}

                            {/* Days after Quarter (Quarterly) */}
                            {recurring?.frequency === "Quarterly" && (
                              <Grid>
                                <label
                                  className="form-control-label fontstylerentr mt-2 titleecolor fontfamilysty"
                                  htmlFor="input-days-after-quarter"
                                  style={{
                                    fontWeight: "500",
                                    fontSize: "16px",
                                  }}
                                >
                                  Days Quarter Start *
                                </label>
                                <InputText
                                  value={recurring?.days_after_quarter || ""}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (
                                      value === "" ||
                                      (value >= 0 && value <= 90)
                                    ) {
                                      const updatedRecurrings = [
                                        ...selectedCustomer.recurrings,
                                      ];
                                      updatedRecurrings[i].days_after_quarter =
                                        value;
                                      setSelectedReccuringCards((prev) =>
                                        prev.map((t) =>
                                          t.CustomerId === customer.CustomerId
                                            ? {
                                                ...t,
                                                recurrings: updatedRecurrings,
                                              }
                                            : t
                                        )
                                      );
                                    }
                                  }}
                                  name="days_after_quarter"
                                  placeholder="Enter days after quarter start"
                                  type="number"
                                  min="0"
                                  max="90"
                                  style={{ width: "100%" }}
                                  className="text-blue-color"
                                />
                              </Grid>
                            )}
                          </Grid>

                          <Grid>
                            <label
                              className="form-control-label fontstylerentr mt-2 titleecolor mx-0 fontfamilysty"
                              htmlFor="input-unitadd"
                              style={{
                                fontWeight: "500",
                                fontSize: "16px",
                                textAlign: "left",
                              }}
                            >
                              Account *
                            </label>
                            <Select
                              labelId="user-select-label"
                              id="user-select-account"
                              value={recurring?.account_id || ""}
                              style={{ height: "50px", width: "100%" }}
                              className="text-blue-color"
                              onChange={(e) => {
                                const updatedRecurrings = [
                                  ...selectedCustomer.recurrings,
                                ];
                                updatedRecurrings[i].account_id =
                                  e.target.value;
                                setSelectedReccuringCards((prev) =>
                                  prev.map((t) =>
                                    t.CustomerId === customer.CustomerId
                                      ? { ...t, recurrings: updatedRecurrings }
                                      : t
                                  )
                                );
                              }}
                              displayEmpty
                              renderValue={(selected) => {
                                const selectedAccount = recAccounts?.find(
                                  (item) => item.account_id === selected
                                );
                                return selectedAccount
                                  ? selectedAccount.account_name
                                  : "Account";
                              }}
                              MenuProps={{
                                PaperProps: {
                                  style: {
                                    maxHeight: 150,
                                  },
                                },
                              }}
                            >
                              {recAccounts?.map((item) => (
                                <MenuItem
                                  key={item.account_id}
                                  value={item.account_id}
                                >
                                  {item.account_name}
                                </MenuItem>
                              ))}
                            </Select>
                          </Grid>
                          <Grid>
                            <label
                              className="form-control-label mt-2 fontstylerentr titleecolor fontfamilysty"
                              htmlFor="input-unitadd"
                              style={{
                                fontWeight: "500",
                                fontSize: "16px",
                                textAlign: "left",
                              }}
                            >
                              Amount *
                            </label>
                            <InputText
                              value={`$${(
                                parseFloat(recurring?.amount) || 0
                              ).toFixed(2)}`}
                              onChange={(e) => {
                                const valueWithoutDollar =
                                  e.target.value.replace("$", "");

                                if (/^\d*\.?\d*$/.test(valueWithoutDollar)) {
                                  const updatedRecurrings = [
                                    ...selectedCustomer.recurrings,
                                  ];
                                  updatedRecurrings[i].amount =
                                    valueWithoutDollar;

                                  setSelectedReccuringCards((prev) =>
                                    prev.map((t) =>
                                      t.CustomerId === customer.CustomerId
                                        ? {
                                            ...t,
                                            recurrings: updatedRecurrings,
                                          }
                                        : t
                                    )
                                  );
                                }
                              }}
                              name="amount"
                              placeholder="Enter for service rendered"
                              label="amount"
                              type="text"
                              className="text-blue-color w-100 "
                              required
                              style={{
                                height: "50px",
                                textAlign: "left",
                                width: "100%",
                              }}
                              isRight={true}
                            />
                          </Grid>
                        </Grid>
                      </div>
                      {recurring?.nextDueDate && (
                        <>
                          <label
                            className="form-control-label fontstylerentr mt-2 titleecolor fontfamilysty d-flex flex-column"
                            htmlFor="input-next-due-date"
                            style={{
                              fontWeight: "500",
                              fontSize: "16px",
                              paddingBottom: "10px",
                            }}
                          >
                            Payment Deduct On :
                            {new Date(
                              recurring.nextDueDate
                            ).toLocaleDateString()}
                          </label>
                        </>
                      )}
                    </>
                  ))}
                </div>
              );
            })
          )}
        </ModalBody>
        <ModalFooter>
          <div
            style={{ display: "flex", gap: "10px", alignItems: "center" }}
            className="foterAmountBtm"
          >
            <div
              className="BtnGropupFooter"
              style={{ display: "flex", gap: "5px" }}
            >
              <BlueButton
                onClick={() => {
                  toggle();
                  setSelectedReccuringCards([]);
                }}
                variant="outline"
                label="Cancel"
              />
              <BlueButton
                onClick={async () => {
                  sendSwal().then(async (deleteReason) => {
                    if (deleteReason) {
                      try {
                        const response = await AxiosInstance.put(
                          `/recurring-payment/disable-cards/${customerData[0].CustomerId}`
                        );
                        if (response.data.statusCode === 200) {
                          await fetchCustomerData();
                          toggle();
                          setSelectedReccuringCards([]);
                        } else {
                          await fetchCustomerData();
                          setSelectedReccuringCards([]);
                        }
                      } catch (error) {
                        console.error("Error: ", error);
                      }
                    } else {
                      showToast.success("Recurring payment is safe!", {
                        position: "top-center",
                        autoClose: 1000,
                      });
                    }
                  });
                }}
                label="Disable"
              />

              {/* <BlueButton
                id="payButton"
                type="submit"
                label="Save"
                disabled={
                  !selectedReccuringCards?.every((customer) =>
                    customer?.recurrings?.every((item) =>
                      Object.entries(item).every(([key, value]) =>
                        key === "amount" ? value > 0 : value
                      )
                    )
                  )
                }
                onClick={handleSubmit}
              /> */}
              <BlueButton
                id="payButton"
                type="submit"
                label="Save"
                onClick={handleSubmit}
              />
            </div>
          </div>
        </ModalFooter>
      </Modal>
      <AddCardDetailsForm
        onHide={() => setModalShow(false)}
        show={modalShow}
        scriptGenerating={scriptGenerating}
        scriptError={scriptError}
        CustomerId={location?.state?.id}
        fetchData={fetchAllCustomerData}
        CompanyId={tokenDecode?.companyId}
      />
    </>
  );
};

export default RecurringPayment;

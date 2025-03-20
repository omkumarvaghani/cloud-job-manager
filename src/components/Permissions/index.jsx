import AxiosInstance from "../../Views/AxiosInstance";
import React, { useEffect, useState } from "react";
import { Card, Input, Label } from "reactstrap";
import PermissionBox from "./PermissionBox";
import "./style.css";
import { Grid, Typography } from "@mui/material";
const defaultPermission = {
  Title: "Limited worker",
  Description:
    " Can view their schedule, mark work complete, and track their time",
  Schedule: {
    ViewTheirOwnSchedule: false,
    ViewAndCompleteTheirOwnSchedule: false,
    EditTheirOwnSchedule: false,
    EditEveryonesSchedule: false,
    EditAndDeleteEveryonesSchedule: false,
  },
  TimeTrackingAndTimesheets: {
    ViewAndRecordTheirOwn: false,
    ViewRecordAndEditTheirOwn: false,
    ViewRecordAndEditEveryones: false,
  },
  Notes: {
    ViewNotesOnJobsAndVisitsOnly: false,
    ViewAllNotes: false,
    ViewAndEditAll: false,
    ViewEditAndDeleteAll: false,
  },
  Expenses: {
    ViewRecordAndEditTheirOwn: false,
    ViewRecordAndEditEveryones: false,
  },
  ShowPricing: {
    AllowsEditingOfQuotesInvoicesAndLineItemsOnJobs: false,
  },
  CustomersProperties: {
    ViewCustomerNameAndAddressOnly: false,
    ViewFullCustomerAndPropertyInfo: false,
    ViewAndEditFullCustomerAndPropertyInfo: false,
    ViewEditAndDeleteFullCustomerAndPropertyInfo: false,
  },
  Quotes: {
    ViewOnly: false,
    ViewCreateAndEdit: false,
    ViewCreateEditAndDelete: false,
  },
  Contract: {
    ViewOnly: false,
    ViewCreateAndEdit: false,
    ViewCreateEditAndDelete: false,
  },
  Invoice: {
    ViewOnly: false,
    ViewCreateAndEdit: false,
    ViewCreateEditAndDelete: false,
  },
  Reports: {
    UsersWillOnlyBeAbleToSeeReportsAvailableToThemBasedOnTheirOtherPermissions: false,
  },
};

const deepEqual = (obj1, obj2) => {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};

const Permissions = ({ data, setData }) => {
  const baseUrl = process.env.REACT_APP_BASE_API;

  const [permissions, setPermissions] = useState([]);
  const [selectedPermission, setSelectedPermission] = useState(
    data || defaultPermission
  );
  const [isCustomChecked, setIsCustomChecked] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await AxiosInstance.get(`${baseUrl}/permissionsteps/get`);
        const permissionData = res.data.data;
        const permissionsData = permissionData.map((item) => {
          const result = {
            Title: item?.Title,
            Description: item?.Description,
          };

          for (const [key, value] of Object.entries(item.permissions)) {
            if (!result[key]) {
              result[key] = {};
            }
            result[key] = value;
          }
          return result;
        });
        setPermissions(permissionsData);

        if (!data) {
          setData(permissionsData[0]);
          setSelectedPermission(permissionsData[0]);
        }
      } catch (error) {
        console.error("Error: ", error.message);
      }
    };
    fetchData();
  }, [baseUrl, setData]);
  const handleChange = (item, isChecked) => {
    if (isChecked) {
      setSelectedPermission(item);
      setData(item);
      setIsCustomChecked(false);
    }
  };

  useEffect(() => {
    if (
      !permissions.find((item) =>
        deepEqual(
          { ...selectedPermission, Title: "", Description: "" },
          { ...item, Title: "", Description: "" }
        )
      )
    ) {
      setData({
        ...selectedPermission,
        Title: "Custom",
        Description: "",
      });
      setIsCustomChecked(true);
    } else {
      setData(() =>
        permissions.find((item) =>
          deepEqual(
            { ...selectedPermission, Title: "", Description: "" },
            { ...item, Title: "", Description: "" }
          )
        )
      );
    }
  }, [selectedPermission, permissions, setData]);
  
  return (
    <Grid>
      <Card
        style={{
          padding: "40px",
          marginTop: "10px",
          borderRadius: "20px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        }}
      >
        <Typography
          className="text-blue-color adminPermissionHead"
          style={{ fontWeight: 700, fontSize: "30px" }}
        >
          Permissions
        </Typography>
        <Typography
          className="text-blue-color mb-2 heading1 adminPermissionHead"
          style={{ fontWeight: 700, fontSize: "22px" }}
        >
          Preset Permission Levels
        </Typography>
        <Typography
          className="text-blue-color mb-2 text1 permissionPrefered"
          style={{ fontSize: "14px" }}
        >
          Start with a predefined permission setting and modify it according to
          your needs.
        </Typography>
        <Grid
          className="adminPemissionList"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "10px",
          }}
        >
          {permissions.length > 0 &&
            permissions.map((item) => (
              <Grid key={item.Title} className="d-flex gap-2">
                <Input
                  type="checkbox"
                  className="border-blue-color checkBoxPermission"
                  style={{ height: "15px", width: "15px", marginTop: "6px" }}
                  checked={
                    deepEqual(item, selectedPermission) && !isCustomChecked
                  }
                  onChange={(e) => handleChange(item, e.target.checked)}
                />
                <Label check className="ml-2">
                  <Typography
                    className="text-blue-color permissionTitleTag"
                    style={{ fontSize: "14px" }}
                  >
                    {item.Title || "Title not available"}
                  </Typography>
                  <Typography
                    style={{ fontSize: "10px", color: "rgba(6, 49, 100, 50%)" }}
                    className="permissionTitleTag"
                  >
                    {item.Description || "Description not available"}
                  </Typography>
                </Label>
              </Grid>
            ))}
          <Grid className="d-flex gap-2">
            <Input
              type="checkbox"
              className="border-blue-color"
              style={{
                height: "15px",
                width: "15px",
                marginTop: "3px",
                cursor: "pointer",
              }}
              checked={isCustomChecked}
              onChange={(e) => {
                const isChecked = e.target.checked;
                setIsCustomChecked(isChecked);
                if (isChecked) {
                  setSelectedPermission(defaultPermission);
                  setData(defaultPermission);
                } else {
                  setSelectedPermission(permissions[0] || {});
                  setData(permissions[0] || {});
                }
              }}
            />
            <Label check className="ml-2">
              <Typography
                className="text-blue-color"
                style={{ fontSize: "14px" }}
              >
                Custom
              </Typography>
            </Label>
          </Grid>
        </Grid>
        {selectedPermission &&
          Object.entries(selectedPermission).map(
            ([key, value], index) =>
              key !== "Title" &&
              key !== "Description" && (
                <PermissionBox
                  key={index}
                  option={key}
                  optionValue={value}
                  data={selectedPermission}
                  setData={setSelectedPermission}
                />
              )
          )}
      </Card>
    </Grid>
  );
};

export default Permissions;

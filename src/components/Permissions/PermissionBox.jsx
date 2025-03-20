import React from "react";
import { FormGroup, Input, Label } from "reactstrap";
import { Grid, Typography } from "@mui/material";
const PermissionBox = ({ option, optionValue, data, setData }) => {
  const isSwitched =
    data && data[option]
      ? Object.entries(data[option]).every(([key, value]) => {
          return !value;
        })
      : false;

  const handleSwitchChange = (e) => {
    const isChecked = e.target.checked;

    let datas;
    if (data && data[option]) {
      if (isChecked) {
        const entries = Object.entries(data[option]);
        datas = entries.map(([key, value], index) => ({
          [key]: index === 0 ? true : false,
        }));
      } else {
        datas = Object.entries(data[option]).map(([key, value]) => ({
          [key]: false,
        }));
      }
    } else {
      console.error("data[option] is undefined or null");
      return;
    }

    const result = datas.reduce((acc, item) => {
      const key = Object.keys(item)[0];
      acc[key] = item[key];
      return acc;
    }, {});

    const updatedData = {
      ...data,
      [option]: result,
      Title: "Custome",
      Description: "",
    };

    setData(updatedData);
  };

  return (
    <Grid>
      <hr />
      <Grid
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          className="text-blue-color my-2 heading1"
          style={{ fontWeight: 700, fontSize: "22px" }}
        >
          {option.split(/(?=[A-Z])/).join(" ")}
        </Typography>
        <FormGroup switch>
          <Input
            type="switch"
            checked={!isSwitched}
            style={{ cursor: "pointer" }}
            onChange={handleSwitchChange}
          />
        </FormGroup>
      </Grid>
      {!isSwitched && (
        <Grid>
          {optionValue &&
            data &&
            data[option] &&
            Object.entries(optionValue).map(([key, value]) => (
              <Grid className="d-flex gap-2" key={key}>
                <Input
                  type="checkbox"
                  className="border-blue-color"
                  style={{
                    height: "15px",
                    width: "15px",
                    marginTop: "7px",
                    cursor: "pointer",
                  }}
                  name={key}
                  value="Time1"
                  checked={data[option][key] || false}
                  onChange={(e) => {
                    const { name, checked } = e.target;
                    setData((prevData) => ({
                      ...prevData,
                      [option]: {
                        ...Object.keys(prevData[option] || {}).reduce(
                          (acc, currKey) => {
                            acc[currKey] = currKey === name ? checked : false;
                            return acc;
                          },
                          {}
                        ),
                      },
                    }));
                  }}
                />
                <Label check className="ml-2 my-1">
                  <Typography
                    className="text-blue-color"
                    style={{ fontSize: "14px" }}
                  >
                    {key.split(/(?=[A-Z])/).join(" ")}
                  </Typography>
                </Label>
              </Grid>
            ))}
        </Grid>
      )}
    </Grid>
  );
};

export default PermissionBox;

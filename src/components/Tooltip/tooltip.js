import React from 'react'
import { Box, Grid, Menu, MenuItem, Tooltip,IconButton } from "@mui/material";
import { Info } from "@mui/icons-material";

function tooltip() {
  return (
  <Grid>
          <Tooltip
                title={
                  <Box style={{ fontSize: "12px",alignItems: "center",
                    position: "relative", }}>
                    <ul style={{ paddingLeft: "20px", margin: 0 }}>
                      <li>At least one uppercase letter (A-Z).</li>
                      <li>At least one lowercase letter (a-z).</li>
                      <li>At least one number (0-9).</li>
                      <li>
                        At least one special character (e.g., @, #, $, etc.).
                      </li>
                      <li>Password must be at least 12 characters long.</li>
                      <li>
                        No continuous alphabetical characters (e.g., abcd) or
                        continuous numerical characters (e.g., 1234).
                      </li>
                      <li>
                        Avoid strictly sequential patterns (e.g., Ak12345678!).
                      </li>
                      <li>
                        Don't use birthdays, names, addresses, or other personal
                        information.
                      </li>
                    </ul>
                  </Box>
                }
                placement="bottom"
                arrow
              >
                <IconButton>
                  <Info
                    style={{
                      height: "20px",
                      width: "20px",
                      color: "#152B51",
                      alignItems: "center",
                      position: "relative",
                    }}
                  />
                </IconButton>
              </Tooltip>
  </Grid>
  )
}

export default tooltip
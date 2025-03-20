import * as React from "react";
import Box from "@mui/material/Box";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { useNavigate, useParams } from "react-router-dom";
import { Drawer } from "@mui/material";
import { Grid } from "@mui/material";


export default function CombinedComponent() {
  const navigate = useNavigate();
  const { companyName } = useParams();

  const [state, setState] = React.useState({
    top: false,
  });

  const [isOpenDropDown, setIsOpenDropDown] = React.useState(false); 
  const toggleDrawer = (open) => (event) => {
    if (
      event &&
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setState({ top: open });
  };

  const toggleDropDown = () => setIsOpenDropDown(!isOpenDropDown); 

  const myDrawer = [
    {
      name: "Materials & Labor",
      link: `/${companyName}/materials&labor`,
    },
  ];
  const list = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
      
    >
      <List>
        {myDrawer.map((text, index) => (
          <ListItem
            key={text}
            disablePadding
            onClick={() => navigate(text.link)}
          >
            <ListItemButton>
              <ListItemText primary={text.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Grid >
      <Button onClick={toggleDrawer(true)}>Setting</Button>
      <SwipeableDrawer
        anchor="top"
        open={state.top}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
      >
        {list}
      </SwipeableDrawer>
  
    </Grid>
  );
}
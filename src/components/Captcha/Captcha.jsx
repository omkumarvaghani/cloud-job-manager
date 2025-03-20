import React, { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { Grid } from "@mui/material";
import { Row, Col } from "react-bootstrap"; 
import BlueButton from '../Button/BlueButton';


const YourFormComponent = () => {
  const [captchaValue, setCaptchaValue] = useState(null);
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);

  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);
    if (value) {
      setIsCaptchaValid(true);  
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isCaptchaValid) {
    } else {
      alert("Please complete the CAPTCHA.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid>
        <label>Your Name</label>
        <input type="text" name="name" required />
      </Grid>

      <Grid>
        <label>Your Email</label>
        <input type="email" name="email" required />
      </Grid>

      <Grid>
        <ReCAPTCHA
          sitekey="YOUR_GOOGLE_RECAPTCHA_SITE_KEY"
          onChange={handleCaptchaChange}
        />
      </Grid>

      <BlueButton type="submit" disabled={!isCaptchaValid} label="Submit" />
    </form>
  );
};

export default YourFormComponent;

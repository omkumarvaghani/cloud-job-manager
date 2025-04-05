const {
  createResetToken,
  verifyResetToken,
  decryptData,
  encryptData,
} = require("../../../middleware/authMiddleware");
const User = require("../../../models/User/User");
const { handleTemplate } = require("./templateController");

exports.forgetPaswordMail = async (req, res) => {
  try {
    const { EmailAddress } = req.body;

    if (!EmailAddress) {
      return res.status(400).json({ message: "Email address is required" });
    }

    let user = await User.findOne({
      EmailAddress: EmailAddress,
      IsDelete: false,
    });

    if (!user) {
      return res.status(404).json({
        message: "No user found with the provided email address",
      });
    }

    const token = await createResetToken({ EmailAddress });
    const url = `https://app.cloudjobmanager.com/auth/reset-password?token=${token}`;

    const defaultBody = `
        <div style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #ffffff;">
          <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 20px auto; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border: 1px solid #e88c44;">
            <tr>
              <td style="padding: 20px 0; text-align: center; background-color: #063164; border-bottom: 1px solid #e88c44;">
                <div style="display: inline-block; padding: 20px; background-color: white; border-radius: 12px">
                  <img src="https://app.cloudjobmanager.com/cdn/upload/20250213103016_site-logo2.png" alt="CloudJobManager Logo" style="width: 160px; max-width: 100%; display: block; margin: auto;" />
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px; text-align: center; color: #333333; background-color: #ffffff;">
                <h2 style="font-size: 25px; font-weight: 700; color: #063164; margin-bottom: 20px; letter-spacing: 1px;">Reset Your Password</h2>
                <p style="font-size: 16px; color: #666666; line-height: 1.6; margin-bottom: 20px;">
                  Dear Sir/Ma'am,<br>
                  We received a request to reset the password for your CloudJobManager account. Please click the button below to proceed. If you did not request this, please disregard this email. The link will expire in 4 hours.
                </p>
                <a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #e88c44; color: #ffffff; font-size: 15px; font-weight: 500; text-decoration: none; border-radius: 50px; text-transform: uppercase; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: all 0.3s ease;">Reset Your Password</a>
                <p style="font-size: 14px; color: #888888; margin-top: 30px;">If you have any questions or concerns, please contact us at <a href="mailto:support@cloudjobmanager.com" style="color: #063164; text-decoration: none;">support@cloudjobmanager.com</a>.</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px 20px; text-align: center; font-size: 12px; color: #888888; background-color: #f4f4f7; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
                CloudJobManager, Inc. | All rights reserved.<br>
                <a href="#" style="color: #e88c44; text-decoration: none;">Unsubscribe</a> if you no longer wish to receive these emails.
              </td>
            </tr>
          </table>
        </div>`;

    const data = [
      {
        EmailAddress: EmailAddress || "",
        Url: url || "",
      },
    ];

    const emailStatus = await handleTemplate(
      "Reset Password",
      user.CompanyId || "",
      data,
      [],
      "Reset Your Password - CloudJobManager",
      defaultBody,
      user.CustomerId || ""
    );
    console.log(emailStatus, "emailStatus");

    return res.json({
      statusCode: 200,
      message: "Password reset email sent successfully",
      emailStatus,
    });
  } catch (error) {
    console.error("Error in resetpasswordmail API:", error.message);
    return res.status(500).json({
      statusCode: 500,
      message: "An error occurred while sending the email",
      error: error.message,
    });
  }
};

exports.checkTokenStatus = async (req, res, next) => {
  try {
    const { token } = req.params;
    // const expirationTimestamp = tokenExpirationMap.get(token);
    const verify = await verifyResetToken(token);

    if (verify.status) {
      return res.json({ expired: false });
    } else {
      return res.json({ expired: true });
    }
  } catch (error) {
    console.error("Error checking token status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateForgetPassword = async (req, res) => {
  try {
    const encryptmail = req.params.mail;
    const verify = await verifyResetToken(encryptmail);
    console.log(verify, "verify");

    if (!verify.status) {
      return res.status(401).json({
        message: "Token expired. Please request a new password reset email.",
      });
    }

    const email = verify.data.EmailAddress;
    const newPassword = req.body.Password;

    if (!newPassword) {
      return res.status(400).json({
        message: "New password is required.",
      });
    }

    let user = await User.findOne({
      EmailAddress: email,
      IsDelete: false,
    });

    if (!user) {
      return res.status(404).json({
        message: "No email found",
      });
    }

    const isSamePassword = await decryptData(newPassword, user.Password);
    if (isSamePassword) {
      return res.status(401).json({
        message: "New password cannot be the same as the old password.",
      });
    }

    const hashConvert = await encryptData(newPassword);
    await user.updateOne({ $set: { Password: hashConvert } });

    return res.status(200).json({
      data: user,
      url: "/auth/login",
      message: "Password Updated Successfully",
    });
  } catch (err) {
    console.log("Update Password Error:", err);
    return res.status(500).json({
      message: err.message,
    });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const encryptmail = req.params.mail;
    const verify = await verifyResetToken(encryptmail);

    if (!verify.status) {
      return res.status(401).json({
        message: "Token expired. Please request a new password reset email.",
      });
    }

    const email = verify.data.EmailAddress;
    const newPassword = req.body.Password;

    if (!newPassword) {
      return res.status(400).json({
        message: "New password is required.",
      });
    }

    const user = await User.findOne({
      EmailAddress: email,
      IsDelete: false,
    });
    console.log(user, "user");

    if (!user) {
      return res.status(404).json({
        message: "No user found with the provided email address.",
      });
    }

    if (user.Password) {
      const isSamePassword = await decryptData(newPassword, user.Password);
      console.log(isSamePassword, "isSamePassword");

      if (isSamePassword) {
        return res.status(401).json({
          message: "New password cannot be the same as the old password.",
        });
      }
    }

    const hashConvert = await encryptData(newPassword);
    console.log(hashConvert, "hashConvert");
    await user.updateOne({ $set: { Password: hashConvert } });

    return res.status(200).json({
      data: user,
      url: "/auth/login",
      message: user.Password
        ? "Password Updated Successfully"
        : "Password Set Successfully",
    });
  } catch (err) {
    console.error("Update Password Error:", err);
    return res.status(500).json({
      message: err.message,
    });
  }
};

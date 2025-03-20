const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const getAttachments = (fileNames) => {
  if (!Array.isArray(fileNames)) {
    console.error("Expected fileNames to be an array, received:", fileNames);
    return [];
  }

  return fileNames
    .filter((fileName) => fileName)
    .map((fileName) => {
      const filePath = path.join(__dirname, "../../cdn/files/", fileName);
      if (fs.existsSync(filePath)) {
        return {
          filename: fileName,
          path: filePath,
        };
      } else {
        console.error(`File not found: ${filePath}`);
        return null;
      }
    })
    .filter(Boolean);
};

async function sendWelcomeEmail(
  toEmail,
  subject,
  htmlContent,
  fileNames,
  EmailId,
  host,
  port,
  secure,
  user,
  pass,
  from_email
) {
  host = host ? host : "smtp.gmail.com";
  port = port ? port : 587;
  secure = secure != null ? secure : false;
  user = user ? user : "jobmanager691@gmail.com";
  pass = pass ? pass : "ysseuitqdzruedty";
  from_email = from_email ? from_email : "jobmanager691@gmail.com";

  console.log(host, port, secure, user, pass, from_email, toEmail);
  const transporter = nodemailer.createTransport({
    host: host,
    port: port,
    secure: secure,
    auth: {
      user: user,
      pass: pass,
    },
    // tls: {
    //   rejectUnauthorized: false,
    // },
    // connectionTimeout: 10000,
    // greetingTimeout: 10000,
    // socketTimeout: 10000,
  });

  const attachments = getAttachments(fileNames || []);
  const imgUrl = `<img src="https://app.cloudjobmanager.com/api/email-log?EmailId=${
    EmailId || ""
  }&To=${toEmail}" alt="" style="display: none;" />`;

  try {
    const info = await transporter.sendMail({
      from: `"Cloud Job Manager" <${from_email}>`,
      to: toEmail,
      subject: subject,
      html: `${htmlContent} ${EmailId ? imgUrl : ""}`,
      attachments: attachments,
    });

    return {
      verified: true,
      info,
      message: "Mail Sent Successfully",
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return { verified: false, message: error.message };
  }
}

module.exports = {
  sendWelcomeEmail,
};

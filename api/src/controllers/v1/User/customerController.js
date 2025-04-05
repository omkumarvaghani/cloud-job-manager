const User = require("../../../models/User/User");
const UserProfile = require("../../../models/User/UserProfile");
const { sendWelcomeEmail } = require("../../../Helpers/EmailServices");
const { createResetToken } = require("../../../middleware/authMiddleware");
const { handleTemplate } = require("./templateController");
const AppUrl = process.env.REACT_APP;

// **GET CUSTOMERS FOR COMPANY API**
exports.getCustomersByCompanyId = async (req, res) => {
  try {
    const CompanyId = Array.isArray(req.user.CompanyId)
      ? req.user.CompanyId[0]
      : req.user.CompanyId;

    const query = req.query;

    const pageSize = Math.max(parseInt(query.pageSize) || 10, 1);
    const pageNumber = Math.max(parseInt(query.pageNumber) || 0, 0);
    const search = query.search;
    const sortOrder = query.sortOrder?.toLowerCase() === "desc" ? -1 : 1;

    const allowedSortFields = [
      "FirstName",
      "LastName",
      "EmailAddress",
      "PhoneNumber",
      "Address",
      "City",
      "State",
      "Country",
      "Zip",
      "createdAt",
      "updatedAt",
    ];

    const sortField = allowedSortFields.includes(query.sortField)
      ? query.sortField
      : "updatedAt";

    let customerSearchQuery = {
      CompanyId,
      Role: "Customer",
      IsDelete: false,
    };

    let searchConditions = [];
    if (search) {
      const searchRegex = new RegExp(search, "i");
      searchConditions = [
        { "profile.FirstName": searchRegex },
        { "profile.LastName": searchRegex },
        { EmailAddress: searchRegex },
        { "profile.PhoneNumber": searchRegex },
        { "location.Address": searchRegex },
        { "location.City": searchRegex },
        { "location.State": searchRegex },
        { "location.Country": searchRegex },
        { "location.Zip": searchRegex },
      ];

      customerSearchQuery = {
        $and: [customerSearchQuery, { $or: searchConditions }],
      };
    }

    let sortOptions = {};
    if (["Address", "City", "State", "Country", "Zip"].includes(sortField)) {
      sortOptions[`profile.${sortField}`] = sortOrder;
    } else {
      sortOptions[sortField] = sortOrder;
    }

    const collation = { locale: "en", strength: 2 };

    const customers = await User.aggregate([
      { $match: customerSearchQuery },
      {
        $lookup: {
          from: "user-profiles",
          localField: "UserId",
          foreignField: "UserId",
          as: "profile",
        },
      },
      { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "locations",
          let: { customerId: "$UserId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$CustomerId", "$$customerId"] },
                IsDelete: false,
              },
            },
          ],
          as: "location",
        },
      },
      {
        $project: {
          UserId: 1,
          EmailAddress: 1,
          IsActive: 1,
          "profile.FirstName": 1,
          "profile.LastName": 1,
          "profile.PhoneNumber": 1,
          createdAt: 1,
          updatedAt: 1,
          location: 1,
        },
      },
      { $sort: sortOptions },
      { $skip: pageNumber * pageSize },
      { $limit: pageSize },
    ]).collation(collation);

    const total = await User.aggregate([
      { $match: customerSearchQuery },
      { $count: "totalCount" },
    ]);

    const totalCount = total[0]?.totalCount || 0;

    if (customers.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Customers retrieved successfully",
        data: customers,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: pageNumber,
        totalCount: totalCount,
      });
    } else {
      return res.status(204).json({
        success: false,
        message: "No customers found",
      });
    }
  } catch (error) {
    console.error("Error getting customers:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong, please try later.",
    });
  }
};

// **GET CUSTOMER DETAILS WITH ALL LOCATIONS API**
exports.getCustomerDetail = async (req, res) => {
  try {
    const { CustomerId } = req.params;
    const queryParams = req.query;
    const sortField = queryParams.sortField || "updatedAt";
    const sortOrder = queryParams.sortOrder === "desc" ? -1 : 1;

    let userSearchQuery = {
      UserId: CustomerId,
      Role: "Customer",
      IsDelete: false,
    };

    let sortOptions = {};
    if (sortField) {
      sortOptions[sortField] = sortOrder;
    }

    const customers = await User.aggregate([
      {
        $match: userSearchQuery,
      },
      {
        $lookup: {
          from: "user-profiles",
          localField: "UserId",
          foreignField: "UserId",
          as: "profile",
        },
      },
      {
        $unwind: {
          path: "$profile",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "locations",
          let: { userId: "$UserId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$CustomerId", "$$userId"] },
                IsDelete: false,
              },
            },
          ],
          as: "locationDetails",
        },
      },
      {
        $project: {
          _id: 1,
          UserId: 1,
          EmailAddress: 1,
          FirstName: "$profile.FirstName",
          LastName: "$profile.LastName",
          PhoneNumber: "$profile.PhoneNumber",
          createdAt: 1,
          updatedAt: 1,
          IsDelete: 1,
          locationDetails: 1,
        },
      },
      { $sort: sortOptions },
    ]);

    if (customers.length > 0) {
      return res.status(200).json({
        statusCode: 200,
        message: "Customer retrieved successfully",
        data: customers[0],
      });
    } else {
      return res.status(404).json({
        statusCode: 404,
        message: "No Customer found",
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
};

// **GET CUSTOMER WITH LOCATIONS**
exports.getCustomersWithLocations = async (req, res) => {
  try {
    const { CompanyId } = req.params;

    const customers = await User.aggregate([
      {
        $match: {
          CompanyId: CompanyId,
          Role: "Customer",
          IsDelete: false,
        },
      },
      {
        $sort: { updatedAt: -1 },
      },
      {
        $lookup: {
          from: "user-profiles",
          localField: "UserId",
          foreignField: "UserId",
          as: "profile",
        },
      },
      {
        $lookup: {
          from: "locations",
          let: { userId: "$UserId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$CustomerId", "$$userId"] },
                CompanyId: CompanyId,
              },
            },
          ],
          as: "locations",
        },
      },
      {
        $addFields: {
          profile: { $arrayElemAt: ["$profile", 0] },
        },
      },
      {
        $project: {
          _id: 0,
          UserId: 1,
          EmailAddress: 1,
          FirstName: "$profile.FirstName",
          LastName: "$profile.LastName",
          PhoneNumber: "$profile.PhoneNumber",
          Role: 1,
          IsActive: 1,
          IsDelete: 1,
          createdAt: 1,
          updatedAt: 1,
          locations: 1,
        },
      },
    ]);

    if (customers.length === 0) {
      return res.status(204).json({
        message: "No customers found for this company.",
      });
    }

    return res.status(200).json({
      statusCode: 200,
      message: "Customers retrieved successfully with location details",
      data: customers,
    });
  } catch (error) {
    console.error("Error in getCustomersWithLocations:", error.message);
    return res.status(500).json({
      message: "Failed to fetch customers with locations",
      error: error.message,
    });
  }
};

// **GET CUSTOMERS DETAILS WITH ALL LOCATIONS API**
exports.getUserDetailWithInvoices = async (req, res) => {
  try {
    const { UserId } = req.params;

    const data = await User.aggregate([
      {
        $match: {
          UserId,
          IsDelete: false,
        },
      },
      {
        $lookup: {
          from: "user-profiles",
          localField: "UserId",
          foreignField: "UserId",
          as: "profile",
        },
      },
      {
        $unwind: {
          path: "$profile",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "locations",
          let: { customerId: "$UserId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$CustomerId", "$$customerId"] },
                    { $eq: ["$IsDelete", false] },
                  ],
                },
              },
            },
          ],
          as: "properties",
        },
      },
      {
        $addFields: {
          filteredLocations: {
            $filter: {
              input: "$properties",
              as: "property",
              cond: { $eq: ["$$property.IsDelete", false] },
            },
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          CompanyId: { $first: "$CompanyId" },
          UserId: { $first: "$UserId" },
          FirstName: { $first: "$profile.FirstName" },
          LastName: { $first: "$profile.LastName" },
          PhoneNumber: { $first: "$profile.PhoneNumber" },
          EmailAddress: { $first: "$EmailAddress" },
          Password: { $first: "$Password" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          IsDelete: { $first: "$IsDelete" },
          location: { $first: "$filteredLocations" },
        },
      },
    ]);

    if (data.length > 0) {
      return res.status(200).json({
        statusCode: 200,
        message: "User retrieved successfully",
        data: data[0],
      });
    } else {
      return res.status(404).json({
        statusCode: 404,
        message: "No user found",
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try again later!",
    });
  }
};

// **GET DATA FOR WELCOME EMAIL TEMPLATE**
exports.getCustomerWelcomeData = async (UserId) => {
  if (!UserId) throw new Error("UserId is required");

  const customer = await User.findOne({
    UserId,
    Role: "Customer",
    IsDelete: false,
  });
  if (!customer) throw new Error("Customer not found");

  const customerProfile = await UserProfile.findOne({
    UserId,
    IsDelete: false,
  });
  if (!customerProfile) throw new Error("Customer profile not found");

  const company = await User.findOne({
    CompanyId: customer.CompanyId,
    Role: "Company",
    IsDelete: false,
  });
  if (!company) throw new Error("Company not found");

  const companyProfile = await UserProfile.findOne({
    CompanyId: customer.CompanyId,
    IsDelete: false,
  });
  if (!companyProfile) throw new Error("Company profile not found");

  const resetToken = await createResetToken({
    EmailAddress: customer.EmailAddress,
  });
  const resetUrl = `${AppUrl}/auth/new-password?token=${resetToken}`;

  const buttonHtml = `
    <p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; margin: 20px 0; border: 1px solid #e88c44; border-radius: 8px; background-color: #e88c44; color: #fff; text-decoration: none; text-align: center; font-size: 15px; font-weight: 500; text-transform: uppercase; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); transition: all 0.3s ease;">
        Set Your Password
      </a>
    </p>
  `;

  const data = [
    {
      FirstName: customerProfile.FirstName || "",
      LastName: customerProfile.LastName || "",
      EmailAddress: customer.EmailAddress || "",
      PhoneNumber: customerProfile.PhoneNumber || "",
      CompanyName: companyProfile.CompanyName || "",
      companyEmailAddress: company.EmailAddress || "",
      PhoneNumber: companyProfile.PhoneNumber || "",
      Url: buttonHtml || "",
    },
  ];
  const defaultSubject = `Welcome To ${companyProfile.CompanyName}`;
  const emailBody = `
    <div style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #ffffff;">
      <table align="center" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 20px auto; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border: 1px solid #e88c44;">
        <tr>
          <td style="padding: 20px 0; text-align: center; background-color: #063164;">
            <div style="display: inline-block; padding: 20px; background-color: white; border-radius: 12px;">
              <img src="https://app.cloudjobmanager.com/cdn/upload/20250213103016_site-logo2.png" alt="CloudJobManager Logo" style="width: 160px; max-width: 100%; display: block; margin: auto;" />
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding: 0px 20px; text-align: center; color: #333333; background-color: #ffffff; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
            <h2 style="font-size: 25px; font-weight: 700; color: #063164; margin-bottom: 20px; letter-spacing: 1px;margin-top:20px;">Welcome to ${companyProfile.CompanyName}</h2>
            <p style="font-size: 16px; color: #666666; line-height: 1.6; margin-bottom: 20px; font-weight: 400;">
              Dear ${customerProfile.FirstName} ${customerProfile.LastName},<br>
              We are pleased to provide you with your login credentials for accessing our Contract Management System. Below are your details:
            </p>
            <p><strong>Email:</strong> ${customer.EmailAddress}</p>
            ${buttonHtml}
            <p style="font-size: 14px; color: #888888; margin-top: 30px; line-height: 1.6;">
              For security reasons, we recommend changing your password upon first login. If you have any questions, contact our support team at <a href="mailto:${company.EmailAddress}" style="color: #063164; font-weight: 600;">${company.EmailAddress}</a> or ${companyProfile.PhoneNumber}.
            </p>
            <p style="font-size: 14px; color: #888888; margin-top: 30px; font-weight: 400;">
              Thank you for choosing ${companyProfile.CompanyName}. We are committed to providing you with a seamless and efficient experience.
            </p>
            <p style="font-size: 14px; color: #888888; margin-top: 30px; font-weight: 400;">Best regards,<br>The ${companyProfile.CompanyName} Team</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 30px 20px; text-align: center; font-size: 12px; color: #888888; background-color: #f4f4f7; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
            ${companyProfile.CompanyName}, Inc. | All rights reserved.<br>
            <a href="#" style="color: #e88c44; text-decoration: none;">Unsubscribe</a> if you no longer wish to receive these emails.
          </td>
        </tr>
      </table>
    </div>
  `;
  console.log("Customer Email:", customer.EmailAddress);
  console.log("Customer CompanyId:", customer.CompanyId);
  console.log("Data:", data);

  return { data, defaultSubject, emailBody, customer };
};

// **SEND CUSTOMER WELCOME EMAIL**
exports.sendWelcomeEmailToCustomer = async (req, res) => {
  try {
    const { UserId } = req.params;

    const { data, emailBody, customer } = await exports.getCustomerWelcomeData(
      UserId
    );
    console.log(customer, "customer");
    const status = await handleTemplate(
      "Invitation",
      customer.CompanyId,
      data,
      [],
      defaultSubject,
      emailBody,
      customer.CustomerId
    );

    if (status) {
      return res.status(200).json({
        statusCode: 200,
        message: `Email was sent to ${customer.EmailAddress}`,
      });
    } else {
      return res.status(203).json({
        statusCode: 203,
        message: "Issue sending email",
      });
    }
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try again later",
    });
  }
};

// **GET USER BY ID API**
exports.getCustomerData = async (req, res) => {
  try {
    const { UserId } = req.params;

    if (!UserId) {
      return res.status(400).json({
        success: false,
        message: "Unauthorized or missing information.",
      });
    }

    const user = await User.findOne({
      UserId: { $in: [UserId] },

      Role: "Customer",
      IsDelete: false,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found for the provided UserId.",
      });
    }

    const userProfile = await UserProfile.findOne({
      UserId,
      Role: "Customer",
      IsDelete: false,
    });

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Company data fetched successfully.",
      data: {
        user,
        userProfile,
      },
    });
  } catch (error) {
    console.error("Error fetching company data:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// **PUT CUSTOMER PROFILE API**
exports.updateCustomerProfile = async (req, res) => {
  const { UserId } = req.params;
  const updateData = req.body;

  console.log(req.body, "Request Body");

  if (!updateData) {
    return res.status(400).json({
      statusCode: 400,
      message: "Update data is required.",
    });
  }

  const { CompanyId, ...dataToUpdate } = updateData;

  try {
    const admin = await User.findOneAndUpdate(
      { UserId, IsDelete: false },
      { $set: dataToUpdate },
      { new: true }
    );

    if (!admin) {
      return res.status(404).json({
        statusCode: 404,
        message: "Company not found!",
      });
    }

    const userProfileUpdate = await UserProfile.findOneAndUpdate(
      { UserId },
      {
        $set: {
          ...dataToUpdate,
        },
      },
      { new: true, upsert: true }
    );

    if (!userProfileUpdate) {
      return res.status(404).json({
        statusCode: 404,
        message: "User  Profile not found!",
      });
    }

    return res.status(200).json({
      statusCode: 200,
      message: "Profile updated successfully",
      data: admin,
    });
  } catch (error) {
    console.error("Error updating company profile:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

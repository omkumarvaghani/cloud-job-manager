const User = require("../../../models/User/User");
const UserProfile = require("../../../models/User/UserProfile");
const bcrypt = require("bcrypt");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const { logUserEvent } = require("../../../middleware/eventMiddleware");
const Location = require("../../../models/User/Location");

// **CREATE COMPANY BY ADMIN, CUSTOMER & WORKER API**
exports.createUser = async (req, res) => {
    try {
        if (!req.user || !req.user.Role) {
            return res.status(403).json({ message: "Unauthorized: Role not found in token." });
        }

        const { Role, EmailAddress, Password, Address, City, State, Zip, Country, ...profileDetails } = req.body;

        if (!["Company", "Worker", "Customer"].includes(Role)) {
            return res.status(400).json({ message: "Invalid Role! Only Company, Worker, or Customer allowed." });
        }

        let CompanyId;
        if (Role === "Company") {
            if (req.user.Role !== "Admin") {
                return res.status(403).json({ message: "Unauthorized: Only Admin can create a Company." });
            }
            CompanyId = [uuidv4()];
        } else {
            if (!req.user.CompanyId) {
                return res.status(403).json({ message: "Unauthorized: CompanyId not found in token." });
            }
            CompanyId = Array.isArray(req.user.CompanyId) ? req.user.CompanyId : [req.user.CompanyId];
        }

        let existingUser;
        if (Role === "Company") {
            existingUser = await User.findOne({ EmailAddress, IsDelete: false });
        } else {
            existingUser = await User.findOne({
                EmailAddress,
                CompanyId: { $in: CompanyId },
                Role,
                IsDelete: false
            });
        }

        if (existingUser) {
            return res.status(202).json({ message: "Email Already Exists!" });
        }

        const UserId = uuidv4();

        let additionalFields = {};
        if (Role === "Worker" || Role === "Customer") {
            additionalFields.UserId = UserId;
        }

        const newLocation = new Location({
            UserId: UserId,
            CompanyId: CompanyId[0],
            Address,
            City,
            State,
            Zip,
            Country,
        });

        await newLocation.save();

        const newUser = new User({
            UserId: UserId,
            Role,
            CompanyId,
            EmailAddress,
            Password,
        });
        await newUser.save();

        const newUserProfile = new UserProfile({
            UserId: UserId,
            CompanyId: CompanyId[0],
            ...profileDetails,
            LocationId: newLocation.LocationId,
            ...additionalFields,
        });
        await newUserProfile.save();

        await logUserEvent(newUser.CompanyId, "REGISTRATION", "New user registered", {
            EmailAddress,
            Role,
        });

        return res.status(200).json({
            statusCode: "200",
            message: `${Role} added successfully.`,
            data: newUserProfile,
        });
    } catch (error) {
        console.error("Error in createUser:", error);

        return res.status(500).json({
            message: "Something went wrong, please try later!",
        });
    }
};

// **GET USERS API**
exports.getUserById = async (req, res) => {
    try {
        const { UserId } = req.params;

        const user = await User.findOne({ UserId, IsDelete: false });

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        const userProfile = await UserProfile.findOne({ UserId, IsDelete: false });

        return res.status(200).json({
            message: "User fetched successfully.",
            data: { user, userProfile },
        });

    } catch (error) {
        console.error("Error in getUserById:", error);
        return res.status(500).json({
            message: "Something went wrong, please try later!",
        });
    }
};

// **UPDATE USERS API**
exports.updateUser = async (req, res) => {
    try {
        if (!req.user || !req.user.Role) {
            return res.status(403).json({ message: "Unauthorized: Role not found in token." });
        }

        const { UserId } = req.params;
        let updateData = req.body;

        const user = await User.findOne({ UserId, IsDelete: false });
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        if (req.user.Role === "Admin" && user.Role !== "Company") {
            return res.status(403).json({ message: "Unauthorized: Admin can only update Companies." });
        }
        if (req.user.Role === "Company" && !["Worker", "Customer"].includes(user.Role)) {
            return res.status(403).json({ message: "Unauthorized: Company can only update Workers and Customers." });
        }
        if (["Worker", "Customer"].includes(req.user.Role)) {
            return res.status(403).json({ message: "Unauthorized: You do not have permission to update users." });
        }

        if (updateData.Role || updateData.CompanyId) {
            return res.status(400).json({ message: "Role and CompanyId cannot be updated." });
        }
        const { EmailAddress } = updateData;
        if (EmailAddress) {
            let emailExists;
            if (req.user.Role === "Company" || req.user.Role === "Worker") {
                emailExists = await User.findOne({
                    EmailAddress,
                    IsDelete: false,
                    UserId: { $ne: UserId },
                });
            } else if (req.user.Role === "Customer") {
                emailExists = await User.findOne({
                    EmailAddress,
                    CompanyId: user.CompanyId,
                    IsDelete: false,
                    UserId: { $ne: UserId },
                });
            }

            if (emailExists) {
                return res.status(409).json({ message: "Email already exists!" });
            }
        }


        const updatedUser = await User.findOneAndUpdate(
            { UserId },
            { $set: updateData },
            { new: true }
        );

        const updatedUserProfile = await UserProfile.findOneAndUpdate(
            { UserId },
            { $set: updateData },
            { new: true }
        );

        if (!updatedUserProfile) {
            return res.status(404).json({ message: "User profile not found!" });
        }

        const companyIdForLog = req.user.CompanyId || user.CompanyId;
        await logUserEvent(companyIdForLog, "UPDATE", "User details updated", {
            UpdatedBy: req.user.EmailAddress,
            UpdatedUser: user.EmailAddress,
        });

        return res.status(200).json({
            statusCode: "200",
            message: "User updated successfully.",
            data: { user: updatedUser, userProfile: updatedUserProfile },
        });

    } catch (error) {
        console.error("Error in updateUser:", error);
        return res.status(500).json({
            message: "Something went wrong, please try later!",
        });
    }
};

// **DELETE USERS API**
exports.deleteUser = async (req, res) => {
    try {
        if (!req.user || !req.user.Role) {
            return res.status(403).json({ message: "Unauthorized: Role not found in token." });
        }

        const { UserId } = req.params;

        const user = await User.findOne({ UserId, IsDelete: false });
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        if (req.user.Role === "Admin" && user.Role !== "Company") {
            return res.status(403).json({ message: "Unauthorized: Admin can only delete Companies." });
        }
        if (req.user.Role === "Company" && !["Worker", "Customer"].includes(user.Role)) {
            return res.status(403).json({ message: "Unauthorized: Company can only delete Workers and Customers." });
        }
        if (["Worker", "Customer"].includes(req.user.Role)) {
            return res.status(403).json({ message: "Unauthorized: You do not have permission to delete users." });
        }

        const deletedUser = await User.findOneAndUpdate(
            { UserId },
            { $set: { IsDelete: true } },
            { new: true }
        );

        const deletedUserProfile = await UserProfile.findOneAndUpdate(
            { UserId },
            { $set: { IsDelete: true } },
            { new: true }
        );

        if (!deletedUserProfile) {
            return res.status(404).json({ message: "User profile not found!" });
        }

        await logUserEvent(req.user.CompanyId || user.CompanyId, "DELETE", "User deleted", {
            DeletedBy: req.user.EmailAddress,
            DeletedUser: user.EmailAddress,
        });

        return res.status(200).json({
            statusCode: "200",
            message: "User deleted successfully.",
            data: { user: deletedUser, userProfile: deletedUserProfile },
        });

    } catch (error) {
        console.error("Error in deleteUser:", error);
        return res.status(500).json({
            message: "Something went wrong, please try later!",
        });
    }
};

// **GET ALL USERS API**
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ IsDelete: false }).select("-Password");
        return res.status(200).json({
            message: "Users fetched successfully.",
            data: users
        });
    } catch (error) {
        console.error("Error in getAllUsers:", error);
        return res.status(500).json({ message: "Something went wrong, please try later!" });
    }
};

// **GET USER BY ID API**
exports.getUserByCompanyId = async (req, res) => {
    try {
        const { CompanyId } = req.params;

        const user = await User.findOne({ CompanyId, IsDelete: false }).select("-Password");
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        const userProfile = await UserProfile.findOne({ CompanyId });

        return res.status(200).json({
            statusCode: "200",
            message: "User fetched successfully.",
            data: { user, userProfile }
        });
    } catch (error) {
        console.error("Error in getUserById:", error);
        return res.status(500).json({ message: "Something went wrong, please try later!" });
    }
};

// **GET COMPANY PROFILE API**
exports.companyProfile = async function (req, res) {
    try {
        const { CompanyId } = req.params;

        const companyProfile = await UserProfile.findOne({ CompanyId: CompanyId });

        if (!companyProfile) {
            return res.status(404).json({
                statusCode: 404,
                message: "Company profile not found",
            });
        }

        res.status(200).json({
            message: "Company profile retrieved successfully",
            data: companyProfile,
        });
    } catch (error) {
        console.error("Error fetching company profile:", error.message);
        res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try later!",
        });
    }
};

// **GET COMPANY DROPDOWN API**
exports.getCompanyDropdown = async (req, res) => {
    try {
        const data = await User.find({ IsDelete: false, Role: "Company" });

        return res.status(201).json({
            statusCode: 201,
            message: "Data retrieved successfully",
            data: data,
        });
    } catch (error) {
        console.error("Error in getCompanyDropdown:", error.message);
        return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try later!",
        });
    }
};

// **PUT COMPANY PROFILE API**
exports.updateCompanyProfile = async (req, res) => {
    try {
        const { CompanyId } = req.params;
        const { UserData, ProfileData } = req.body;
        console.log(req.body, 'req.body')
        if (UserData) {
            const user = await User.findOne({ CompanyId, IsDelete: false });

            if (!user) {
                return res.status(404).json({
                    statusCode: 404,
                    message: "User not found!",
                });
            }

            if (UserData.Password) {
                const salt = await bcrypt.genSalt(10);
                UserData.Password = await bcrypt.hash(UserData.Password, salt);
            }

            await User.updateOne({ CompanyId }, { $set: UserData });
        }

        if (ProfileData) {
            ProfileData.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

            const updatedProfile = await UserProfile.findOneAndUpdate(
                { CompanyId, IsDelete: false },
                { $set: ProfileData },
                { new: true }
            );

            if (!updatedProfile) {
                return res.status(404).json({
                    statusCode: 404,
                    message: "Company profile not found!",
                });
            }
        }

        return res.status(200).json({
            statusCode: 200,
            message: "User and Company profile updated successfully",
        });
    } catch (error) {
        console.error("Error in updateCompanyProfile:", error.message);
        return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try later!",
        });
    }
};




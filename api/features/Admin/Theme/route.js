const express = require("express");
const Themes = require("./model");
const { verifyLoginToken } = require("../../../authentication");
const router = express.Router();

// router.post("/", verifyLoginToken, async (req, res) => {
//   try {
//     let { Colors, CompanyId } = req.body;

//     const existingThem = await Themes.findOne({ CompanyId, IsDelete: false });

//     if (existingThem) {
//       await Themes.findOneAndUpdate(
//         { CompanyId, IsDelete: false, ThemeId: existingThem.ThemeId },
//         {
//           $set: { Colors, CompanyId },
//         },
//         { $new: true }
//       );
//     } else {
//       await Themes.create({
//         ThemeId: `${Date.now()}`,
//         Colors,
//         CompanyId,
//       });
//     }

//     return res.status(200).json({
//       statusCode: 200,
//       message: "Theme saved successfully!",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       error,
//       message: "Something went wrong, please try again after sometime.",
//     });
//   }
// });
const addOrUpdateTheme = async (body) => {
  try {
    const { Colors, CompanyId } = body;

    const existingTheme = await Themes.findOne({ CompanyId, IsDelete: false });

    if (existingTheme) {
      await Themes.findOneAndUpdate(
        { CompanyId, IsDelete: false, ThemeId: existingTheme.ThemeId },
        {
          $set: { Colors, CompanyId },
        },
      );
    } else {
      await Themes.create({
        ThemeId: `${Date.now()}`,
        Colors,
        CompanyId,
      });
    }
    return {
      statusCode: 200,
      message: "Theme saved successfully!",
    };
  } catch (error) {
    throw new Error("Something went wrong, please try again after sometime.");
  }
};

router.post("/", verifyLoginToken, async (req, res) => {
  try {
    const response = await addOrUpdateTheme(req.body);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: "Something went wrong, please try again after sometime.",
    });
  }
});


// router.post("/date-format",verifyLoginToken, async (req, res) => {
//   try {
//     let { Format, CompanyId } = req.body;
//     if (!Format) {
//       return res.status(200).json({
//         statusCode: 203,
//         message: "Invalid date format!",
//       });
//     }

//     const existingThem = await Themes.findOne({ CompanyId, IsDelete: false });

//     if (existingThem) {
//       await Themes.findOneAndUpdate(
//         { CompanyId, IsDelete: false, ThemeId: existingThem.ThemeId },
//         {
//           $set: { Format, CompanyId },
//         },
//         { $new: true }
//       );
//     } else {
//       await Themes.create({
//         ThemeId: `${Date.now()}`,
//         Format,
//         CompanyId,
//       });
//     }

//     return res.status(200).json({
//       statusCode: 200,
//       message: "Date format successfully!",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       error,
//       message: "Something went wrong, please try again after sometime.",
//     });
//   }
// });

const saveDateFormat = async (body) => {
  try {
    const { Format, CompanyId } = body;

    if (!Format) {
      return {
        statusCode: 203,
        message: "Invalid date format!",
      };
    }

    const existingTheme = await Themes.findOne({ CompanyId, IsDelete: false });

    if (existingTheme) {
      await Themes.findOneAndUpdate(
        { CompanyId, IsDelete: false, ThemeId: existingTheme.ThemeId },
        {
          $set: { Format, CompanyId },
        },
        { $new: true }
      );
    } else {
      await Themes.create({
        ThemeId: `${Date.now()}`,
        Format,
        CompanyId,
      });
    }

    return {
      statusCode: 200,
      message: "Date format successfully!",
    };
  } catch (error) {
    throw new Error("Something went wrong, please try again after sometime.");
  }
};

router.post("/date-format", verifyLoginToken, async (req, res) => {
  try {
    const response = await saveDateFormat(req.body);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: "Something went wrong, please try again after sometime.",
    });
  }
});


// router.get("/:CompanyId",verifyLoginToken, async (req, res) => {
//   try {
//     const { CompanyId } = req.params;
//     const theme = await Themes.findOne({ CompanyId });
//     if (theme) {
//       return res.status(200).json({
//         statusCode: 200,
//         data: theme,
//         message: "Theme fetched successfully!",
//       });
//     } else {
//       return res.status(200).json({
//         statusCode: 204,
//         message: "Theme is not found!",
//       });
//     }
//   } catch (error) {
//     return res.status(500).json({
//       error,
//       message: "Something went wrong, please try again after sometime.",
//     });
//   }
// });

const getThemeByCompanyId = async (CompanyId) => {
  try {
    const theme = await Themes.findOne({ CompanyId });

    if (theme) {
      return {
        statusCode: 200,
        data: theme,
        message: "Theme fetched successfully!",
      };
    } else {
      return {
        statusCode: 204,
        message: "Theme is not found!",
      };
    }
  } catch (error) {
    throw new Error("Something went wrong, please try again after sometime.");
  }
};

router.get("/:CompanyId", verifyLoginToken, async (req, res) => {
  try {
    const { CompanyId } = req.params;
    const response = await getThemeByCompanyId(CompanyId);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: "Something went wrong, please try again after sometime.",
    });
  }
});
module.exports = router;

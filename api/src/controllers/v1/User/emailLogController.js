const EmailLogs = require("../../../models/User/EmailLogs");

exports.getEmailLogs = async (req, res) => {
    try {
        const { EmailId, To } = req.query;
        const emailLog = await EmailLogs.findOne({
            EmailId,
            "Opens.OpenedBy": To,
        });

        if (!emailLog) {
            await EmailLogs.findOneAndUpdate(
                { EmailId, "Opens.OpenedBy": { $ne: To } },
                { $push: { Opens: { OpenedBy: To, OpenedAt: Date.now() } } }
            );
        }

        const pixel = Buffer.from(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgMBApPChTYAAAAASUVORK5CYII=",
            "base64"
        );

        res.writeHead(200, {
            "Content-Type": "image/png",
            "Content-Length": pixel.length,
        });

        res.end(pixel);
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try again after sometime!",
        });
    }
};
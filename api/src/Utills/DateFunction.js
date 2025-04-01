function convertLocalToUTC(localDateTime) {
    if (!localDateTime) {
        throw new Error("Local date-time is required");
    }

    const date = new Date(localDateTime);

    if (isNaN(date.getTime())) {
        throw new Error("Invalid local date-time format");
    }

    return date.toISOString();
}

module.exports = convertLocalToUTC;
export const addTokenizationScript = (tokenizationKey) => {
  if (!tokenizationKey) {
    return Promise.reject(new Error("Tokenization key is required"));
  }

  // Check if the script is already loaded
  const existingScript = document.querySelector(
    `script[src="https://hms.transactiongateway.com/token/Collect.js"]`
  );

  if (existingScript) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://hms.transactiongateway.com/token/Collect.js";
    script.dataset.tokenizationKey = tokenizationKey;
    script.dataset.theme = "material";

    script.onerror = (error) => {
      console.error("Error loading Collect.js:", error);
      return reject(new Error("Failed to load the tokenization script"));
    };

    script.onload = () => {
      console.log("Collect.js script loaded.");
      resolve();
    };

    try {
      document.body.appendChild(script);
    } catch (error) {
      return;
    }
  });
};


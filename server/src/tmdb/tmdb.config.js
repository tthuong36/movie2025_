const getUrl = (endpoint, params = {}) => {
  // BASE_URL của backend (FE sẽ lấy từ .env)
  const baseUrl = process.env.REACT_APP_API_URL || process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    console.warn("❗ API BASE URL is missing. Check your .env file.");
  }

  // Build query string
  const qs = new URLSearchParams(params).toString();

  console.log("GENERATED BACKEND URL:", `${baseUrl}/${endpoint}?${qs}`);

  return `${baseUrl}/${endpoint}?${qs}`;
};

export default { getUrl };

const getUrl = (endpoint, params = {}) => {
  const baseUrl = process.env.REACT_APP_API_URL;

  if (!baseUrl) {
    console.warn("⚠️ Missing REACT_APP_API_URL in client/.env");
  }

  const qs = new URLSearchParams(params).toString();

  return `${baseUrl}/${endpoint}?${qs}`;
};

export default { getUrl };

// KHÔNG đọc key ở đây

const getUrl = (endpoint, params) => {
  // Đọc key và url BÊN TRONG hàm này (Lazy Loading)
  // Bằng cách này, biến sẽ được truy cập khi hàm được gọi (runtime), 
  // sau khi 'dotenv' đã làm xong việc của nó.
  const baseUrl = process.env.TMDB_BASE_URL;
  const key = process.env.TMDB_KEY;

  const qs = new URLSearchParams(params);
console.log("GENERATED URL PATH:", `${baseUrl}${endpoint}?api_key=...`);

  return `${baseUrl}${endpoint}?api_key=${key}&${qs}`;
};

export default { getUrl };
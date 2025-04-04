const config = {
  API_BASE_URL: process.env.REACT_APP_URL || "http://localhost:3080/api",
  FRONTEND_URL: process.env.REACT_APP_front_end_url || "http://localhost:3000",

  S3: {
    BUCKET_NAME: process.env.REACT_APP_S3_BUCKET_NAME,
    REGION: process.env.REACT_APP_S3_REGION,
    ACCESS_KEY: process.env.REACT_APP_S3_ACCESS_KEY,
    SECRET_KEY: process.env.REACT_APP_S3_SECRET_KEY,
  },
};

export default config;

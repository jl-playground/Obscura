const S3_CONFIG = {
  region: Bun.env.S3_REGION,
  endpoint: Bun.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: Bun.env.S3_USERNAME,
    secretAccessKey: Bun.env.S3_PASSWORD,
  },
  forcePathStyle: true,
};

export { S3_CONFIG };

import { S3Client } from "@aws-sdk/client-s3";

export default class S3Connection {
  static #instance: S3Connection;
  private bucket: S3Client;

  private constructor() {
    this.bucket = new S3Client({
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.S3_USERNAME!,
        secretAccessKey: process.env.S3_PASSWORD!,
      },
      forcePathStyle: true,
    });
  }

  public static get instance(): S3Connection {
    if (!S3Connection.#instance) S3Connection.#instance = new S3Connection();
    return S3Connection.#instance;
  }

  public get getBucket(): S3Client {
    return this.bucket;
  }
}

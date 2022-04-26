const Minio = require('minio');

const host = process.env.MINIO_HOST;
const port = +process.env.MINIO_PORT;

const minioClient = new Minio.Client({
  endPoint: host,
  port,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

const bucketName = process.env.MINIO_BUCKETNAME;

async function putObject(filename, buffer) {
  const metadata = {
    'Content-Type': 'image',
  };

  const timestamp = new Date().getTime();
  const newFilename = timestamp + '_' + filename;

  minioClient.putObject(
    bucketName,
    newFilename,
    buffer,
    (error, etag) => {
      if (error) throw new Error(error);
    },
    metadata
  );

  const url = `http://${host}:${port}/${bucketName}/${newFilename}`;

  return {
    filename: newFilename,
    photoUrl: url,
  };
}

async function deleteObject(filename) {
  minioClient.removeObject(bucketName, filename, (error) => {
    if (error) throw new Error(error);
  });
}

module.exports = { putObject, deleteObject };

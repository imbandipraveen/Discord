// ./src/azure-storage-blob.js

// THIS IS SAMPLE CODE ONLY - NOT MEANT FOR PRODUCTION USE
const { BlobServiceClient } = require("@azure/storage-blob");
const { v4 } = require("uuid");

const containerName = `discord-container`;
const sasToken = process.env.REACT_APP_STORAGESASTOKEN;
const storageAccountName = process.env.REACT_APP_STORAGERESOURCENAME;

// Feature flag - disable storage feature to app if not configured
const isStorageConfigured = () => {
  return storageAccountName && sasToken ? true : false;
};

// Return list of blobs in container to display
const getBlobsInContainer = async (containerClient) => {
  const returnedBlobUrls = [];

  for await (const blob of containerClient.listBlobsFlat()) {
    returnedBlobUrls.push(
      `https://${storageAccountName}.blob.core.windows.net/${containerName}/${blob.name}`
    );
  }

  return returnedBlobUrls;
};

const createBlobInContainer = async (containerClient, file) => {
  const uniqueId = v4().replace(/-/g, "");
  const fileName = uniqueId + Date.now() + file.name;
  const blobClient = containerClient.getBlockBlobClient(fileName);
  const options = { blobHTTPHeaders: { blobContentType: file.type } };
  const fileUploadResponse = await blobClient.uploadData(file, options);

  return fileUploadResponse._response.request.url;
};

const uploadFileToBlob = async (file) => {
  if (!file) return [];

  const blobService = new BlobServiceClient(
    `https://${storageAccountName}.blob.core.windows.net/?${sasToken}`
  );

  const containerClient = blobService.getContainerClient(containerName);
  await containerClient.createIfNotExists({ access: "container" });

  const fileUrlFinal = await createBlobInContainer(containerClient, file);
  return fileUrlFinal;
};

module.exports = { uploadFileToBlob, isStorageConfigured, getBlobsInContainer };

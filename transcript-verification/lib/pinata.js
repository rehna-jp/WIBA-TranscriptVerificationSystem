import axios from 'axios';
import CryptoJS from 'crypto-js';

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;
const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;
const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY;

export const uploadToPinata = async (file, metadata = {}) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const pinataMetadata = JSON.stringify({
      name: metadata.name || file.name,
      keyvalues: metadata.keyvalues || {},
    });
    formData.append('pinataMetadata', pinataMetadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 1,
    });
    formData.append('pinataOptions', pinataOptions);

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          'Content-Type': `multipart/form-data`,
          Authorization: `Bearer ${PINATA_JWT}`,
        },
      }
    );

    return {
      ipfsHash: response.data.IpfsHash,
      pinSize: response.data.PinSize,
      timestamp: response.data.Timestamp,
      url: `${PINATA_GATEWAY}/ipfs/${response.data.IpfsHash}`,
    };
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    throw error;
  }
};

export const getFromPinata = (ipfsHash) => {
  return `${PINATA_GATEWAY}/ipfs/${ipfsHash}`;
};

export const calculateFileHash = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const wordArray = CryptoJS.lib.WordArray.create(e.target.result);
      const hash = CryptoJS.SHA256(wordArray).toString();
      resolve(`0x${hash}`);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

export const encryptFile = (file, key) => {
  // Simple encryption for demo - use proper encryption in production
  return CryptoJS.AES.encrypt(file, key).toString();
};

export const decryptFile = (encryptedData, key) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};
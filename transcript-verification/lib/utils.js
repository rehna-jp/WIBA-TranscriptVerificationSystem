export const truncateAddress = (address, chars = 4) => {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

export const formatDate = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const credentialTypes = {
  0: 'Bachelor',
  1: 'Master',
  2: 'PhD',
  3: 'Diploma',
  4: 'Certificate',
};

export const credentialStatus = {
  0: 'Active',
  1: 'Revoked',
};

export const validateFile = (file, maxSize = 10 * 1024 * 1024) => {
  if (!file) {
    throw new Error('No file provided');
  }
  if (file.type !== 'application/pdf') {
    throw new Error('Only PDF files are allowed');
  }
  if (file.size > maxSize) {
    throw new Error(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
  }
  return true;
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
};

export const downloadFile = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
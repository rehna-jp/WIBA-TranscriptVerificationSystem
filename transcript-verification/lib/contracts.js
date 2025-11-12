import { ethers } from 'ethers';
import { getProvider, getSigner } from './web3';

// Import ABI files (you'll need to place actual ABIs here)
import InstitutionRegistryABI from '../contracts/InstitutionRegistry.json';
import TranscriptVerificationABI from '../contracts/TranscriptVerification.json';

const INSTITUTION_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_INSTITUTION_REGISTRY_ADDRESS;
const TRANSCRIPT_VERIFICATION_ADDRESS = process.env.NEXT_PUBLIC_TRANSCRIPT_VERIFICATION_ADDRESS;

// Institution Registry Contract
export const getInstitutionRegistryContract = async (needsSigner = false) => {
  const providerOrSigner = needsSigner ? await getSigner() : getProvider();
  return new ethers.Contract(
    INSTITUTION_REGISTRY_ADDRESS,
    InstitutionRegistryABI.abi,
    providerOrSigner
  );
};

// Transcript Verification Contract
export const getTranscriptVerificationContract = async (needsSigner = false) => {
  const providerOrSigner = needsSigner ? await getSigner() : getProvider();
  return new ethers.Contract(
    TRANSCRIPT_VERIFICATION_ADDRESS,
    TranscriptVerificationABI.abi,
    providerOrSigner
  );
};

// Institution Registry Functions
export const registerInstitution = async (institutionAddress, name, country) => {
  try {
    const contract = await getInstitutionRegistryContract(true);
    const tx = await contract.registerInstitution(institutionAddress, name, country);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error registering institution:', error);
    throw error;
  }
};

export const isInstitutionVerified = async (institutionAddress) => {
  try {
    const contract = await getInstitutionRegistryContract(false);
    return await contract.isVerified(institutionAddress);
  } catch (error) {
    console.error('Error checking institution verification:', error);
    throw error;
  }
};

export const getInstitutionDetails = async (institutionAddress) => {
  try {
    const contract = await getInstitutionRegistryContract(false);
    return await contract.getInstitutionDetails(institutionAddress);
  } catch (error) {
    console.error('Error getting institution details:', error);
    throw error;
  }
};

// Transcript Verification Functions
export const issueCredential = async (
  studentAddress,
  documentHash,
  ipfsCid,
  credentialType,
  graduationYear
) => {
  try {
    const contract = await getTranscriptVerificationContract(true);
    const tx = await contract.issueCredential(
      studentAddress,
      documentHash,
      ipfsCid,
      credentialType,
      graduationYear
    );
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error('Error issuing credential:', error);
    throw error;
  }
};

export const verifyCredential = async (documentHash) => {
  try {
    const contract = await getTranscriptVerificationContract(false);
    return await contract.verifyCredential(documentHash);
  } catch (error) {
    console.error('Error verifying credential:', error);
    throw error;
  }
};

export const getStudentCredentials = async (studentAddress) => {
  try {
    const contract = await getTranscriptVerificationContract(false);
    return await contract.getStudentCredentials(studentAddress);
  } catch (error) {
    console.error('Error getting student credentials:', error);
    throw error;
  }
};

export const revokeCredential = async (credentialId) => {
  try {
    const contract = await getTranscriptVerificationContract(true);
    const tx = await contract.revokeCredential(credentialId);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error revoking credential:', error);
    throw error;
  }
};

export const getCredential = async (credentialId) => {
  try {
    const contract = await getTranscriptVerificationContract(false);
    return await contract.getCredential(credentialId);
  } catch (error) {
    console.error('Error getting credential:', error);
    throw error;
  }
};
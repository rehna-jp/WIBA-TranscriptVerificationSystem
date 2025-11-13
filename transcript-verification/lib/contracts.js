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

/**
 * Register a new institution (called by institution itself)
 */
export const registerInstitution = async (name, country, accreditedURL, email) => {
  try {
    const contract = await getInstitutionRegistryContract(true);
    const tx = await contract.registerInstitution(name, country, accreditedURL, email);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error registering institution:', error);
    throw error;
  }
};

/**
 * Verify an institution (admin only)
 */
export const verifyInstitution = async (institutionAddress) => {
  try {
    const contract = await getInstitutionRegistryContract(true);
    const tx = await contract.VerifyInstitution(institutionAddress);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error verifying institution:', error);
    throw error;
  }
};

/**
 * Suspend an institution (admin only)
 */
export const suspendInstitution = async (institutionAddress) => {
  try {
    const contract = await getInstitutionRegistryContract(true);
    const tx = await contract.suspendInstitution(institutionAddress);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error suspending institution:', error);
    throw error;
  }
};

/**
 * Check if institution is verified
 */
export const isInstitutionVerified = async (institutionAddress) => {
  try {
    const contract = await getInstitutionRegistryContract(false);
    return await contract.isInstitutionVerified(institutionAddress);
  } catch (error) {
    console.error('Error checking institution verification:', error);
    return false;
  }
};

/**
 * Get institution details
 */
export const getInstitutionDetails = async (institutionAddress) => {
  try {
    const contract = await getInstitutionRegistryContract(false);
    const details = await contract.getInstitutionDetails(institutionAddress);
    return {
      id: Number(details.id),
      walletAddress: details.walletAddress,
      name: details.name,
      country: details.country,
      accreditedURL: details.accreditedURL,
      isVerified: details.isVerified,
      dateRegistered: Number(details.dateRegistered),
      email: details.email
    };
  } catch (error) {
    console.error('Error getting institution details:', error);
    throw error;
  }
};

/**
 * Get total number of institutions
 */
export const getNumberOfInstitutions = async () => {
  try {
    const contract = await getInstitutionRegistryContract(false);
    const count = await contract.numberOfInstitutions();
    return Number(count);
  } catch (error) {
    console.error('Error getting institution count:', error);
    return 0;
  }
};

// ==========================================
// TRANSCRIPT MANAGER FUNCTIONS
// ==========================================

/**
 * Issue a transcript (verified institutions only)
 */
export const issueTranscript = async (
  studentId,
  ipfsCid,
  documentHash,
  degreeType,
  studentAddress,
  graduationYear
) => {
  try {
    const contract = await getTranscriptManagerContract(true);
    const tx = await contract.issueTranscripts(
      studentId,
      ipfsCid,
      documentHash,
      degreeType,
      studentAddress,
      graduationYear
    );
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error('Error issuing transcript:', error);
    throw error;
  }
};

/**
 * Verify a transcript by IPFS CID
 */
export const verifyTranscript = async (ipfsCid) => {
  try {
    const contract = await getTranscriptManagerContract(false);
    const transcript = await contract.verifyTranscript(ipfsCid);
    return {
      id: Number(transcript.id),
      studentId: transcript.studentId,
      issuedBy: transcript.issuedBy,
      documentHash: transcript.documenthash,
      degreeType: Number(transcript.degreeType),
      dateIssued: Number(transcript.dateIssued),
      ipfsCid: transcript.ipfscid,
      studentAddress: transcript.studentAddress,
      status: Number(transcript.status),
      graduationYear: Number(transcript.graduationyear)
    };
  } catch (error) {
    console.error('Error verifying transcript:', error);
    throw error;
  }
};

/**
 * Invalidate/Revoke a transcript
 */
export const invalidateTranscript = async (transcriptId) => {
  try {
    const contract = await getTranscriptManagerContract(true);
    const tx = await contract.inValidateTranscript(transcriptId);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error invalidating transcript:', error);
    throw error;
  }
};

/**
 * Get transcript details by ID
 */
export const getTranscriptDetails = async (transcriptId) => {
  try {
    const contract = await getTranscriptManagerContract(false);
    const transcript = await contract.getTranscriptDetails(transcriptId);
    return {
      id: Number(transcript.id),
      studentId: transcript.studentId,
      issuedBy: transcript.issuedBy,
      documentHash: transcript.documenthash,
      degreeType: Number(transcript.degreeType),
      dateIssued: Number(transcript.dateIssued),
      ipfsCid: transcript.ipfscid,
      studentAddress: transcript.studentAddress,
      status: Number(transcript.status),
      graduationYear: Number(transcript.graduationyear)
    };
  } catch (error) {
    console.error('Error getting transcript details:', error);
    throw error;
  }
};

/**
 * Get all transcripts for a student
 */
export const getStudentTranscripts = async (studentAddress) => {
  try {
    const contract = await getTranscriptManagerContract(false);
    const transcripts = await contract.getStudentTranscripts(studentAddress);
    return transcripts.map(t => ({
      id: Number(t.id),
      studentId: t.studentId,
      issuedBy: t.issuedBy,
      documentHash: t.documenthash,
      degreeType: Number(t.degreeType),
      dateIssued: Number(t.dateIssued),
      ipfsCid: t.ipfscid,
      studentAddress: t.studentAddress,
      status: Number(t.status),
      graduationYear: Number(t.graduationyear)
    }));
  } catch (error) {
    console.error('Error getting student transcripts:', error);
    return [];
  }
};

/**
 * Get total transcript count
 */
export const getTranscriptCount = async () => {
  try {
    const contract = await getTranscriptManagerContract(false);
    const count = await contract.transcriptCount();
    return Number(count);
  } catch (error) {
    console.error('Error getting transcript count:', error);
    return 0;
  }
};
import { config } from './wagmi';
import { writeContract, readContract, waitForTransactionReceipt } from '@wagmi/core';

const INSTITUTION_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_INSTITUTION_REGISTRY_ADDRESS;
const TRANSCRIPT_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_TRANSCRIPT_MANAGER_ADDRESS;

// Import ABI files
import InstitutionRegistryABI from '../contracts/InstitutionRegistry.json';
import TranscriptVerificationABI from '../contracts/TranscriptVerification.json';

// Contract configurations
export const getInstitutionRegistryContract = () => ({
  address: INSTITUTION_REGISTRY_ADDRESS,
  abi: InstitutionRegistryABI,
});

export const getTranscriptManagerContract = () => ({
  address: TRANSCRIPT_MANAGER_ADDRESS,
  abi: TranscriptVerificationABI,
});

// Institution Registry Functions

export const registerInstitution = async (name, country, accreditedURL, email) => {
  try {
    const { hash } = await writeContract(getConfig(), {
      ...getInstitutionRegistryContract(),
      functionName: 'registerInstitution',
      args: [name, country, accreditedURL, email],
    });

    const receipt = await waitForTransactionReceipt(getConfig(), { hash });
    return receipt;
  } catch (error) {
    console.error('Error registering institution:', error);
    throw error;
  }
};

export const verifyInstitution = async (institutionAddress) => {
  try {
    const { hash } = await writeContract(getConfig(), {
      ...getInstitutionRegistryContract(),
      functionName: 'VerifyInstitution',
      args: [institutionAddress],
    });

    const receipt = await waitForTransactionReceipt(getConfig(), { hash });
    return receipt;
  } catch (error) {
    console.error('Error verifying institution:', error);
    throw error;
  }
};

export const suspendInstitution = async (institutionAddress) => {
  try {
    const { hash } = await writeContract(getConfig(), {
      ...getInstitutionRegistryContract(),
      functionName: 'suspendInstitution',
      args: [institutionAddress],
    });

    const receipt = await waitForTransactionReceipt(getConfig(), { hash });
    return receipt;
  } catch (error) {
    console.error('Error suspending institution:', error);
    throw error;
  }
};

export const isInstitutionVerified = async (institutionAddress) => {
  try {
    const result = await readContract(getConfig(), {
      ...getInstitutionRegistryContract(),
      functionName: 'isInstitutionVerified',
      args: [institutionAddress],
    });
    return result;
  } catch (error) {
    console.error('Error checking institution verification:', error);
    return false;
  }
};

export const getInstitutionDetails = async (institutionAddress) => {
  try {
    const institution = await readContract(getConfig(), {
      ...getInstitutionRegistryContract(),
      functionName: 'getInstitutionDetails',
      args: [institutionAddress],
    });

    // Convert BigInt to Number where needed
    return {
      id: Number(institution.id),
      walletAddress: institution.walletAddress,
      name: institution.name,
      country: institution.country,
      accreditedURL: institution.accreditedURL,
      isVerified: institution.isVerified,
      dateRegistered: Number(institution.dateRegistered),
      email: institution.email
    };
  } catch (error) {
    console.error('Error getting institution details:', error);
    throw error;
  }
};

export const getInstitutionStats = async () => {
  try {
    const [numberOfInstitutions, numberOfVerifiedInstitutions] = await Promise.all([
      readContract(getConfig(), {
        ...getInstitutionRegistryContract(),
        functionName: 'numberOfInstitutions',
      }),
      readContract(getConfig(), {
        ...getInstitutionRegistryContract(),
        functionName: 'numberOfVerifiedInstitutions',
      })
    ]);

    return {
      totalInstitutions: Number(numberOfInstitutions),
      verifiedInstitutions: Number(numberOfVerifiedInstitutions)
    };
  } catch (error) {
    console.error('Error getting institution stats:', error);
    return { totalInstitutions: 0, verifiedInstitutions: 0 };
  }
};

// Transcript Manager Functions

// Degree type enum mapping (matches your smart contract)
export const DegreeType = {
  ASSOCIATE: 0,
  BACHELOR: 1,
  MASTER: 2,
  DOCTORATE: 3,
  CERTIFICATE: 4,
  DIPLOMA: 5,
  POSTDOCTORATE: 6
};

// Status enum mapping
export const TranscriptStatus = {
  ACTIVE: 0,
  REVOKED: 1
};

export const issueTranscript = async (
  studentId,
  ipfsCid,
  documentHash,
  degreeType,
  studentAddress,
  graduationYear
) => {
  try {
    const { hash } = await writeContract(getConfig(), {
      ...getTranscriptManagerContract(),
      functionName: 'issueTranscripts',
      args: [studentId, ipfsCid, documentHash, degreeType, studentAddress, graduationYear],
    });

    const receipt = await waitForTransactionReceipt(getConfig(), { hash });
    return receipt;
  } catch (error) {
    console.error('Error issuing transcript:', error);
    throw error;
  }
};

export const verifyTranscript = async (ipfsCid) => {
  try {
    const transcript = await readContract(getConfig(), {
      ...getTranscriptManagerContract(),
      functionName: 'verifyTranscript',
      args: [ipfsCid],
    });

    // Convert BigInt to Number where needed
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

export const invalidateTranscript = async (transcriptId) => {
  try {
    const { hash } = await writeContract(getConfig(), {
      ...getTranscriptManagerContract(),
      functionName: 'inValidateTranscript',
      args: [transcriptId],
    });

    const receipt = await waitForTransactionReceipt(getConfig(), { hash });
    return receipt;
  } catch (error) {
    console.error('Error invalidating transcript:', error);
    throw error;
  }
};

export const getTranscriptDetails = async (transcriptId) => {
  try {
    const transcript = await readContract(getConfig(), {
      ...getTranscriptManagerContract(),
      functionName: 'getTranscriptDetails',
      args: [transcriptId],
    });

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

export const getStudentTranscripts = async (studentAddress) => {
  try {
    const transcripts = await readContract(getConfig(), {
      ...getTranscriptManagerContract(),
      functionName: 'getStudentTranscripts',
      args: [studentAddress],
    });

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

export const checkCIDExists = async (cid) => {
  try {
    const exists = await readContract(getConfig(), {
      ...getTranscriptManagerContract(),
      functionName: 'existingCIDs',
      args: [cid],
    });
    return exists;
  } catch (error) {
    console.error('Error checking CID:', error);
    return false;
  }
};

export const getTranscriptCount = async () => {
  try {
    const count = await readContract(getConfig(), {
      ...getTranscriptManagerContract(),
      functionName: 'transcriptCount',
    });
    return Number(count);
  } catch (error) {
    console.error('Error getting transcript count:', error);
    return 0;
  }
};

// Utility functions for enum conversion
export const getDegreeTypeName = (degreeType) => {
  const names = [
    'ASSOCIATE',
    'BACHELOR', 
    'MASTER',
    'DOCTORATE',
    'CERTIFICATE',
    'DIPLOMA',
    'POSTDOCTORATE'
  ];
  return names[degreeType] || 'UNKNOWN';
};

export const getStatusName = (status) => {
  return status === 0 ? 'ACTIVE' : 'REVOKED';
};
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { uploadToPinata, calculateFileHash } from '@/lib/pinata';
import { issueCredential as issueCredentialOnChain } from '@/lib/contracts';

export const issueCredential = async (studentAddress, credentialType, graduationYear, file, institutionAddress) => {
  try {
    // 1. Calculate file hash
    const documentHash = await calculateFileHash(file);

    // 2. Upload to IPFS via Pinata
    const ipfsResult = await uploadToPinata(file, {
      name: `credential-${studentAddress}-${Date.now()}`,
      keyvalues: {
        studentAddress,
        institutionAddress,
        credentialType,
        graduationYear: graduationYear.toString(),
      },
    });

    // 3. Issue credential on blockchain
    const receipt = await issueCredentialOnChain(
      studentAddress,
      documentHash,
      ipfsResult.ipfsHash,
      credentialType,
      graduationYear
    );

    // 4. Save metadata to Firestore
    const credentialData = {
      studentAddress,
      institutionAddress,
      credentialType,
      graduationYear,
      documentHash,
      ipfsCid: ipfsResult.ipfsHash,
      ipfsUrl: ipfsResult.url,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      status: 'Active',
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'credentials'), credentialData);

    return {
      id: docRef.id,
      ...credentialData,
    };
  } catch (error) {
    console.error('Error issuing credential:', error);
    throw error;
  }
};

export const getCredentialsByStudent = async (studentAddress) => {
  try {
    const q = query(
      collection(db, 'credentials'),
      where('studentAddress', '==', studentAddress),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching credentials:', error);
    throw error;
  }
};

export const getCredentialsByInstitution = async (institutionAddress) => {
  try {
    const q = query(
      collection(db, 'credentials'),
      where('institutionAddress', '==', institutionAddress),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching institution credentials:', error);
    throw error;
  }
};

export const revokeCredentialInDb = async (credentialId, reason) => {
  try {
    const docRef = doc(db, 'credentials', credentialId);
    await updateDoc(docRef, {
      status: 'Revoked',
      revokedAt: new Date().toISOString(),
      revocationReason: reason,
    });
  } catch (error) {
    console.error('Error revoking credential:', error);
    throw error;
  }
};

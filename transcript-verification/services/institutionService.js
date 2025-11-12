import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { registerInstitution as registerInstitutionOnChain } from '@/lib/contracts';

export const registerInstitution = async (institutionAddress, name, country, adminAddress) => {
  try {
    // 1. Register on blockchain
    const tx = await registerInstitutionOnChain(institutionAddress, name, country);

    // 2. Save to Firestore
    const institutionData = {
      address: institutionAddress,
      name,
      country,
      registeredBy: adminAddress,
      status: 'Active',
      transactionHash: tx.hash,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'institutions'), institutionData);

    return {
      id: docRef.id,
      ...institutionData,
    };
  } catch (error) {
    console.error('Error registering institution:', error);
    throw error;
  }
};

export const getAllInstitutions = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'institutions'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching institutions:', error);
    throw error;
  }
};

export const suspendInstitution = async (institutionId) => {
  try {
    const docRef = doc(db, 'institutions', institutionId);
    await updateDoc(docRef, {
      status: 'Suspended',
      suspendedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error suspending institution:', error);
    throw error;
  }
};

export const reactivateInstitution = async (institutionId) => {
  try {
    const docRef = doc(db, 'institutions', institutionId);
    await updateDoc(docRef, {
      status: 'Active',
      reactivatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error reactivating institution:', error);
    throw error;
  }
};

import { getDocs, collection } from "firebase/firestore";
import { db } from "./firebase";

export const fetchData: (document: string) => Promise<any> = async (
  document: string
) => {
  const maxTries = 3;
  for (let i = 0; i < maxTries; i++) {
    try {
      const querySnapshot = await getDocs(collection(db, document));
      const newData = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        appId: doc.data().appId,
      }));
      return newData;
    } catch (err) {
      if (i === maxTries - 1) {
        throw err; // Throw the error if all tries have been exhausted
      }
    }
  }
};
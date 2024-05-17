import { getDocs, collection } from "firebase/firestore";
import { db } from "./firebase";
export const fetchData: (document: string) => Promise<any> = async (
  document: string
) =>
  await getDocs(collection(db, document))
    .then((querySnapshot) => {
      const newData = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        appId: doc.data().appId,
      }));
      return newData;
    })
    .catch((err) => {
      console.log(err);
    });

import { getDocs, collection } from "firebase/firestore";
import { db } from "./firebase";

export const fetchUsers: () => Promise<any> = async () =>
  await getDocs(collection(db, "users"))
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
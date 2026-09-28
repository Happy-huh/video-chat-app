import { useEffect, useState } from "react";
import { useAppSelector } from "../App/hooks";
import { userRef } from "../utils/FirebaseConfig";
import { where, query, getDocs } from "firebase/firestore";
import { UserType } from "../utils/types";
import { DEMO_CONTACTS } from "../utils/testUserData";

function useFetchUsers() {
  const [users, setUsers] = useState<Array<UserType>>([]);
  const userInfo = useAppSelector((zoom) => zoom.auth.userInfo);
  const uid = userInfo?.uid;

  useEffect(() => {
    let isMounted = true;

    const getUsers = async () => {
      let combinedUsers: Array<UserType> = [];

      try {
        if (uid) {
          const firestoreQuery = query(userRef, where("uid", "!=", uid));
          const data = await getDocs(firestoreQuery);
          data.forEach((userDoc) => {
            const userData = userDoc.data() as UserType;
            if (userData.uid !== uid) {
              combinedUsers.push({
                ...userData,
                label: userData.name
                  ? `${userData.name} (${userData.email})`
                  : userData.email,
              });
            }
          });
        }
      } catch (err) {
        console.warn("Could not fetch remote users from Firestore:", err);
      }

      // If in demo mode or Firestore returned no other users, provide sample demo contacts
      if (combinedUsers.length === 0 || userInfo?.isTestUser) {
        const dummyFiltered = DEMO_CONTACTS.filter((c) => c.uid !== uid);
        // Deduplicate
        dummyFiltered.forEach((dummy) => {
          if (!combinedUsers.some((u) => u.uid === dummy.uid)) {
            combinedUsers.push(dummy);
          }
        });
      }

      if (isMounted) {
        setUsers(combinedUsers);
      }
    };

    getUsers();

    return () => {
      isMounted = false;
    };
  }, [uid, userInfo?.isTestUser]);

  return [users];
}

export default useFetchUsers;

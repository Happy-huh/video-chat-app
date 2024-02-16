import React, { useEffect, useState } from "react";
import { useAppSelector } from "../App/hooks";
import { userRef } from "../utils/FirebaseConfig";
import { where, query, getDocs } from "firebase/firestore";
import { UserType } from "../utils/types";

function useFetchUsers() {
  const [users, setUsers] = useState<Array<UserType>>([]);
  const uid = useAppSelector((zoom) => zoom.auth.userInfo?.uid);

  useEffect(() => {
    if (uid) {
      const getUsers = async () => {
        const firestoreQuery = query(userRef, where("uid", "!=", uid));
        const data = await getDocs(firestoreQuery);
        const firebaseUsers: Array<UserType> = [];
        data.forEach((user) => {
          const userData = user.data() as UserType;
          firebaseUsers.push({
            ...userData,
            label: userData.name,
          });
        });
        setUsers(firebaseUsers);
      };
      getUsers();
    }
  }, [uid]);
  return [users];
}

export default useFetchUsers;

import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "../utils/FirebaseConfig";
import { setUser } from "../App/slices/AuthSlice";
import { useAppDispatch, useAppSelector } from "../App/hooks";

function useAuth() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector((state) => state.auth.userInfo);

  // Use a ref so the onAuthStateChanged callback always sees the latest value
  // without causing re-subscriptions.
  const userInfoRef = useRef(userInfo);
  userInfoRef.current = userInfo;

  useEffect(() => {
    const unSubscribed = onAuthStateChanged(firebaseAuth, (currentUser) => {
      if (currentUser) {
        dispatch(
          setUser({
            uid: currentUser.uid,
            email: currentUser.email || "",
            name:
              currentUser.displayName ||
              currentUser.email?.split("@")[0] ||
              "User",
          })
        );
      } else {
        // Check fresh values at callback time (not stale closure values)
        const savedUserRaw = localStorage.getItem("zoom-user");
        const hasSavedUser =
          userInfoRef.current ||
          (savedUserRaw && savedUserRaw !== "undefined");

        // If no Firebase user and no active test/saved user, redirect to login
        if (!hasSavedUser) {
          navigate("/login");
        }
      }
    });

    return () => unSubscribed();
    // Only subscribe once - userInfo changes are tracked via the ref
  }, [dispatch, navigate]);
}

export default useAuth;

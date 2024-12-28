import react, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "../utils/FirebaseConfig";
import { setUser } from "../App/slices/AuthSlice";

function useAuth() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useEffect(() => {
    const unSubscribed = onAuthStateChanged(firebaseAuth, (currentUser) => {
      console.log(currentUser);
      if (!currentUser) {}
      else {
        dispatch(
          setUser({
            uid: 'tester',
            email: "randomtester@gmail.com",
            name: 'random tester',
          })
        );
      }
    });
    return () => unSubscribed();
  }, [dispatch, navigate]);
}

export default useAuth;

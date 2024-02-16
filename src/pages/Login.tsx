import React, { FormEvent, useState } from "react";
import {
  EuiProvider,
  EuiFlexGroup,
  EuiFlexItem,
  EuiImage,
  EuiSpacer,
  EuiText,
  EuiTextColor,
  EuiButton,
  EuiPanel,
} from "@elastic/eui";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { firebaseAuth, userRef } from "../utils/FirebaseConfig";
import { addDoc, getDoc, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../App/hooks";
import { setUser } from "../App/slices/AuthSlice";
import logo from "../assets/logo.png";
import animation from "../assets/animation.gif";

function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");

  const signIn = (e: FormEvent) => {
    e.preventDefault();
    signInWithEmailAndPassword(firebaseAuth, formEmail, formPassword)
      .then((e) => {
        console.log(e);
      })
      .catch((e) => {
        console.log(e);
        createUserWithEmailAndPassword(firebaseAuth, formEmail, formPassword)
          .then((e) => {
            console.log(e);
          })
          .catch((e) => {
            console.log(e);
          });
      });
  };

  onAuthStateChanged(firebaseAuth, (currentUser) => {
    if (currentUser) navigate("/");
  });

  const login = async () => {
    const provider = new GoogleAuthProvider();
    const {
      user: { displayName, email, uid },
    } = await signInWithPopup(firebaseAuth, provider);
    if (email) {
      const fireStoreQuery = query(userRef, where("uid", "==", uid));
      const fetchUsers = await getDocs(fireStoreQuery);
      if (fetchUsers.docs.length === 0) {
        await addDoc(userRef, {
          uid,
          name: displayName,
          email,
        });
      }
    }
    dispatch(setUser({ uid, name: displayName, email }));
    navigate("/");
  };

  return (
    <EuiProvider colorMode="dark">
      <EuiFlexGroup
        alignItems="center"
        justifyContent="center"
        style={{ width: "100vw", height: "100vh" }}
      >
        <EuiFlexItem grow={false}>
          <EuiPanel paddingSize="xl">
            <EuiFlexGroup justifyContent="center" alignItems="center">
              <EuiFlexItem>
                <EuiImage src={animation} alt="logo" />
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiImage src={logo} alt="logo" size="230px" />
                <EuiSpacer size="xs" />
                <EuiText textAlign="center" grow={false}>
                  <h3>
                    <EuiTextColor>One platform to</EuiTextColor>
                    <EuiTextColor color="#0b5cff"> connect</EuiTextColor>
                  </h3>
                </EuiText>
                <EuiSpacer size="l" />
                <form onSubmit={signIn} action="">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <input
                      name="email"
                      placeholder="@email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      style={{
                        padding: "1em",
                        fontSize: "1em",
                        borderColor: "#0b5cff",
                        borderRadius: 5,
                        display: "block",
                        marginBottom: "1em",
                      }}
                      type="email"
                    />
                    <input
                      name="passeord"
                      placeholder="password"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      style={{
                        padding: "1em",
                        fontSize: "1em",
                        borderColor: "#0b5cff",
                        borderRadius: 5,
                        display: "block",
                        marginBottom: "1em",
                      }}
                      type="password"
                    />
                    <input
                      style={{
                        backgroundColor: "#0b5cff",
                        color: "white",
                        borderRadius: 10,
                        padding: "5px 20px",
                      }}
                      type="submit"
                      value="Login"
                    />
                  </div>
                </form>
                <EuiSpacer size="s" />
                <EuiText>
                  <h4 style={{ textAlign: "center" }}>or</h4>
                </EuiText>
                <EuiSpacer size="s" />
                <EuiButton fill onClick={login}>
                  Login with Google
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiPanel>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiProvider>
  );
}

export default Login;

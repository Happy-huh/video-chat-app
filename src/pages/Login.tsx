import React, { FormEvent, useEffect, useState } from "react";
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiImage,
  EuiSpacer,
  EuiText,
  EuiTextColor,
  EuiButton,
  EuiPanel,
  EuiFieldText,
  EuiFieldPassword,
  EuiFormRow,
  EuiCallOut,
  EuiTabs,
  EuiTab,
  EuiBadge,
  EuiHorizontalRule,
} from "@elastic/eui";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { firebaseAuth, userRef } from "../utils/FirebaseConfig";
import { addDoc, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../App/hooks";
import { setUser } from "../App/slices/AuthSlice";
import UseToast from "../hooks/useToast";
import logo from "../assets/logo.png";
import { DEMO_USER, initDemoData } from "../utils/testUserData";

function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [createToast] = UseToast();
  const isDarkTheme = useAppSelector((state) => state.auth.isDarkTheme);
  const currentUser = useAppSelector((state) => state.auth.userInfo);

  const [activeTab, setActiveTab] = useState<"signin" | "register">("signin");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formName, setFormName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      if (user) {
        dispatch(
          setUser({
            uid: user.uid,
            email: user.email || "",
            name: user.displayName || user.email?.split("@")[0] || "User",
          })
        );
        navigate("/");
      }
    });
    return () => unsubscribe();
  }, [dispatch, navigate]);

  const handleEmailAuth = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formEmail.trim() || !formPassword.trim()) {
      setErrorMessage("Please fill in both email and password.");
      return;
    }

    if (activeTab === "register" && !formName.trim()) {
      setErrorMessage("Please enter your display name.");
      return;
    }

    setIsLoading(true);

    try {
      if (activeTab === "signin") {
        const userCredential = await signInWithEmailAndPassword(
          firebaseAuth,
          formEmail.trim(),
          formPassword
        );
        const fbUser = userCredential.user;
        const displayName =
          fbUser.displayName || fbUser.email?.split("@")[0] || "User";

        dispatch(
          setUser({
            uid: fbUser.uid,
            name: displayName,
            email: fbUser.email || "",
          })
        );
        createToast({
          title: `Welcome back, ${displayName}!`,
          type: "success",
        });
        navigate("/");
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          firebaseAuth,
          formEmail.trim(),
          formPassword
        );
        const fbUser = userCredential.user;
        const displayName = formName.trim() || fbUser.email?.split("@")[0] || "User";

        // Save new user profile to Firestore
        try {
          const userQ = query(userRef, where("uid", "==", fbUser.uid));
          const snap = await getDocs(userQ);
          if (snap.empty) {
            await addDoc(userRef, {
              uid: fbUser.uid,
              name: displayName,
              email: fbUser.email,
            });
          }
        } catch (dbErr) {
          console.warn("Could not write user to Firestore:", dbErr);
        }

        dispatch(
          setUser({
            uid: fbUser.uid,
            name: displayName,
            email: fbUser.email || "",
          })
        );
        createToast({
          title: "Account created successfully!",
          type: "success",
        });
        navigate("/");
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      let msg = err.message || "Authentication failed.";
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        msg = "Invalid email or password combination.";
      } else if (err.code === "auth/user-not-found") {
        msg = "No account found with this email. Try registering instead!";
      } else if (err.code === "auth/email-already-in-use") {
        msg = "This email is already in use. Please sign in instead.";
      } else if (err.code === "auth/weak-password") {
        msg = "Password should be at least 6 characters long.";
      } else if (err.code === "auth/invalid-email") {
        msg = "Please provide a valid email address.";
      }
      setErrorMessage(msg);
      createToast({ title: msg, type: "danger" });
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(firebaseAuth, provider);
      const { displayName, email, uid } = result.user;

      if (email) {
        try {
          const fireStoreQuery = query(userRef, where("uid", "==", uid));
          const fetchUsers = await getDocs(fireStoreQuery);
          if (fetchUsers.docs.length === 0) {
            await addDoc(userRef, {
              uid,
              name: displayName || email.split("@")[0],
              email,
            });
          }
        } catch (dbErr) {
          console.warn("Firestore sync skipped:", dbErr);
        }
      }

      dispatch(
        setUser({
          uid,
          name: displayName || email?.split("@")[0] || "User",
          email: email || "",
        })
      );
      createToast({
        title: `Welcome, ${displayName || "User"}!`,
        type: "success",
      });
      navigate("/");
    } catch (err: any) {
      console.error("Google Auth error:", err);
      if (err.code !== "auth/popup-closed-by-user") {
        const msg = err.message || "Failed to sign in with Google.";
        setErrorMessage(msg);
        createToast({ title: msg, type: "danger" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestUserLogin = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      // Initialize dummy data (meetings, contacts, test user)
      await initDemoData(DEMO_USER);

      dispatch(setUser(DEMO_USER));

      createToast({
        title: "Logged in as Demo User with sample meetings ready!",
        type: "success",
      });
      navigate("/");
    } catch (err: any) {
      console.error("Test user login error:", err);
      // Fallback: still log in with demo user
      dispatch(setUser(DEMO_USER));
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <EuiFlexGroup
        alignItems="center"
        justifyContent="center"
        style={{
          minHeight: "100vh",
          padding: "2rem 1rem",
          background: isDarkTheme
            ? "radial-gradient(circle at 50% 20%, #161e38 0%, #080c14 100%)"
            : "radial-gradient(circle at 50% 20%, #f0f4ff 0%, #e2e8f5 100%)",
        }}
      >
        <EuiFlexItem grow={false} style={{ width: "100%", maxWidth: "480px" }}>
          <EuiPanel
            paddingSize="xl"
            hasShadow
            style={{
              borderRadius: "16px",
              border: isDarkTheme
                ? "1px solid rgba(255, 255, 255, 0.1)"
                : "1px solid rgba(11, 92, 255, 0.15)",
              boxShadow: isDarkTheme
                ? "0 20px 40px rgba(0,0,0,0.6)"
                : "0 20px 40px rgba(11, 92, 255, 0.08)",
            }}
          >
            {/* Header / Brand */}
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <EuiFlexGroup
                alignItems="center"
                justifyContent="center"
                gutterSize="m"
                responsive={false}
              >
                <EuiFlexItem grow={false}>
                  <EuiImage
                    src={logo}
                    alt="Logo"
                    size="48px"
                    style={{ borderRadius: "10px" }}
                  />
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiText>
                    <h2
                      style={{
                        margin: 0,
                        fontWeight: 800,
                        letterSpacing: "-0.5px",
                      }}
                    >
                      <EuiTextColor color="#0b5cff">MeetFlow</EuiTextColor>
                    </h2>
                  </EuiText>
                </EuiFlexItem>
              </EuiFlexGroup>
              <EuiSpacer size="xs" />
              <EuiText size="s" color="subdued">
                <p>One platform for video conferencing and 1-on-1 calls</p>
              </EuiText>
            </div>

            {/* Test / Anonymous User Instant Access Box */}
            <div
              style={{
                background: isDarkTheme
                  ? "rgba(11, 92, 255, 0.12)"
                  : "rgba(11, 92, 255, 0.06)",
                border: "1px dashed #0b5cff",
                borderRadius: "12px",
                padding: "1rem",
                textAlign: "center",
                marginBottom: "1.5rem",
              }}
            >
              <EuiFlexGroup
                alignItems="center"
                justifyContent="spaceBetween"
                gutterSize="xs"
              >
                <EuiFlexItem>
                  <div style={{ textAlign: "left" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <strong style={{ fontSize: "0.95rem" }}>
                        Instant Preview
                      </strong>
                      <EuiBadge color="primary">No signup</EuiBadge>
                    </div>
                    <EuiText size="xs" color="subdued">
                      Test all features immediately with dummy meetings & contacts.
                    </EuiText>
                  </div>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiButton
                    fill
                    color="primary"
                    isLoading={isLoading}
                    onClick={handleTestUserLogin}
                    size="s"
                    iconType="bolt"
                  >
                    Test User
                  </EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>
            </div>

            <EuiHorizontalRule margin="s" />

            {/* Error Message Display */}
            {errorMessage && (
              <>
                <EuiCallOut
                  title={errorMessage}
                  color="danger"
                  iconType="alert"
                  size="s"
                />
                <EuiSpacer size="m" />
              </>
            )}

            {/* Sign in with Google Button */}
            <EuiButton
              fullWidth
              onClick={loginWithGoogle}
              isLoading={isLoading}
              iconType="logoGoogleG"
              style={{
                height: "44px",
                fontWeight: 600,
                border: isDarkTheme
                  ? "1px solid rgba(255, 255, 255, 0.2)"
                  : "1px solid #d3dae6",
              }}
            >
              Continue with Google
            </EuiButton>

            <EuiSpacer size="m" />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                textAlign: "center",
                color: "#888",
                fontSize: "0.85rem",
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: "1px",
                  background: isDarkTheme
                    ? "rgba(255, 255, 255, 0.15)"
                    : "#e0e0e0",
                }}
              />
              <span style={{ padding: "0 10px" }}>or with email</span>
              <div
                style={{
                  flex: 1,
                  height: "1px",
                  background: isDarkTheme
                    ? "rgba(255, 255, 255, 0.15)"
                    : "#e0e0e0",
                }}
              />
            </div>

            <EuiSpacer size="m" />

            {/* Auth Mode Tabs (Sign In / Register) */}
            <EuiTabs size="s" expand>
              <EuiTab
                isSelected={activeTab === "signin"}
                onClick={() => {
                  setActiveTab("signin");
                  setErrorMessage(null);
                }}
              >
                Sign In
              </EuiTab>
              <EuiTab
                isSelected={activeTab === "register"}
                onClick={() => {
                  setActiveTab("register");
                  setErrorMessage(null);
                }}
              >
                Create Account
              </EuiTab>
            </EuiTabs>

            <EuiSpacer size="m" />

            {/* Email / Password Form */}
            <form onSubmit={handleEmailAuth}>
              {activeTab === "register" && (
                <EuiFormRow label="Full Name">
                  <EuiFieldText
                    placeholder="e.g. Alex Morgan"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    icon="user"
                    fullWidth
                    required
                  />
                </EuiFormRow>
              )}

              <EuiFormRow label="Email Address">
                <EuiFieldText
                  placeholder="name@example.com"
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  icon="email"
                  fullWidth
                  required
                />
              </EuiFormRow>

              <EuiFormRow label="Password">
                <EuiFieldPassword
                  placeholder="Enter your password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  type="dual"
                  fullWidth
                  required
                />
              </EuiFormRow>

              <EuiSpacer size="m" />

              <EuiButton
                type="submit"
                fill
                fullWidth
                isLoading={isLoading}
                style={{
                  height: "44px",
                  backgroundColor: "#0b5cff",
                  fontWeight: 600,
                }}
              >
                {activeTab === "signin"
                  ? "Sign In to Account"
                  : "Create New Account"}
              </EuiButton>
            </form>
          </EuiPanel>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
}

export default Login;

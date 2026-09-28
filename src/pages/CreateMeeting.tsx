import React from "react";
import Header from "../components/Header";
import useAuth from "../hooks/useAuth";
import {
  EuiCard,
  EuiFlexGrid,
  EuiFlexItem,
  EuiImage,
  EuiText,
} from "@elastic/eui";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../App/hooks";
import meeting1 from "../assets/meeting1.png";
import meeting2 from "../assets/meeting2.png";

function CreateMeeting() {
  useAuth();
  const navigate = useNavigate();
  const isDarkTheme = useAppSelector((state) => state.auth.isDarkTheme);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        flexDirection: "column",
        background: isDarkTheme ? "#0c101d" : "#f8fafc",
      }}
    >
      <Header />
      <div
        style={{
          flex: 1,
          padding: "2.5rem 1.5rem",
          maxWidth: "900px",
          width: "100%",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              letterSpacing: "-0.5px",
              margin: 0,
            }}
          >
            Create a New Meeting
          </h1>
          <EuiText size="m" color="subdued">
            <p>Choose the format that best fits your collaboration needs</p>
          </EuiText>
        </div>

        <EuiFlexGrid columns={2} gutterSize="xl" responsive>
          <EuiFlexItem>
            <EuiCard
              icon={<EuiImage size="5.5rem" alt="1 on 1 Meeting" src={meeting1} />}
              title={
                <span style={{ fontWeight: 700, fontSize: "1.3rem" }}>
                  1-on-1 Meeting
                </span>
              }
              description="Create a private direct video call with a single team member or collaborator."
              onClick={() => navigate("/oneononemeeting")}
              paddingSize="xl"
              style={{
                borderRadius: "16px",
                height: "100%",
                cursor: "pointer",
              }}
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiCard
              icon={<EuiImage size="5.5rem" alt="Video Conference" src={meeting2} />}
              title={
                <span style={{ fontWeight: 700, fontSize: "1.3rem" }}>
                  Video Conference
                </span>
              }
              description="Host a group meeting for up to 50 people or create an open link anyone can join."
              onClick={() => navigate("/videoconference")}
              paddingSize="xl"
              style={{
                borderRadius: "16px",
                height: "100%",
                cursor: "pointer",
              }}
            />
          </EuiFlexItem>
        </EuiFlexGrid>
      </div>
    </div>
  );
}

export default CreateMeeting;

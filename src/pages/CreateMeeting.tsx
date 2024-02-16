import React from "react";
import Header from "../components/Header";
import useAuth from "../hooks/useAuth";
import { EuiCard, EuiFlexGroup, EuiFlexItem, EuiImage } from "@elastic/eui";
import { useNavigate } from "react-router-dom";
import meeting1 from "../assets/meeting1.png";
import meeting2 from "../assets/meeting2.png";

function CreateMeeting() {
  useAuth();
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        flexDirection: "column",
      }}
    >
      <Header />
      <EuiFlexGroup
        justifyContent="center"
        alignItems="center"
        style={{ margin: "5vh 10vw" }}
      >
        <EuiFlexItem>
          <EuiCard
            icon={<EuiImage size="100%" alt="icon" src={meeting1} />}
            title={"Create 1 on 1 meeting"}
            description="Create a personal single person meeting"
            onClick={() => navigate("/oneononemeeting")}
            paddingSize="xl"
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiCard
            icon={<EuiImage size="100%" alt="icon" src={meeting2} />}
            title={"Create video confernce"}
            description="invite multiple persons to the meeting."
            onClick={() => navigate("/videoconference")}
            paddingSize="xl"
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  );
}

export default CreateMeeting;

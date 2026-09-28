import React from "react";
import { useAppSelector } from "../App/hooks";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  EuiCard,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiImage,
  EuiText,
  EuiButton,
  EuiBadge,
} from "@elastic/eui";
import Header from "../components/Header";
import dashboard1 from "../assets/dashboard1.png";
import dashboard2 from "../assets/dashboard2.png";
import dashboard3 from "../assets/dashboard3.png";

function Dashboard() {
  useAuth();
  const navigate = useNavigate();
  const userInfo = useAppSelector((state) => state.auth.userInfo);
  const isDarkTheme = useAppSelector((state) => state.auth.isDarkTheme);

  const displayName =
    userInfo?.name ||
    (userInfo?.email ? userInfo.email.split("@")[0] : "Friend");

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
          padding: "2rem 1.5rem",
          maxWidth: "1200px",
          width: "100%",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        {/* Hero Welcome Banner */}
        <div
          style={{
            background: isDarkTheme
              ? "linear-gradient(135deg, rgba(11, 92, 255, 0.15) 0%, rgba(18, 25, 48, 0.6) 100%)"
              : "linear-gradient(135deg, #e8f0fe 0%, #ffffff 100%)",
            border: isDarkTheme
              ? "1px solid rgba(11, 92, 255, 0.25)"
              : "1px solid #dbeafe",
            borderRadius: "16px",
            padding: "2rem",
            marginBottom: "2.5rem",
            boxShadow: isDarkTheme
              ? "0 10px 30px rgba(0, 0, 0, 0.4)"
              : "0 10px 25px rgba(11, 92, 255, 0.05)",
          }}
        >
          <EuiFlexGroup
            alignItems="center"
            justifyContent="spaceBetween"
            responsive
          >
            <EuiFlexItem>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                <h1
                  style={{
                    margin: 0,
                    fontSize: "2rem",
                    fontWeight: 800,
                    letterSpacing: "-0.5px",
                  }}
                >
                  Welcome back,{" "}
                  <span style={{ color: "#0b5cff" }}>{displayName}</span>
                </h1>
                {userInfo?.isTestUser && (
                  <EuiBadge color="primary">Test Mode Active</EuiBadge>
                )}
              </div>
              <EuiText size="m" color="subdued">
                <p>
                  Schedule meetings, launch instant 1-on-1 calls, or connect with
                  entire teams in high-definition video.
                </p>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiFlexGroup gutterSize="s" responsive={false}>
                <EuiFlexItem grow={false}>
                  <EuiButton
                    fill
                    color="primary"
                    iconType="plus"
                    onClick={() => navigate("/createmeeting")}
                  >
                    New Meeting
                  </EuiButton>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiButton
                    iconType="calendar"
                    onClick={() => navigate("/mymeetings")}
                  >
                    View Schedule
                  </EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
          </EuiFlexGroup>
        </div>

        {/* Feature Cards Grid */}
        <EuiFlexGrid columns={3} gutterSize="l" responsive>
          <EuiFlexItem>
            <EuiCard
              icon={<EuiImage size="4.5rem" alt="Create Meeting" src={dashboard1} />}
              title={<span style={{ fontWeight: 700, fontSize: "1.2rem" }}>Create Meeting</span>}
              description="Schedule a 1-on-1 or multi-user video conference and invite participants"
              onClick={() => navigate("/createmeeting")}
              paddingSize="l"
              style={{
                borderRadius: "14px",
                height: "100%",
                cursor: "pointer",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
            />
          </EuiFlexItem>

          <EuiFlexItem>
            <EuiCard
              icon={<EuiImage size="4.5rem" alt="My Meetings" src={dashboard2} />}
              title={<span style={{ fontWeight: 700, fontSize: "1.2rem" }}>My Meetings</span>}
              description="Manage, edit, copy links, or join meetings you have scheduled"
              onClick={() => navigate("/mymeetings")}
              paddingSize="l"
              style={{
                borderRadius: "14px",
                height: "100%",
                cursor: "pointer",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
            />
          </EuiFlexItem>

          <EuiFlexItem>
            <EuiCard
              icon={<EuiImage size="4.5rem" alt="All Meetings" src={dashboard3} />}
              title={<span style={{ fontWeight: 700, fontSize: "1.2rem" }}>Meeting Invites</span>}
              description="View and access all meetings you are invited to or open sessions"
              onClick={() => navigate("/meeting")}
              paddingSize="l"
              style={{
                borderRadius: "14px",
                height: "100%",
                cursor: "pointer",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
            />
          </EuiFlexItem>
        </EuiFlexGrid>
      </div>
    </div>
  );
}

export default Dashboard;

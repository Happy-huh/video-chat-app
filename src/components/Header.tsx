import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../App/hooks";
import {
  EuiBadge,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHeader,
  EuiText,
  EuiTextColor,
  EuiToolTip,
} from "@elastic/eui";
import { signOut } from "firebase/auth";
import { firebaseAuth } from "../utils/FirebaseConfig";
import { changeTheme, logout } from "../App/slices/AuthSlice";
import {
  getCreateMeetingBreadCrumbs,
  getMeetingsBreadCrumbs,
  getMyMeetingsBreadCrumbs,
  getOneOnOneMeetingBreadCrumbs,
  getVideoConfernceBreadCrumbs,
} from "../utils/breadCrumbs";
import { BreadCrumbsType } from "../utils/types";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const userInfo = useAppSelector((zoom) => zoom.auth.userInfo);
  const isDarkTheme = useAppSelector((zoom) => zoom.auth.isDarkTheme);

  const displayName =
    userInfo?.name ||
    (userInfo?.email ? userInfo.email.split("@")[0] : "User");

  const [breadCrumbs, setbreadCrumbs] = useState<Array<BreadCrumbsType>>([
    { text: "Dashboard" },
  ]);

  const handleLogout = async () => {
    try {
      if (firebaseAuth.currentUser) {
        await signOut(firebaseAuth);
      }
    } catch (err) {
      console.warn("Firebase signout error:", err);
    }
    dispatch(logout());
    navigate("/login");
  };

  useEffect(() => {
    const { pathname } = location;
    if (pathname === "/createmeeting")
      setbreadCrumbs(getCreateMeetingBreadCrumbs(navigate));
    else if (pathname === "/oneononemeeting")
      setbreadCrumbs(getOneOnOneMeetingBreadCrumbs(navigate));
    else if (pathname === "/videoconference")
      setbreadCrumbs(getVideoConfernceBreadCrumbs(navigate));
    else if (pathname === "/mymeetings")
      setbreadCrumbs(getMyMeetingsBreadCrumbs(navigate));
    else if (pathname === "/meeting")
      setbreadCrumbs(getMeetingsBreadCrumbs(navigate));
    else
      setbreadCrumbs([{ text: "Dashboard", href: "#", onClick: () => navigate("/") }]);
  }, [location, navigate]);

  const invertTheme = () => {
    dispatch(changeTheme({ isDarkTheme: !isDarkTheme }));
  };

  const actionButtons = (
    <EuiFlexGroup
      justifyContent="center"
      alignItems="center"
      direction="row"
      gutterSize="s"
      responsive={false}
    >
      {userInfo?.isTestUser && (
        <EuiFlexItem grow={false}>
          <EuiBadge color="warning">Demo Mode</EuiBadge>
        </EuiFlexItem>
      )}
      <EuiFlexItem grow={false}>
        <EuiToolTip content={`Switch to ${isDarkTheme ? "light" : "dark"} mode`}>
          <EuiButtonIcon
            onClick={invertTheme}
            iconType={isDarkTheme ? "sun" : "moon"}
            display="fill"
            size="s"
            color={isDarkTheme ? "warning" : "primary"}
            aria-label="Toggle dark mode"
          />
        </EuiToolTip>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiToolTip content="Log out of session">
          <EuiButtonIcon
            onClick={handleLogout}
            iconType="exit"
            display="fill"
            size="s"
            color="danger"
            aria-label="Logout button"
          />
        </EuiToolTip>
      </EuiFlexItem>
    </EuiFlexGroup>
  );

  const desktopSections = [
    {
      items: [
        <Link to="/" style={{ textDecoration: "none" }}>
          <EuiFlexGroup alignItems="center" gutterSize="s" responsive={false}>
            <EuiFlexItem grow={false}>
              <EuiText>
                <h2
                  style={{
                    margin: 0,
                    padding: "0 0.5rem",
                    fontWeight: 800,
                    letterSpacing: "-0.5px",
                  }}
                >
                  <EuiTextColor color="#0b5cff">MeetFlow</EuiTextColor>
                </h2>
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>
        </Link>,
      ],
    },
    {
      items: [
        displayName ? (
          <EuiText size="s">
            <span style={{ fontWeight: 500 }}>Hello, </span>
            <strong style={{ color: "#0b5cff" }}>{displayName}</strong>
          </EuiText>
        ) : null,
      ],
    },
    {
      items: [actionButtons],
    },
  ];

  return (
    <>
      <EuiHeader
        style={{
          minHeight: "4rem",
          borderBottom: isDarkTheme
            ? "1px solid rgba(255, 255, 255, 0.1)"
            : "1px solid #e7ecf2",
        }}
        theme={isDarkTheme ? "dark" : "default"}
        sections={desktopSections}
      />
      {location.pathname !== "/" && (
        <EuiHeader
          style={{ minHeight: "3rem" }}
          theme={isDarkTheme ? "dark" : "default"}
          sections={[{ breadcrumbs: breadCrumbs }]}
        />
      )}
    </>
  );
}

export default Header;

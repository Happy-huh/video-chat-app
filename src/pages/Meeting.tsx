import React, { useEffect, useState, useCallback } from "react";
import { MeetingType } from "../utils/types";
import { getDocs, query } from "firebase/firestore";
import { meetingRef } from "../utils/FirebaseConfig";
import { useAppSelector } from "../App/hooks";
import useAuth from "../hooks/useAuth";
import Header from "../components/Header";
import moment from "moment";
import {
  EuiBadge,
  EuiBasicTable,
  EuiButton,
  EuiButtonIcon,
  EuiCopy,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiToolTip,
} from "@elastic/eui";
import { Link, useNavigate } from "react-router-dom";
import { getLocalDummyMeetings } from "../utils/testUserData";

function Meeting() {
  useAuth();
  const navigate = useNavigate();
  const userInfo = useAppSelector((zoom) => zoom.auth.userInfo);
  const isDarkTheme = useAppSelector((zoom) => zoom.auth.isDarkTheme);
  const [meetings, setMeetings] = useState<Array<MeetingType>>([]);

  const getUserMeetings = useCallback(async () => {
    const loadedMeetings: Array<MeetingType> = [];

    if (userInfo) {
      try {
        const firestoreQuery = query(meetingRef);
        const fetchedMeetings = await getDocs(firestoreQuery);
        fetchedMeetings.forEach((meetingDoc) => {
          const data = {
            docId: meetingDoc.id,
            ...(meetingDoc.data() as MeetingType),
          };
          const isCreator = data.createdBy === userInfo.uid;
          const isAnyone = data.meetingType === "anyone-can-join";
          const isInvited = data.invitedUsers?.includes(userInfo.uid);

          if (isCreator || isAnyone || isInvited) {
            loadedMeetings.push(data);
          }
        });
      } catch (err) {
        console.warn("Could not query Firestore meetings:", err);
      }
    }

    // Merge local dummy meetings (for demo users or offline)
    const localMeetings = getLocalDummyMeetings();
    localMeetings.forEach((m) => {
      const isCreator = m.createdBy === userInfo?.uid;
      const isAnyone = m.meetingType === "anyone-can-join";
      const isInvited =
        userInfo?.isTestUser || m.invitedUsers?.includes(userInfo?.uid || "");

      if (isCreator || isAnyone || isInvited) {
        if (!loadedMeetings.some((loaded) => loaded.meetingId === m.meetingId)) {
          loadedMeetings.push(m);
        }
      }
    });

    setMeetings(loadedMeetings);
  }, [userInfo]);

  useEffect(() => {
    getUserMeetings();
  }, [getUserMeetings]);

  const isToday = (dateStr: string) => {
    const today = moment().startOf("day");
    const mDate = moment(dateStr, ["L", "YYYY-MM-DD", "MM/DD/YYYY"]).startOf("day");
    return mDate.isSame(today);
  };

  const isPast = (dateStr: string) => {
    const today = moment().startOf("day");
    const mDate = moment(dateStr, ["L", "YYYY-MM-DD", "MM/DD/YYYY"]).startOf("day");
    return mDate.isBefore(today);
  };

  const getHostUrl = () => {
    return process.env.REACT_APP_HOST || window.location.origin;
  };

  const columns = [
    {
      field: "meetingName",
      name: "Meeting Name",
      render: (name: string, meeting: MeetingType) => (
        <div>
          <span style={{ fontWeight: 600 }}>{name}</span>
          <div style={{ fontSize: "0.8rem", color: "#8c9ba5" }}>
            ID: {meeting.meetingId}
          </div>
        </div>
      ),
    },
    {
      field: "meetingType",
      name: "Type",
      render: (type: string) => {
        let color: "primary" | "accent" | "hollow" = "primary";
        if (type === "1-on-1") color = "accent";
        if (type === "anyone-can-join") color = "hollow";
        return <EuiBadge color={color}>{type}</EuiBadge>;
      },
    },
    {
      field: "meetingDate",
      name: "Scheduled Date",
    },
    {
      field: "",
      name: "Status",
      render: (meeting: MeetingType) => {
        if (!meeting.status) {
          return <EuiBadge color="danger">Cancelled</EuiBadge>;
        }

        if (isToday(meeting.meetingDate)) {
          return (
            <Link
              to={`/join/${meeting.meetingId}`}
              style={{ textDecoration: "none" }}
            >
              <EuiBadge color="success" style={{ cursor: "pointer", fontWeight: 700 }}>
                ⚡ Join Now
              </EuiBadge>
            </Link>
          );
        } else if (isPast(meeting.meetingDate)) {
          return <EuiBadge color="default">Ended</EuiBadge>;
        } else {
          return <EuiBadge color="primary">Upcoming</EuiBadge>;
        }
      },
    },
    {
      field: "meetingId",
      name: "Share",
      render: (meetingId: string) => {
        return (
          <EuiCopy textToCopy={`${getHostUrl()}/join/${meetingId}`}>
            {(copy: any) => (
              <EuiToolTip content="Copy invitation link">
                <EuiButtonIcon
                  iconType="copy"
                  onClick={copy}
                  display="base"
                  aria-label="Copy invitation link"
                />
              </EuiToolTip>
            )}
          </EuiCopy>
        );
      },
    },
  ];

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
          maxWidth: "1100px",
          width: "100%",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        <EuiFlexGroup
          justifyContent="spaceBetween"
          alignItems="center"
          style={{ marginBottom: "1.5rem" }}
          responsive
        >
          <EuiFlexItem>
            <h1
              style={{
                fontSize: "1.8rem",
                fontWeight: 800,
                letterSpacing: "-0.5px",
                margin: 0,
              }}
            >
              Meeting Invitations
            </h1>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              iconType="calendar"
              onClick={() => navigate("/mymeetings")}
            >
              My Created Meetings
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiPanel
          paddingSize="m"
          style={{
            borderRadius: "16px",
            border: isDarkTheme
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid #e2e8f0",
          }}
        >
          {meetings.length === 0 ? (
            <EuiEmptyPrompt
              iconType="users"
              title={<h2>No Meetings Available</h2>}
              body={
                <p>
                  You do not have any invitations or open meetings right now. You can schedule one or ask a teammate for a join link!
                </p>
              }
              actions={
                <EuiButton
                  fill
                  color="primary"
                  onClick={() => navigate("/createmeeting")}
                >
                  Create a New Meeting
                </EuiButton>
              }
            />
          ) : (
            <EuiBasicTable
              items={meetings}
              columns={columns}
              itemId="meetingId"
            />
          )}
        </EuiPanel>
      </div>
    </div>
  );
}

export default Meeting;

import React, { useEffect, useState, useCallback } from "react";
import { MeetingType } from "../utils/types";
import { getDocs, query, where } from "firebase/firestore";
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
import EditFlyout from "../components/EditFlyout";
import { getLocalDummyMeetings } from "../utils/testUserData";

function MyMeetings() {
  useAuth();
  const navigate = useNavigate();
  const userInfo = useAppSelector((zoom) => zoom.auth.userInfo);
  const isDarkTheme = useAppSelector((zoom) => zoom.auth.isDarkTheme);
  const [meetings, setMeetings] = useState<Array<MeetingType>>([]);
  const [showEditFlyout, setShowEditFlyout] = useState(false);
  const [editMeeting, setEditMeeting] = useState<MeetingType>();

  const getMyMeetings = useCallback(async () => {
    const loadedMeetings: Array<MeetingType> = [];

    // 1. Fetch from Firestore if user has a UID
    if (userInfo?.uid) {
      try {
        const firestoreQuery = query(
          meetingRef,
          where("createdBy", "==", userInfo.uid)
        );
        const fetchMeetings = await getDocs(firestoreQuery);
        fetchMeetings.forEach((doc) => {
          loadedMeetings.push({
            docId: doc.id,
            ...(doc.data() as MeetingType),
          });
        });
      } catch (err) {
        console.warn("Could not query Firestore for meetings:", err);
      }
    }

    // 2. Merge local dummy/demo meetings (for test users or local storage created meetings)
    const localMeetings = getLocalDummyMeetings();
    const myLocal = localMeetings.filter(
      (m) =>
        m.createdBy === userInfo?.uid ||
        userInfo?.isTestUser ||
        m.createdBy === "demo-test-user-id"
    );

    myLocal.forEach((localM) => {
      if (!loadedMeetings.some((m) => m.meetingId === localM.meetingId)) {
        loadedMeetings.push(localM);
      }
    });

    setMeetings(loadedMeetings);
  }, [userInfo]);

  useEffect(() => {
    getMyMeetings();
  }, [getMyMeetings]);

  const openEditFlyout = (meeting: MeetingType) => {
    setShowEditFlyout(true);
    setEditMeeting(meeting);
  };

  const closeEditFlyout = (dataChanged = false) => {
    setShowEditFlyout(false);
    setEditMeeting(undefined);
    if (dataChanged) getMyMeetings();
  };

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
      field: "",
      name: "Actions",
      render: (meeting: MeetingType) => {
        const canEdit = meeting.status && !isPast(meeting.meetingDate);
        return (
          <EuiFlexGroup gutterSize="s" responsive={false}>
            <EuiFlexItem grow={false}>
              <EuiToolTip content={canEdit ? "Edit meeting details" : "Cannot edit ended or cancelled meeting"}>
                <EuiButtonIcon
                  aria-label="Edit meeting"
                  iconType="documentEdit"
                  color="primary"
                  display="base"
                  isDisabled={!canEdit}
                  onClick={() => openEditFlyout(meeting)}
                />
              </EuiToolTip>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiCopy textToCopy={`${getHostUrl()}/join/${meeting.meetingId}`}>
                {(copy: any) => (
                  <EuiToolTip content="Copy invitation link">
                    <EuiButtonIcon
                      iconType="copy"
                      onClick={copy}
                      display="base"
                      aria-label="Copy meeting link"
                    />
                  </EuiToolTip>
                )}
              </EuiCopy>
            </EuiFlexItem>
          </EuiFlexGroup>
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
              My Scheduled Meetings
            </h1>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              fill
              color="primary"
              iconType="plus"
              onClick={() => navigate("/createmeeting")}
            >
              Create Meeting
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
              iconType="calendar"
              title={<h2>No Meetings Scheduled Yet</h2>}
              body={
                <p>
                  You haven&apos;t scheduled any meetings yet. Click below to create your first 1-on-1 or group video conference!
                </p>
              }
              actions={
                <EuiButton
                  fill
                  color="primary"
                  onClick={() => navigate("/createmeeting")}
                >
                  Schedule Your First Meeting
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

      {showEditFlyout && (
        <EditFlyout closedFlyout={closeEditFlyout} meetings={editMeeting!} />
      )}
    </div>
  );
}

export default MyMeetings;

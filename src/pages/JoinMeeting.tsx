import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState, useRef } from "react";
import { firebaseAuth, meetingRef } from "../utils/FirebaseConfig";
import { useNavigate, useParams } from "react-router-dom";
import UseToast from "../hooks/useToast";
import { getDocs, query, where } from "firebase/firestore";
import { MeetingType } from "../utils/types";
import moment from "moment";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { generateMeetingId } from "../utils/generateMeetings";
import { useAppSelector } from "../App/hooks";
import { getLocalDummyMeetings } from "../utils/testUserData";
import {
  EuiButton,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLoadingSpinner,
  EuiPanel,
} from "@elastic/eui";

function JoinMeeting() {
  const params = useParams();
  const navigate = useNavigate();
  const [createToast] = UseToast();

  const reduxUser = useAppSelector((state) => state.auth.userInfo);
  const isDarkTheme = useAppSelector((state) => state.auth.isDarkTheme);

  const [isAllowed, setIsAllowed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [meetingData, setMeetingData] = useState<MeetingType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(reduxUser || null);
  const [userResolved, setUserResolved] = useState(!!reduxUser);

  const callContainerRef = useRef<HTMLDivElement | null>(null);
  const zpInstanceRef = useRef<any>(null);

  // Sync auth state
  useEffect(() => {
    if (reduxUser) {
      setCurrentUser(reduxUser);
      setUserResolved(true);
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, (fbUser) => {
      if (fbUser) {
        setCurrentUser({
          uid: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split("@")[0] || "User",
          email: fbUser.email || "",
        });
      }
      // Mark as resolved whether or not we got a user - we've completed the check
      setUserResolved(true);
    });

    return () => unsubscribe();
  }, [reduxUser]);

  // Fetch meeting and check permissions - only after user auth state is resolved
  useEffect(() => {
    if (!userResolved) return;

    const fetchMeeting = async () => {
      if (!params.id) {
        setErrorMessage("Invalid meeting link.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      let foundMeeting: MeetingType | null = null;

      // 1. Try local dummy meetings first
      const localMeetings = getLocalDummyMeetings();
      const localMatch = localMeetings.find((m) => m.meetingId === params.id);
      if (localMatch) {
        foundMeeting = localMatch;
      }

      // 2. Query remote Firestore if not found locally or to get latest
      if (!foundMeeting) {
        try {
          const q = query(meetingRef, where("meetingId", "==", params.id));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            foundMeeting = snapshot.docs[0].data() as MeetingType;
          }
        } catch (err) {
          console.warn("Could not query Firestore for meeting:", err);
        }
      }

      if (!foundMeeting) {
        setErrorMessage("Meeting not found or has been removed.");
        setIsLoading(false);
        return;
      }

      setMeetingData(foundMeeting);

      // Status check
      if (!foundMeeting.status) {
        setErrorMessage("This meeting has been cancelled by the host.");
        setIsLoading(false);
        return;
      }

      const today = moment().startOf("day");
      const mDate = moment(foundMeeting.meetingDate, ["L", "YYYY-MM-DD", "MM/DD/YYYY"]).startOf("day");

      // Permission check based on meeting type
      const currentUid = currentUser?.uid;
      const isCreator = foundMeeting.createdBy === currentUid;

      if (foundMeeting.meetingType === "anyone-can-join") {
        setIsAllowed(true);
      } else if (foundMeeting.meetingType === "1-on-1") {
        const isInvited =
          foundMeeting.invitedUsers?.includes(currentUid) ||
          currentUser?.isTestUser;

        if (isCreator || isInvited) {
          if (mDate.isSame(today)) {
            setIsAllowed(true);
          } else if (mDate.isBefore(today)) {
            setErrorMessage("This meeting date has passed.");
          } else {
            setErrorMessage(`This meeting is scheduled for ${foundMeeting.meetingDate}.`);
          }
        } else {
          setErrorMessage("You do not have permission to join this 1-on-1 meeting.");
        }
      } else if (foundMeeting.meetingType === "video-conference") {
        const isInvited =
          foundMeeting.invitedUsers?.includes(currentUid) ||
          currentUser?.isTestUser;

        if (isCreator || isInvited) {
          if (mDate.isSame(today)) {
            setIsAllowed(true);
          } else if (mDate.isBefore(today)) {
            setErrorMessage("This video conference has ended.");
          } else {
            setErrorMessage(`This conference is scheduled for ${foundMeeting.meetingDate}.`);
          }
        } else {
          setErrorMessage("You have not been invited to this video conference.");
        }
      } else {
        setIsAllowed(true);
      }

      setIsLoading(false);
    };

    fetchMeeting();
  }, [params.id, currentUser, userResolved]);

  // Initialize Zego Cloud video room
  const initZego = (container: HTMLDivElement | null) => {
    if (!container || !isAllowed || zpInstanceRef.current) return;

    try {
      const appId = 142777779;
      const serverSecret = "078e2e7262045d74f0646ed2da5f289c";

      const userId = currentUser?.uid || `guest_${generateMeetingId()}`;
      const userName =
        currentUser?.name ||
        currentUser?.displayName ||
        currentUser?.email?.split("@")[0] ||
        `Guest_${userId.slice(0, 4)}`;

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appId,
        serverSecret,
        params.id as string,
        userId,
        userName
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zpInstanceRef.current = zp;

      zp.joinRoom({
        container,
        maxUsers: Number(meetingData?.maxUsers) || 50,
        sharedLinks: [
          {
            name: "Meeting Link",
            url: `${window.location.origin}/join/${params.id}`,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.VideoConference,
        },
        showPreJoinView: true,
        turnOnCameraWhenJoining: true,
        turnOnMicrophoneWhenJoining: true,
        onLeaveRoom: () => {
          navigate("/");
        },
      });
    } catch (err) {
      console.error("Failed to initialize Zego video:", err);
      createToast({
        title: "Video call initialization error.",
        type: "danger",
      });
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
          background: isDarkTheme ? "#0c101d" : "#f8fafc",
        }}
      >
        <EuiFlexGroup alignItems="center" justifyContent="center" direction="column">
          <EuiFlexItem grow={false}>
            <EuiLoadingSpinner size="xl" />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <h3>Connecting to meeting...</h3>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    );
  }

  if (errorMessage || !isAllowed) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
          background: isDarkTheme ? "#0c101d" : "#f8fafc",
          padding: "1rem",
        }}
      >
        <EuiPanel
          paddingSize="l"
          style={{ maxWidth: "500px", width: "100%", borderRadius: "16px" }}
        >
          <EuiEmptyPrompt
            iconType="alert"
            iconColor="danger"
            title={<h2>Unable to Join Meeting</h2>}
            body={<p>{errorMessage || "You do not have access to this meeting."}</p>}
            actions={
              <EuiButton
                fill
                color="primary"
                onClick={() => navigate(currentUser ? "/" : "/login")}
              >
                Return to {currentUser ? "Dashboard" : "Sign In"}
              </EuiButton>
            }
          />
        </EuiPanel>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#000",
      }}
    >
      <div
        ref={(el) => {
          callContainerRef.current = el;
          initZego(el);
        }}
        style={{ width: "100%", height: "100vh" }}
      />
    </div>
  );
}

export default JoinMeeting;

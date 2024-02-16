import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { firebaseAuth, meetingRef } from "../utils/FirebaseConfig";
import { useNavigate, useParams } from "react-router-dom";
import UseToast from "../hooks/useToast";
import { getDocs, query, where } from "firebase/firestore";
import { MeetingType } from "../utils/types";
import moment from "moment";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { generateMeetingId } from "../utils/generateMeetings";

function JoinMeeting() {
  const params = useParams();
  const navigate = useNavigate();
  const [createTost] = UseToast();
  const [isallowed, setisAllowed] = useState(false);
  const [userLoaded, setUserLoaded] = useState(false);
  const [user, setUser] = useState<any>(undefined);

  onAuthStateChanged(firebaseAuth, (currentUser) => {
    if (currentUser) {
      setUser(currentUser);
    }
    setUserLoaded(true);
  });

  useEffect(() => {
    const getMeetingData = async () => {
      if (params.id && userLoaded) {
        const firestoreQuery = query(
          meetingRef,
          where("meetingId", "==", params.id)
        );
        const fetchedMeetings = await getDocs(firestoreQuery);
        if (fetchedMeetings.docs.length) {
          const meeting = fetchedMeetings.docs[0].data();
          const isCreator = meeting.createdBy === user?.uid;
          if (meeting.meetingType === "1-on-1") {
            if (meeting.invitedUsers[0] === user?.uid || isCreator) {
              if (meeting.meetingDate === moment().format("L")) {
                setisAllowed(true);
              } else if (
                moment(meeting.meetingDate).isBefore(moment().format("L"))
              ) {
                createTost({ title: "meeting has ended", type: "danger" });
                navigate(user ? "/" : "/login");
              } else if (moment(meeting.meetingDate).isAfter()) {
                createTost({
                  title: `meeting is on ${meeting.meetingDate}`,
                  type: "warning",
                });
                navigate(user ? "/" : "/login");
              } else {
                navigate(user ? "/" : "/login");
              }
            }
          } else if (meeting.meetingType === "video-conference") {
            const index = meeting.invitedUsers.findIndex(
              (invitedUser: string) => invitedUser === user?.uid
            );
            if (index !== -1 || isCreator) {
              if (meeting.meetingDate === moment().format("L")) {
                setisAllowed(true);
              } else if (
                moment(meeting.meetingDate).isBefore(moment().format("L"))
              ) {
                createTost({ title: "meeting has ended", type: "danger" });
                navigate(user ? "/" : "/login");
              } else if (moment(meeting.meetingDate).isAfter()) {
                createTost({
                  title: `meeting is on ${meeting.meetingDate}`,
                  type: "warning",
                });
                navigate(user ? "/" : "/login");
              }
            } else {
              createTost({
                title: `you are not invited to this meeting`,
                type: "danger",
              });
              navigate(user ? "/" : "/login");
            }
          } else {
            setisAllowed(true);
          }
        } else navigate("/");
      }
    };
    getMeetingData();
  }, [userLoaded]);

  const appId = 142777779;
  const serverSecret = "078e2e7262045d74f0646ed2da5f289c";

  const myMeeting = async (element: any) => {
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appId,
      serverSecret,
      params.id as string,
      user.uid ? user.uid : generateMeetingId(),
      user.displayName ? user.displayName : generateMeetingId()
    );
    const zp = ZegoUIKitPrebuilt.create(kitToken);
    zp.joinRoom({
      container: element,
      maxUsers: 50,
      sharedLinks: [
        {
          name: "personal link",
          url: window.location.origin,
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.VideoConference,
      },
    });
  };

  return (
    // yarn add @zegocloud/zego-uikit-prebuilt
    <div>
      {isallowed && (
        <div
          className="myCallContainer"
          ref={myMeeting}
          style={{ width: "100%", height: "100vh" }}
        ></div>
      )}
    </div>
  );
}

export default JoinMeeting;

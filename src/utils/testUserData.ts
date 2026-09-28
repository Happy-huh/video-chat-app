import moment from "moment";
import { MeetingType, UserType } from "./types";
import { addDoc, getDocs, query, where } from "firebase/firestore";
import { meetingRef, userRef } from "./FirebaseConfig";

export const DEMO_USER: UserType = {
  uid: "demo-test-user-id",
  name: "Demo User",
  email: "demo.tester@preview.app",
  isTestUser: true,
};

export const DEMO_CONTACTS: Array<UserType> = [
  {
    uid: "contact-alex-101",
    name: "Alex Morgan",
    email: "alex.morgan@techcorp.io",
    label: "Alex Morgan (alex.morgan@techcorp.io)",
  },
  {
    uid: "contact-sarah-102",
    name: "Sarah Jenkins",
    email: "sarah.jenkins@designlab.com",
    label: "Sarah Jenkins (sarah.jenkins@designlab.com)",
  },
  {
    uid: "contact-michael-103",
    name: "Michael Scott",
    email: "michael.scott@dundermifflin.com",
    label: "Michael Scott (michael.scott@dundermifflin.com)",
  },
  {
    uid: "contact-emily-104",
    name: "Emily Watson",
    email: "emily.watson@enterprise.net",
    label: "Emily Watson (emily.watson@enterprise.net)",
  },
  {
    uid: "contact-david-105",
    name: "David Kim",
    email: "david.kim@innovate.org",
    label: "David Kim (david.kim@innovate.org)",
  },
];

const LOCAL_STORAGE_MEETINGS_KEY = "zoom_demo_meetings";

export const getInitialDummyMeetings = (demoUid: string): Array<MeetingType> => {
  const today = moment().format("L");
  const upcomingDate = moment().add(2, "days").format("L");
  const pastDate = moment().subtract(3, "days").format("L");

  return [
    {
      docId: "demo-meeting-1",
      meetingId: "live-sync-101",
      meetingName: "🚀 Product & Strategy Sync",
      meetingType: "1-on-1",
      createdBy: demoUid,
      invitedUsers: ["contact-alex-101"],
      maxUsers: 2,
      meetingDate: today,
      status: true,
    },
    {
      docId: "demo-meeting-2",
      meetingId: "team-standup-202",
      meetingName: "👥 Weekly Engineering Standup",
      meetingType: "video-conference",
      createdBy: demoUid,
      invitedUsers: [
        "contact-alex-101",
        "contact-sarah-102",
        "contact-michael-103",
      ],
      maxUsers: 20,
      meetingDate: today,
      status: true,
    },
    {
      docId: "demo-meeting-3",
      meetingId: "open-lounge-303",
      meetingName: "☕ Virtual Coffee & All-Hands Lounge",
      meetingType: "anyone-can-join",
      createdBy: "contact-michael-103",
      invitedUsers: [],
      maxUsers: 50,
      meetingDate: today,
      status: true,
    },
    {
      docId: "demo-meeting-4",
      meetingId: "sprint-plan-404",
      meetingName: "📅 Q4 Roadmap & Sprint Planning",
      meetingType: "video-conference",
      createdBy: demoUid,
      invitedUsers: ["contact-sarah-102", "contact-emily-104"],
      maxUsers: 15,
      meetingDate: upcomingDate,
      status: true,
    },
    {
      docId: "demo-meeting-5",
      meetingId: "retro-505",
      meetingName: "📊 Sprint Retrospective & Feedback",
      meetingType: "video-conference",
      createdBy: demoUid,
      invitedUsers: ["contact-alex-101", "contact-david-105"],
      maxUsers: 10,
      meetingDate: pastDate,
      status: true,
    },
  ];
};

export const getLocalDummyMeetings = (userId?: string): Array<MeetingType> => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_MEETINGS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Failed to parse local dummy meetings:", err);
  }
  return [];
};

export const saveLocalDummyMeetings = (meetings: Array<MeetingType>): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_MEETINGS_KEY, JSON.stringify(meetings));
  } catch (err) {
    console.error("Failed to save local dummy meetings:", err);
  }
};

export const addLocalDummyMeeting = (meeting: MeetingType): void => {
  const existing = getLocalDummyMeetings();
  existing.unshift(meeting);
  saveLocalDummyMeetings(existing);
};

export const updateLocalDummyMeeting = (meeting: MeetingType): void => {
  const existing = getLocalDummyMeetings();
  const updated = existing.map((m) =>
    m.meetingId === meeting.meetingId || (m.docId && m.docId === meeting.docId)
      ? meeting
      : m
  );
  saveLocalDummyMeetings(updated);
};

/**
 * Initializes dummy meetings and users both locally and in Firestore (if permissions allow).
 */
export const initDemoData = async (user = DEMO_USER): Promise<void> => {
  // 1. Seed in local storage
  const dummyMeetings = getInitialDummyMeetings(user.uid);
  saveLocalDummyMeetings(dummyMeetings);

  // 2. Best-effort Firestore seed so real queries also find them
  try {
    // Seed demo contacts into userRef if not already present
    for (const contact of DEMO_CONTACTS) {
      const q = query(userRef, where("uid", "==", contact.uid));
      const snap = await getDocs(q);
      if (snap.empty) {
        await addDoc(userRef, {
          uid: contact.uid,
          name: contact.name,
          email: contact.email,
        });
      }
    }

    // Seed demo user into userRef
    const userQuery = query(userRef, where("uid", "==", user.uid));
    const userSnap = await getDocs(userQuery);
    if (userSnap.empty) {
      await addDoc(userRef, {
        uid: user.uid,
        name: user.name,
        email: user.email,
      });
    }

    // Seed dummy meetings into meetingRef if not already present
    for (const m of dummyMeetings) {
      const mq = query(meetingRef, where("meetingId", "==", m.meetingId));
      const mSnap = await getDocs(mq);
      if (mSnap.empty) {
        await addDoc(meetingRef, {
          createdBy: m.createdBy,
          meetingId: m.meetingId,
          meetingName: m.meetingName,
          meetingType: m.meetingType,
          invitedUsers: m.invitedUsers,
          meetingDate: m.meetingDate,
          maxUsers: m.maxUsers,
          status: m.status,
        });
      }
    }
  } catch (err) {
    // If Firestore rules deny access or offline, local storage fallback will handle everything!
    console.warn("Firestore seed skipped (using offline demo fallback):", err);
  }
};

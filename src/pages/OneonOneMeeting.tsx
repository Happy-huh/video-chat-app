import React, { useState } from "react";
import Header from "../components/Header";
import {
  EuiForm,
  EuiPanel,
  EuiSpacer,
  EuiTitle,
  EuiText,
} from "@elastic/eui";
import MeetingNameField from "../components/FormComponents/MeetingNameField";
import MeetingUsersField from "../components/FormComponents/MeetingUsersField";
import useAuth from "../hooks/useAuth";
import useFetchUsers from "../hooks/useFetchUsers";
import moment from "moment";
import MeetingDateField from "../components/FormComponents/MeetingDateField";
import CreateMeetingButton from "../components/FormComponents/CreateMeetingButton";
import { FieldErrorType, MeetingType, UserType } from "../utils/types";
import { addDoc } from "firebase/firestore";
import { meetingRef } from "../utils/FirebaseConfig";
import { generateMeetingId } from "../utils/generateMeetings";
import { useAppSelector } from "../App/hooks";
import { useNavigate } from "react-router-dom";
import UseToast from "../hooks/useToast";
import { addLocalDummyMeeting } from "../utils/testUserData";

function OneonOneMeeting() {
  useAuth();
  const [users] = useFetchUsers();
  const userInfo = useAppSelector((zoom) => zoom.auth.userInfo);
  const isDarkTheme = useAppSelector((zoom) => zoom.auth.isDarkTheme);
  const uid = userInfo?.uid;

  const [meetingName, setMeetingName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Array<UserType>>([]);
  const [startDate, setStartDate] = useState(moment());
  const [createToast] = UseToast();
  const navigate = useNavigate();

  const [showErrors, setShowErrors] = useState<{
    meetingName: FieldErrorType;
    meetingUser: FieldErrorType;
  }>({
    meetingName: {
      show: false,
      message: [],
    },
    meetingUser: {
      show: false,
      message: [],
    },
  });

  const validateForm = () => {
    let hasErrors = false;
    const clonedShowErrors = {
      meetingName: { ...showErrors.meetingName },
      meetingUser: { ...showErrors.meetingUser },
    };

    if (!meetingName.trim().length) {
      clonedShowErrors.meetingName.show = true;
      clonedShowErrors.meetingName.message = ["Please enter a meeting name"];
      hasErrors = true;
    } else {
      clonedShowErrors.meetingName.show = false;
      clonedShowErrors.meetingName.message = [];
    }

    if (!selectedUsers.length) {
      clonedShowErrors.meetingUser.show = true;
      clonedShowErrors.meetingUser.message = ["Please select a user to invite"];
      hasErrors = true;
    } else {
      clonedShowErrors.meetingUser.show = false;
      clonedShowErrors.meetingUser.message = [];
    }

    setShowErrors(clonedShowErrors);
    return hasErrors;
  };

  const createmeeting = async () => {
    if (validateForm()) return;

    const meetingId = generateMeetingId();
    const newMeetingData: MeetingType = {
      createdBy: uid || "anonymous",
      meetingId,
      meetingName: meetingName.trim(),
      meetingType: "1-on-1",
      invitedUsers: [selectedUsers[0].uid],
      meetingDate: startDate.format("L"),
      maxUsers: 2,
      status: true,
    };

    // Save locally for instant availability (especially for demo/test mode or offline)
    addLocalDummyMeeting(newMeetingData);

    // Save to Firestore if available
    try {
      await addDoc(meetingRef, newMeetingData);
    } catch (err) {
      console.warn("Could not save to remote Firestore, stored locally:", err);
    }

    createToast({
      title: "1-on-1 meeting created successfully!",
      type: "success",
    });
    navigate("/mymeetings");
  };

  const onUserChange = (selectedoptions: any) => {
    setSelectedUsers(selectedoptions);
  };

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
          maxWidth: "650px",
          width: "100%",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        <EuiPanel
          paddingSize="l"
          style={{
            borderRadius: "16px",
            border: isDarkTheme
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid #e2e8f0",
          }}
        >
          <div style={{ marginBottom: "1.5rem" }}>
            <EuiTitle size="m">
              <h2>Schedule 1-on-1 Meeting</h2>
            </EuiTitle>
            <EuiText size="s" color="subdued">
              <p>Set up a private video call with a specific participant</p>
            </EuiText>
          </div>

          <EuiForm>
            <MeetingNameField
              label="Meeting Title"
              placeHolder="e.g. Design review with Alex"
              value={meetingName}
              setMeetingName={setMeetingName}
              isInvalid={showErrors.meetingName.show}
              error={showErrors.meetingName.message}
            />

            <MeetingUsersField
              label="Invite Participant"
              options={users}
              onChange={onUserChange}
              selectedOptions={selectedUsers}
              isClearable={false}
              placeholder="Select contact to invite"
              singleSelection={{ asPlainText: true }}
              isInvalid={showErrors.meetingUser.show}
              error={showErrors.meetingUser.message}
            />

            <MeetingDateField selected={startDate} setStartDate={setStartDate} />

            <EuiSpacer size="l" />

            <CreateMeetingButton
              isEdit={false}
              closedFlyout={() => ({})}
              createmeeting={createmeeting}
            />
          </EuiForm>
        </EuiPanel>
      </div>
    </div>
  );
}

export default OneonOneMeeting;

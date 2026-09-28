import React, { useState } from "react";
import Header from "../components/Header";
import {
  EuiForm,
  EuiFormRow,
  EuiPanel,
  EuiSpacer,
  EuiSwitch,
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
import MeetingMaximumMeetingField from "../components/FormComponents/MeetingMaximumMeetingField";
import { addLocalDummyMeeting } from "../utils/testUserData";

function VideoConference() {
  useAuth();
  const [users] = useFetchUsers();
  const [createToast] = UseToast();
  const navigate = useNavigate();
  const isDarkTheme = useAppSelector((zoom) => zoom.auth.isDarkTheme);
  const userInfo = useAppSelector((zoom) => zoom.auth.userInfo);
  const uid = userInfo?.uid;

  const [size, setSize] = useState(10);
  const [anyonecanjoin, setanyonecanjoin] = useState(false);
  const [meetingName, setMeetingName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Array<UserType>>([]);
  const [startDate, setStartDate] = useState(moment());

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

    // FIX: Only validate selectedUsers when NOT in 'anyonecanjoin' mode!
    if (!anyonecanjoin && !selectedUsers.length) {
      clonedShowErrors.meetingUser.show = true;
      clonedShowErrors.meetingUser.message = ["Please select at least one participant"];
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
      meetingType: anyonecanjoin ? "anyone-can-join" : "video-conference",
      invitedUsers: anyonecanjoin
        ? []
        : selectedUsers.map((user: UserType) => user.uid),
      meetingDate: startDate.format("L"),
      maxUsers: size,
      status: true,
    };

    // Save locally for instant test mode & offline resilience
    addLocalDummyMeeting(newMeetingData);

    // Save to Firestore if available
    try {
      await addDoc(meetingRef, newMeetingData);
    } catch (err) {
      console.warn("Could not save to remote Firestore, stored locally:", err);
    }

    createToast({
      title: anyonecanjoin
        ? "Open meeting room created successfully!"
        : "Video conference scheduled successfully!",
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
              <h2>Schedule Video Conference</h2>
            </EuiTitle>
            <EuiText size="s" color="subdued">
              <p>Set up a group meeting or an open room for multiple participants</p>
            </EuiText>
          </div>

          <EuiForm>
            <EuiFormRow
              display="columnCompressedSwitch"
              label="Anyone can join"
              helpText="Allow anyone with the link to enter without prior invite"
            >
              <EuiSwitch
                showLabel={false}
                label="Anyone can join"
                checked={anyonecanjoin}
                onChange={(e) => setanyonecanjoin(e.target.checked)}
                compressed
              />
            </EuiFormRow>

            <MeetingNameField
              label="Meeting Title"
              placeHolder="e.g. Sprint Planning & Retrospective"
              value={meetingName}
              setMeetingName={setMeetingName}
              isInvalid={showErrors.meetingName.show}
              error={showErrors.meetingName.message}
            />

            <MeetingMaximumMeetingField value={size} setValue={setSize} />

            {!anyonecanjoin && (
              <MeetingUsersField
                label="Invite Participants"
                options={users}
                onChange={onUserChange}
                selectedOptions={selectedUsers}
                isClearable={false}
                placeholder="Select contacts to invite"
                singleSelection={false}
                isInvalid={showErrors.meetingUser.show}
                error={showErrors.meetingUser.message}
              />
            )}

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

export default VideoConference;
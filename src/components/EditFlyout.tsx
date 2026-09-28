import React, { useEffect, useState } from "react";
import { FieldErrorType, MeetingType, UserType } from "../utils/types";
import useAuth from "../hooks/useAuth";
import useFetchUsers from "../hooks/useFetchUsers";
import UseToast from "../hooks/useToast";
import moment from "moment";
import { doc, updateDoc } from "firebase/firestore";
import { firebaseDB } from "../utils/FirebaseConfig";
import {
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiForm,
  EuiFormRow,
  EuiSpacer,
  EuiSwitch,
  EuiTitle,
} from "@elastic/eui";
import MeetingNameField from "./FormComponents/MeetingNameField";
import MeetingMaximumMeetingField from "./FormComponents/MeetingMaximumMeetingField";
import MeetingUsersField from "./FormComponents/MeetingUsersField";
import MeetingDateField from "./FormComponents/MeetingDateField";
import CreateMeetingButton from "./FormComponents/CreateMeetingButton";
import { updateLocalDummyMeeting } from "../utils/testUserData";

function EditFlyout({
  closedFlyout,
  meetings,
}: {
  closedFlyout: (dataChanged?: boolean) => void;
  meetings: MeetingType;
}) {
  useAuth();
  const [users] = useFetchUsers();
  const [createToast] = UseToast();

  const [size, setSize] = useState<number>(Number(meetings.maxUsers) || 10);
  const anyonecanjoin = meetings.meetingType === "anyone-can-join";
  const [meetingName, setMeetingName] = useState(meetings.meetingName);
  const [selectedUsers, setSelectedUsers] = useState<Array<UserType>>([]);
  const [startDate, setStartDate] = useState(
    moment(meetings.meetingDate, ["L", "YYYY-MM-DD", "MM/DD/YYYY"])
  );
  const [meetingType] = useState(meetings.meetingType);

  // Status switch is "Cancel meeting" - so if meeting.status is true (active), isCancelled is false
  const [isCancelled, setIsCancelled] = useState(!meetings.status);

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

  useEffect(() => {
    if (users && meetings.invitedUsers) {
      const foundUsers: Array<UserType> = [];
      meetings.invitedUsers.forEach((userId: string) => {
        const findUser = users.find(
          (tempUser: UserType) => tempUser.uid === userId
        );
        if (findUser) foundUsers.push(findUser);
      });
      setSelectedUsers(foundUsers);
    }
  }, [meetings, users]);

  const onUserChange = (selectedoptions: any) => {
    setSelectedUsers(selectedoptions);
  };

  const handleEditMeeting = async () => {
    if (!meetingName.trim().length) {
      setShowErrors({
        meetingName: {
          show: true,
          message: ["Meeting title cannot be empty."],
        },
        meetingUser: { ...showErrors.meetingUser },
      });
      return;
    }

    const editedMeeting: MeetingType = {
      ...meetings,
      meetingName: meetingName.trim(),
      meetingType,
      invitedUsers: anyonecanjoin
        ? []
        : selectedUsers.map((user: UserType) => user.uid),
      maxUsers: size,
      meetingDate: startDate.format("L"),
      status: !isCancelled,
    };

    // Update in local dummy store (for test user / offline resilience)
    updateLocalDummyMeeting(editedMeeting);

    // Update in Firestore if docId exists and is remote
    if (meetings.docId && !meetings.docId.startsWith("demo-meeting-")) {
      try {
        const docRef = doc(firebaseDB, "meetings", meetings.docId);
        const { docId, ...payload } = editedMeeting;
        await updateDoc(docRef, payload);
      } catch (err) {
        console.warn("Could not update remote Firestore document:", err);
      }
    }

    createToast({
      title: "Meeting updated successfully!",
      type: "success",
    });
    closedFlyout(true);
  };

  return (
    <EuiFlyout ownFocus onClose={() => closedFlyout()}>
      <EuiFlyoutHeader hasBorder>
        <EuiTitle size="m">
          <h2>Edit Meeting Details</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiForm>
          <MeetingNameField
            label="Meeting Title"
            placeHolder="Meeting Name"
            value={meetingName}
            setMeetingName={setMeetingName}
            isInvalid={showErrors.meetingName.show}
            error={showErrors.meetingName.message}
          />

          {anyonecanjoin ? (
            <MeetingMaximumMeetingField value={size} setValue={setSize} />
          ) : (
            <MeetingUsersField
              label="Invited Participants"
              options={users}
              onChange={onUserChange}
              selectedOptions={selectedUsers}
              isClearable={false}
              placeholder="Select contacts"
              singleSelection={
                meetingType === "1-on-1" ? { asPlainText: true } : false
              }
              isInvalid={showErrors.meetingUser.show}
              error={showErrors.meetingUser.message}
            />
          )}

          <MeetingDateField selected={startDate} setStartDate={setStartDate} />

          <EuiSpacer size="m" />

          <EuiFormRow
            display="columnCompressedSwitch"
            label="Cancel meeting"
            helpText="Toggle to cancel or reactivate this meeting"
          >
            <EuiSwitch
              showLabel={false}
              label="Cancel meeting"
              checked={isCancelled}
              onChange={(e) => setIsCancelled(e.target.checked)}
              compressed
            />
          </EuiFormRow>

          <EuiSpacer size="l" />

          <CreateMeetingButton
            createmeeting={handleEditMeeting}
            isEdit={true}
            closedFlyout={() => closedFlyout(false)}
          />
        </EuiForm>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
}

export default EditFlyout;

import React, { useEffect, useState } from "react";
import { FieldErrorType, MeetingType, UserType } from "../utils/types";
import useAuth from "../hooks/useAuth";
import useFetchUsers from "../hooks/useFetchUsers";
import UseToast from "../hooks/useToast";
import moment from "moment";
import { useAppSelector } from "../App/hooks";
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

function EditFlyout({
  closedFlyout,
  meetings,
}: {
  closedFlyout: any;
  meetings: MeetingType;
}) {
  useAuth();
  const [users] = useFetchUsers();
  const [createToast] = UseToast();
  const [size, setSize] = useState(1);
  const [anyonecanjoin, setanyonecanjoin] = useState(false);
  const [meetingName, setMeetingName] = useState(meetings.meetingName);
  const [selectedUsers, setSelectedUsers] = useState<Array<UserType>>([]);
  const [StartDate, setStartDate] = useState(moment(meetings.meetingDate));
  const [meetingType] = useState(meetings.meetingType);
  const [status, setStatus] = useState(false);
  const [showErrors] = useState<{
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
    if (users) {
      const foundUsers: Array<UserType> = [];
      meetings.invitedUsers.forEach((user: string) => {
        const findUser = users.find(
          (tempUser: UserType) => tempUser.uid === user
        );
        if (findUser) foundUsers.push(findUser);
      });
      setSelectedUsers(foundUsers);
    }
  }, [meetings, users]);

  const onUserChange = (selectedoptions: any) => {
    setSelectedUsers(selectedoptions);
  };

  const editMeeting = async () => {
    const editedMeeting = {
      ...meetings,
      meetingName,
      meetingType,
      invitedUsers: selectedUsers.map((user: UserType) => user.uid),
      maxUsers: size,
      meetingDate: StartDate.format("L"),
      status: !status,
    };
    delete editedMeeting.docId;
    const docRef = doc(firebaseDB, "meetings", meetings.docId!);
    await updateDoc(docRef, editedMeeting);
    createToast({ title: "meeting updated successfully", type: "success" });
    closedFlyout(true);
  };

  return (
    <EuiFlyout ownFocus onClose={() => closedFlyout()}>
      <EuiFlyoutHeader hasBorder>
        <EuiTitle size="m">
          <h2>{meetings.meetingName}</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiForm>
          <MeetingNameField
            label="Meeting Name"
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
              label="Invite User"
              options={users}
              onChange={onUserChange}
              selectedOptions={selectedUsers}
              isClearable={false}
              placeholder="select a user"
              singleSelection={
                meetingType === "1-on-1" ? { asPlainText: true } : false
              }
              isInvalid={showErrors.meetingUser.show}
              error={showErrors.meetingUser.message}
            />
          )}
          <MeetingDateField selected={StartDate} setStartDate={setStartDate} />
          <EuiFormRow display="columnCompressedSwitch" label="cancel meeting">
            <EuiSwitch
              showLabel={false}
              label="cancel meeting"
              checked={status}
              onChange={(e) => setStatus(e.target.checked)}
              compressed
            />
          </EuiFormRow>
          <EuiSpacer />
          <CreateMeetingButton
            createmeeting={editMeeting}
            isEdit={true}
            closedFlyout={closedFlyout}
          />
        </EuiForm>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
}

export default EditFlyout;

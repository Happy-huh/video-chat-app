import React, { useState } from "react";
import Header from "../components/Header";
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiSpacer,
  EuiSwitch,
} from "@elastic/eui";
import MeetingNameField from "../components/FormComponents/MeetingNameField";
import MeetingUsersField from "../components/FormComponents/MeetingUsersField";
import useAuth from "../hooks/useAuth";
import useFetchUsers from "../hooks/useFetchUsers";
import moment from "moment";
import MeetingDateField from "../components/FormComponents/MeetingDateField";
import CreateMeetingButton from "../components/FormComponents/CreateMeetingButton";
import { FieldErrorType, UserType } from "../utils/types";
import { addDoc } from "firebase/firestore";
import { meetingRef } from "../utils/FirebaseConfig";
import { generateMeetingId } from "../utils/generateMeetings";
import { useAppSelector } from "../App/hooks";
import { useNavigate } from "react-router-dom";
import UseToast from "../hooks/useToast";
import MeetingMaximumMeetingField from "../components/FormComponents/MeetingMaximumMeetingField";

function VideoConference() {
  useAuth();
  const [users] = useFetchUsers();
  const [createToast] = UseToast();
  const navigate = useNavigate();
  const [size, setSize] = useState(1);
  const [anyonecanjoin, setanyonecanjoin] = useState(false);
  const uid = useAppSelector((zoom) => zoom.auth.userInfo?.uid);
  const [meetingName, setMeetingName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Array<UserType>>([]);
  const [StartDate, setStartDate] = useState(moment());
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
    let errors = false;
    const clonedShowErrors = { ...showErrors };
    if (!meetingName.length) {
      clonedShowErrors.meetingName.show = true;
      clonedShowErrors.meetingName.message = ["Please Enter Meeting Name"];
      errors = true;
    } else {
      clonedShowErrors.meetingName.show = false;
      clonedShowErrors.meetingName.message = [];
    }
    if (!selectedUsers.length) {
      clonedShowErrors.meetingUser.show = true;
      clonedShowErrors.meetingUser.message = ["Please select a user"];
      errors = true;
    } else {
      clonedShowErrors.meetingUser.show = false;
      clonedShowErrors.meetingUser.message = [];
    }
    setShowErrors(clonedShowErrors);
    return errors;
  };

  const createmeeting = async () => {
    if (!validateForm()) {
      const meetingId = generateMeetingId();
      await addDoc(meetingRef, {
        createdBy: uid,
        meetingId,
        meetingName,
        meetingType: anyonecanjoin ? "anyone-can-join" : "video-conference",
        invitedUsers: anyonecanjoin
          ? []
          : selectedUsers.map((user: UserType) => user.uid),
        meetingDate: StartDate.format("L"),
        maxUsers: anyonecanjoin ? 100 : size,
        status: true,
      });
      createToast({
        title: anyonecanjoin
          ? "anyone can join meeting created successfully"
          : "video conference created successfully",
        type: "success",
      });
      navigate("/");
    }
  };

  const onUserChange = (selectedoptions: any) => {
    setSelectedUsers(selectedoptions);
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        flexDirection: "column",
        backgroundColor: "black",
      }}
    >
      <Header />
      <EuiFlexGroup justifyContent="center" alignItems="center">
        <EuiForm>
          <EuiFormRow display="columnCompressedSwitch" label="Anyone can join">
            <EuiSwitch
              showLabel={false}
              label="Anyone can join"
              checked={anyonecanjoin}
              onChange={(e) => setanyonecanjoin(e.target.checked)}
              compressed
            />
          </EuiFormRow>
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
              singleSelection={false}
              isInvalid={showErrors.meetingUser.show}
              error={showErrors.meetingUser.message}
            />
          )}
          <MeetingDateField selected={StartDate} setStartDate={setStartDate} />
          <EuiSpacer />
          <CreateMeetingButton
            isEdit={false}
            closedFlyout={() => ({})}
            createmeeting={createmeeting}
          />
        </EuiForm>
      </EuiFlexGroup>
    </div>
  );
}

export default VideoConference;
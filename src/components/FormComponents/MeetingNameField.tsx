import { EuiFieldText, EuiFormRow } from "@elastic/eui";
import React from "react";

function MeetingNameField({
  label,
  placeHolder,
  value,
  setMeetingName,
  isInvalid,
  error,
}: {
  label: string;
  placeHolder: string;
  value: string;
  setMeetingName: React.Dispatch<React.SetStateAction<string>>;
  isInvalid: boolean;
  error: Array<string>;
}) {
  return (
    <EuiFormRow label={label} isInvalid={isInvalid} error={error}>
      <EuiFieldText
        placeholder={placeHolder}
        value={value}
        onChange={(e) => setMeetingName(e.target.value)}
        isInvalid={isInvalid}
      />
    </EuiFormRow>
  );
}

export default MeetingNameField;

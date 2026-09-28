import { EuiFieldNumber, EuiFormRow } from "@elastic/eui";
import React from "react";

function MeetingMaximumMeetingField({
  value,
  setValue,
}: {
  value: number;
  setValue: React.Dispatch<React.SetStateAction<number>>;
}) {
  return (
    <EuiFormRow
      label="Maximum Participants"
      helpText="Enter maximum allowed capacity (1 - 50 participants)"
    >
      <EuiFieldNumber
        placeholder="e.g. 10"
        min={1}
        max={50}
        value={value}
        onChange={(e) => {
          const val = e.target.value;
          if (!val.length) {
            setValue(1);
          } else {
            const num = parseInt(val, 10);
            if (num > 50) setValue(50);
            else if (num < 1) setValue(1);
            else setValue(num);
          }
        }}
      />
    </EuiFormRow>
  );
}

export default MeetingMaximumMeetingField;

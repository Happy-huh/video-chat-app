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
    <EuiFormRow label="maximum people">
      <EuiFieldNumber
        placeholder="maximum people"
        min={1}
        max={50}
        value={value}
        onChange={(e) => {
          if (+e.target.value > 50) {
            setValue(50);
          } else if (+e.target.value < 1 || !e.target.value.length) {
            setValue(1);
          } else setValue(parseInt(e.target.value));
        }}
      />
    </EuiFormRow>
  );
}

export default MeetingMaximumMeetingField;

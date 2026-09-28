import { EuiButton, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import React from "react";
import { useNavigate } from "react-router-dom";

function CreateMeetingButton({
  createmeeting,
  isEdit,
  closedFlyout,
}: {
  createmeeting: () => void;
  isEdit: boolean;
  closedFlyout?: (dataChanged?: boolean) => void;
}) {
  const navigate = useNavigate();

  return (
    <EuiFlexGroup gutterSize="m" responsive={false}>
      <EuiFlexItem>
        <EuiButton
          color="danger"
          onClick={() => (isEdit && closedFlyout ? closedFlyout(false) : navigate("/"))}
        >
          Cancel
        </EuiButton>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiButton
          fill
          color="primary"
          iconType="check"
          onClick={createmeeting}
        >
          {isEdit ? "Save Changes" : "Create Meeting"}
        </EuiButton>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}

export default CreateMeetingButton;

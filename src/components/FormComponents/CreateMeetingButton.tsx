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
  closedFlyout: () => {};
}) {
  const navigate = useNavigate();
  return (
    <EuiFlexGroup>
      <EuiFlexItem>
        <EuiButton
          color="danger"
          fill
          onClick={() => (isEdit ? closedFlyout!() : navigate("/"))}
        >
          Cancel
        </EuiButton>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiButton fill onClick={createmeeting}>
          {isEdit ? "Edit meeting" : "Create meeting"}
        </EuiButton>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}

export default CreateMeetingButton;

import { NavigateFunction } from "react-router-dom";
import { BreadCrumbsType } from "./types";

export const getCreateMeetingBreadCrumbs = (
  navigate: NavigateFunction
): Array<BreadCrumbsType> => [
  { text: "Dashboard", href: "#", onClick: () => navigate("/") },
  { text: "Create Meeting" },
];

export const getOneOnOneMeetingBreadCrumbs = (
  navigate: NavigateFunction
): Array<BreadCrumbsType> => [
  { text: "Dashboard", href: "#", onClick: () => navigate("/") },
  { text: "Create Meeting", href: "#", onClick: () => navigate("/createmeeting") },
  { text: "1-on-1 Meeting" },
];

export const getVideoConferenceBreadCrumbs = (
  navigate: NavigateFunction
): Array<BreadCrumbsType> => [
  { text: "Dashboard", href: "#", onClick: () => navigate("/") },
  { text: "Create Meeting", href: "#", onClick: () => navigate("/createmeeting") },
  { text: "Video Conference" },
];

// Alias for backward compatibility
export const getVideoConfernceBreadCrumbs = getVideoConferenceBreadCrumbs;

export const getMyMeetingsBreadCrumbs = (
  navigate: NavigateFunction
): Array<BreadCrumbsType> => [
  { text: "Dashboard", href: "#", onClick: () => navigate("/") },
  { text: "My Meetings" },
];

export const getMeetingsBreadCrumbs = (
  navigate: NavigateFunction
): Array<BreadCrumbsType> => [
  { text: "Dashboard", href: "#", onClick: () => navigate("/") },
  { text: "All Invitations" },
];
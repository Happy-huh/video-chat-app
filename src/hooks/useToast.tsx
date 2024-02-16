import React from "react";
import { useAppDispatch, useAppSelector } from "../App/hooks";
import { setToasts } from "../App/slices/meetingSlice";

function UseToast() {
  const toasts = useAppSelector((zoom) => zoom.meetings.toasts);
  const dispatch = useAppDispatch();
  const createToast = ({ title, type }: { title: string; type: any }) => {
    dispatch(
      setToasts(
        toasts.concat({
          id: new Date().toISOString(),
          title,
          color: type,
        })
      )
    );
  };
  return [createToast];
}

export default UseToast;

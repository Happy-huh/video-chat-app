import { useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../App/hooks";
import { setToasts } from "../App/slices/meetingSlice";

function UseToast() {
  const toasts = useAppSelector((zoom) => zoom.meetings.toasts);
  const dispatch = useAppDispatch();

  // Keep a ref to always have the latest toasts, avoiding stale closures
  const toastsRef = useRef(toasts);
  toastsRef.current = toasts;

  const createToast = useCallback(
    ({ title, type }: { title: string; type: any }) => {
      dispatch(
        setToasts(
          toastsRef.current.concat({
            id: new Date().toISOString() + Math.random(),
            title,
            color: type,
          })
        )
      );
    },
    [dispatch]
  );

  return [createToast];
}

export default UseToast;

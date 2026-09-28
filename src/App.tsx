import {
  EuiGlobalToastList,
  EuiProvider,
  EuiThemeProvider,
} from "@elastic/eui";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import "@elastic/eui/dist/eui_theme_light.css";
import "@elastic/eui/dist/eui_theme_dark.css";
import { Routes, Route } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./App/hooks";
import CreateMeeting from "./pages/CreateMeeting";
import OneonOneMeeting from "./pages/OneonOneMeeting";
import { setToasts } from "./App/slices/meetingSlice";
import VideoConference from "./pages/VideoConference";
import MyMeetings from "./pages/MyMeetings";
import Meeting from "./pages/Meeting";
import JoinMeeting from "./pages/JoinMeeting";

function App() {
  const toasts = useAppSelector((zoom) => zoom.meetings.toasts);
  const dispatch = useAppDispatch();
  const isDarkTheme = useAppSelector((zoom) => zoom.auth.isDarkTheme);

  const overrides = {
    colors: {
      LIGHT: { primary: "#0b5cff" },
      DARK: { primary: "#0b5cff" },
    },
  };

  const removeToast = (removedToast: { id: string }) => {
    dispatch(
      setToasts(
        toasts.filter((toast: { id: string }) => toast.id !== removedToast.id)
      )
    );
  };

  const colorMode = isDarkTheme ? "dark" : "light";

  return (
    <EuiProvider colorMode={colorMode}>
      <EuiThemeProvider colorMode={colorMode} modify={overrides}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/createmeeting" element={<CreateMeeting />} />
          <Route path="/oneononemeeting" element={<OneonOneMeeting />} />
          <Route path="/videoconference" element={<VideoConference />} />
          <Route path="/mymeetings" element={<MyMeetings />} />
          <Route path="/meeting" element={<Meeting />} />
          <Route path="/join/:id" element={<JoinMeeting />} />
          <Route path="/*" element={<Dashboard />} />
        </Routes>
        <EuiGlobalToastList
          toasts={toasts}
          dismissToast={removeToast}
          toastLifeTimeMs={5000}
        />
      </EuiThemeProvider>
    </EuiProvider>
  );
}

export default App;

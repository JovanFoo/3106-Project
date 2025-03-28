import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { ScrollToTop } from "./components/common/ScrollToTop";
import AppLayout from "./layout/AppLayout";
import Analytics from "./pages/Analytics";
import Appointments from "./pages/Appointments";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import ForgetPassword from "./pages/AuthPages/ForgetPassword";
import Blank from "./pages/Blank";
import Calendar from "./pages/Calendar";
// import BarChart from "./pages/Charts/BarChart";
// import LineChart from "./pages/Charts/LineChart";
import Home from "./pages/Dashboard/Home";
import NotFound from "./pages/OtherPage/NotFound";
import ChangePassword from "./pages/Settings/ChangePassword";
import Expertise from "./pages/Settings/Expertise";
import Notifications from "./pages/Settings/Notifications";
import Portfolio from "./pages/Settings/Portfolio";
import Testimonials from "./pages/Settings/Testimonials";
import ShopSettings from "./pages/ShopSettings";
import Teams from "./pages/Teams";
import Transactions from "./pages/Transactions";
// import Alerts from "./pages/UiElements/Alerts";
// import Avatars from "./pages/UiElements/Avatars";
// import Badges from "./pages/UiElements/Badges";
// import Buttons from "./pages/UiElements/Buttons";
// import Images from "./pages/UiElements/Images";
// import Videos from "./pages/UiElements/Videos";
import UserProfiles from "./pages/UserProfiles";
import LeaveManagement from "./pages/LeaveManagement";
import LeaveDocumentApproval from "./pages/LeaveDocumentApproval";
import EmergencyLeaveManagement from "./pages/EmergencyLeaveManagement";
import { useEffect } from "react";
import axios, { AxiosResponse } from "axios";

const api_address = import.meta.env.VITE_APP_API_ADDRESS_PROD;
// const api_address = import.meta.env.VITE_APP_API_ADDRESS_DEV;
const config = {
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
  },
};
export default function App() {
  useEffect(() => {
    const refreshTokenFunction = () => {
      console.log("refreshing token");
      const jwttoken = sessionStorage.getItem("token");
      const refreshToken = sessionStorage.getItem("refreshToken");
      if (jwttoken) {
        axios
          .post(
            `${api_address}/api/auth/refresh-token`,
            { token: refreshToken },
            config
          )
          .then((res: AxiosResponse) => {
            sessionStorage.setItem("token", res.data.token);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    };
    refreshTokenFunction();
    setInterval(() => {
      refreshTokenFunction();
    }, 1000 * 60 * 15);
  }, []);
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />

            {/* Main Page */}
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/shopSettings" element={<ShopSettings />} />

            {/* Leave Management Routes */}
            <Route path="/leave-management" element={<LeaveManagement />} />
            <Route
              path="/emergency-leave"
              element={<EmergencyLeaveManagement />}
            />
            <Route
              path="/leave-document-approval"
              element={<LeaveDocumentApproval />}
            />

            {/* Settings */}
            <Route
              path="/settings"
              element={<Navigate to="/settings/profile" replace />}
            />
            <Route path="/settings/profile" element={<UserProfiles />} />
            <Route
              path="/settings/change-password"
              element={<ChangePassword />}
            />
            <Route path="/settings/notifications" element={<Notifications />} />
            <Route path="/settings/expertise" element={<Expertise />} />
            <Route path="/settings/portfolio" element={<Portfolio />} />
            <Route path="/settings/testimonials" element={<Testimonials />} />

            {/* Other Routes */}
            <Route path="/expertise-pricing" element={<Expertise />} />
            <Route path="/ratings-reviews" element={<Testimonials />} />
            <Route path="/blank" element={<Blank />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/reset-password" element={<ForgetPassword />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}

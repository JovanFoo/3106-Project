import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Calendar from "./pages/Calendar";
import Blank from "./pages/Blank";
import BasicTables from "./pages/Tables/BasicTables";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { Navigate } from "react-router";
import ReviewsList from "./pages/ReviewsList";
import "react-toastify/dist/ReactToastify.css";
import ResetPassword from "./components/auth/resetpassword";
import PastApptsPage from "./pages/PastApptsPage";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />

        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            {/* Re-routing, front page as /appointments */}
            <Route index path="/" element={<Navigate to="/signin" />} />
            <Route
              index
              path="/home"
              element={<Navigate to="/appointments" />}
            />

            {/* Main Pages */}
            <Route path="/appointments" element={<Calendar />} />
            <Route path="/viewappointments" element={<PastApptsPage />} />
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/reviews" element={<ReviewsList />} />
            <Route path="/blank" element={<Blank />} />

            {/* Tables */}
            <Route path="/allstylists" element={<BasicTables />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
          <Route path="/resetpassword" element={<ResetPassword />} />
        </Routes>
      </Router>
    </>
  );
}

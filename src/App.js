import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Register from "./components/auth_flow/Register";
import VerifyOtp from "./components/auth_flow/VerifyOtp";
import Login from "./components/auth_flow/Login";
import ForgetPassword from "./components/auth_flow/ForgetPassword";
import ResetPassword from "./components/auth_flow/ResetPassword";

import UserHome from "./components/user/UserHome";
import EditProfile from "./components/user/EditProfile"
import UserDetails from "./components/user/UserDetails"

import AddPost from "./components/post/AddPost";
import MyPost from "./components/post/MyPost";
import MyFavPost from "./components/post/MyFavPost";
import Messages from "./components/messages/Messages";
import Settings from './components/messages/Settings'
import Notifications from "./components/messages/Notifications";
// import Dashboard from "./components/auth_flow/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">
        {/* <Header /> */}
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgetPassword />} />
            <Route path='/reset-password' element={<ResetPassword />} />



            {/* User */}
            <Route path="/home" element={<UserHome />} />
            <Route path="/edit-profile" element={<EditProfile />} />

            <Route path="/details" element={<UserDetails />} />

            {/* posts */}
            <Route path="/add-post" element={<AddPost />} />
            <Route path="/my-posts" element={<MyPost />} />
            <Route path="/favourite" element={<MyFavPost />} />

            {/* messages */}
            <Route path="/messages" element={<Messages />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/notifications" element={<Notifications />} />




          </Routes>
        </main>
        {/* <Footer /> */}
      </div>
    </BrowserRouter>
  );
}

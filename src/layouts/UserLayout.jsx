import { Outlet } from "react-router-dom";
import Navbar from "../components/user/Navbar";
import Footer from "../components/user/Footer";
import BottomNav from "../components/user/BottomNav";

function UserLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
      <BottomNav />
    </>
  );
}

export default UserLayout;

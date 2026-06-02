import axios from "axios";
import { useEffect, useState } from "react";
import Header from "../components/Header";
import MainContent from "../components/MainContent";
import SideBar from "../components/Sidebar";

const HomePage = ({ onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const access_token = localStorage.getItem("access_token");
        if (access_token) {
          config.headers["access_token"] = access_token;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  return (
    <>
      <Header 
        onLogout={onLogout} 
        onToggleSidebar={toggleSidebar}
      />
      <SideBar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <MainContent isSidebarOpen={isSidebarOpen} />
    </>
  );
};

export default HomePage;
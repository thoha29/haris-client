import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import 'remixicon/fonts/remixicon.css';

import { useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import Login from "./pages/LoginPage/login";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <>
      {isLoggedIn ? (
        <HomePage
          onLogout={() => {
            localStorage.removeItem("access_token");
            setIsLoggedIn(false);
          }}
        />
      ) : (
        <Login onLogin={() => setIsLoggedIn(true)} />
      )}
    </>
  );
}

export default App;

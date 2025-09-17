import { useState, useEffect } from "react";
import Header from "../Header";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const dummyData = [
      { id: "68b2a15b54231ae3e3813aea", user: "john_doe", message: "liked your photo.", avatar: "https://i.pravatar.cc/150?img=1", date: "2h" },
      { id:  "68b468ee42745ee18c2a10df", user: "jane_smith", message: "started following you.", avatar: "https://i.pravatar.cc/150?img=2", date: "1d" },
      { id: "68b91e33f402b87da8abbc51", user: "mike89", message: "commented: Awesome!", avatar: "https://i.pravatar.cc/150?img=3", date: "3d" },
      { id: "68b2a15b54231ae3e3813aea", user: "system", message: "Updated our privacy policy.", avatar: "https://i.pravatar.cc/150?img=4", date: "1w" },
      { id: "68b2a15b54231ae3e3813aea", user: "alice_w", message: "liked your photo.", avatar: "https://i.pravatar.cc/150?img=5", date: "4h" },
      { id: "68b2a15b54231ae3e3813aea", user: "charlie_k", message: "sent you a message.", avatar: "https://i.pravatar.cc/150?img=6", date: "5d" },
    ];
    setNotifications(dummyData);
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />

      <div className="container my-4">
        <div className="d-flex justify-content-center">
          <div className="w-100" style={{ maxWidth: "600px" }}>
            <div
              style={{
                height: "calc(100vh - 80px - 32px)", // 80px = approx Header height, 32px = my-4 top/bottom margin
                overflowY: "auto",
                scrollbarWidth: "none", // Firefox
                msOverflowStyle: "none", // IE 10+
              }}
              className="hide-scrollbar"
            >
              {notifications.length ? (
                notifications.map((notif, idx) => (
                  <div
                    key={idx}
                    className="d-flex align-items-center p-3 shadow-sm mb-2 rounded"
                    style={{
                      backgroundColor: "var(--bs-light)",
                      transition: "background 0.3s",
                    }}
                  >
                    <img
                      src={notif.avatar}
                      alt="avatar"
                      className="rounded-circle me-3"
                      style={{ width: "50px", height: "50px", objectFit: "cover" }}
                    />
                    <div className="flex-grow-1">
                      <span className="fw-bold">{notif.user}</span>{" "}
                      <span>{notif.message}</span>
                    </div>
                    <small className="text-muted ms-3">{notif.date}</small>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted">No notifications yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar {
            display: none; /* Chrome, Safari, Opera */
          }
        `}
      </style>
    </div>
  );
}

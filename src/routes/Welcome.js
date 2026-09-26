import { useState, useEffect } from "react";

function Welcome({ token, handleLogout }) {
  const [message, setMessage] = useState("Welcome 👋");
  const [loading, setLoading] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
  const [loadingWatchlist, setLoadingWatchlist] = useState(true);

  // Fetch the welcome message and watchlist
  const fetchMessage = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/welcome`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMessage(data.message);
    } catch {
      setMessage("Failed to load message");
    } finally {
      setLoading(false);
    }
  };

  const fetchWatchlist = async () => {
    setLoadingWatchlist(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/watchlist`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      setWatchlist(data);
    } catch {
      console.error("Error fetching watchlist");
    } finally {
      setLoadingWatchlist(false);
    }
  };

  useEffect(() => {
    fetchMessage();
    fetchWatchlist(); // Fetch watchlist after login
  }, [token]);

  return (
    <div className="page-center">
      <div className="card">
        <h1>{message}</h1>

        <div className="actions">
          <button className="btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* Display the watchlist */}
        <div className="watchlist">
          {loadingWatchlist ? (
            <p>Loading your watchlist...</p>
          ) : (
            <div>
              <h3>Your Watchlist</h3>
              <ul>
                {watchlist.length > 0 ? (
                  watchlist.map((item, index) => (
                    <li key={index}>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <strong>{item.name}</strong> ({item.ticker})
                      </a>
                    </li>
                  ))
                ) : (
                  <p>You don't have any stocks in your watchlist yet.</p>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Welcome;

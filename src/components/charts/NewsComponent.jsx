import { useState, useEffect } from "react";

function NewsComponent() {
  const [news, setNews] = useState([]); // Stores the news data
  const [isLoading, setIsLoading] = useState(false); // Tracks loading state
  const [page, setPage] = useState(1); // Tracks the current page
  const apiToken = import.meta.env.VITE_NEWS_API_TOKEN; // API token
  const symbols = "msft,fb"; // Add symbols as needed
  const limit = 3; // Limit the number of news items to fetch
  const language = "en"; // Language code (e.g., "en", "es", "fr")

  // Function to fetch news
  const fetchNews = async () => {
    setIsLoading(true);
    try {
      const requestOptions = {
        method: "GET",
      };
      const params = {
        api_token: apiToken,
        symbols: symbols,
        limit: limit,
        page: page,
        language: language,
      };

      const query = Object.keys(params)
        .map(
          (key) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
        )
        .join("&");

      const response = await fetch(
        `https://api.marketaux.com/v1/news/all?${query}`,
        requestOptions
      );
      const result = await response.json();

      // Set news data (ensure data structure matches your component needs)
      if (result && result.data) {
        const formattedNews = result.data.map((item, index) => ({
          id: index,
          title: item.title,
          image: item.image_url || "https://via.placeholder.com/500", // Fallback image
          source: item.source || "Unknown",
          timeAgo: new Date(item.published_at).toLocaleString() || "N/A",
          url: item.url || "#", // URL to the full article
        }));
        // Save the fetched data to localStorage to prevent re-fetching on refresh
        localStorage.setItem("news", JSON.stringify(formattedNews));
        setNews(formattedNews); // Update the state with new news data
      } else {
        setNews([]); // No news available
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      setNews([]); // Reset news in case of error
    } finally {
      setIsLoading(false);
    }
  };

  // Check if the news is already in localStorage on component mount
  useEffect(() => {
    const storedNews = localStorage.getItem("news");
    if (storedNews) {
      setNews(JSON.parse(storedNews)); // Use the stored news from localStorage
    } else {
      fetchNews(); // Fetch news if not available in localStorage
    }
  }, []); // Empty dependency array ensures this effect runs only once

  // Refresh news on button click
  const refreshNews = () => {
    setPage(page + 1); // Increment the page number to fetch next set of news
    fetchNews(); // Fetch new news on refresh button click
  };

  return (
    <div className="w-full max-w-[500px] mx-auto bg-gradient-to-r from-[rgba(126,126,126,0.2)] to-[rgba(173,173,173,0.2)] rounded-lg transition-all duration-300 p-5">
      <div className="flex justify-between items-center mb-4 px-2">
        <h2 className="text-xl text-white">Latest News</h2>
        <button
          onClick={refreshNews}
          disabled={isLoading}
          className="px-2 py-1 bg-[#1c1c1c] text-white rounded-lg transition-colors duration-300 hover:opacity-80 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? "Refreshing..." : "↻"}
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {news.length > 0 ? (
          news.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="relative overflow-hidden transition-all duration-300 ease-in-out min-h-[80px] cursor-pointer rounded-xl hover:min-h-[300px] group"
            >
              <div
                className="absolute inset-0 bg-cover bg-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ backgroundImage: `url(${item.image})` }}
              />
              <div className="relative z-[2] h-full flex p-4 gap-4 transition-all duration-300 ease-in-out group-hover:bg-gradient-to-b group-hover:from-transparent group-hover:to-black/80 group-hover:items-end">
                <div className="flex-1 transition-all duration-300">
                  <div className="flex gap-2 items-center mb-2">
                    <span className="text-sm font-medium text-gray-300 group-hover:text-white">
                      {item.source}
                    </span>
                    <span className="text-sm text-gray-400 group-hover:text-gray-200">
                      {item.timeAgo}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-white leading-snug m-0 transition-all duration-300 group-hover:text-white group-hover:text-lg">
                    {item.title}
                  </h3>
                </div>
                <div className="w-[60px] h-[60px] flex-shrink-0 transition-opacity duration-300 group-hover:opacity-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              </div>
            </a>
          ))
        ) : (
          <p className="text-center text-gray-500">
            No news available. Please try refreshing.
          </p>
        )}
      </div>
    </div>
  );
}

export default NewsComponent;

import React, { useState, useEffect } from "react";
import { Globe2, ChevronDown, ArrowDown } from "lucide-react";

const CURRENCIES = [
  {
    code: "USD",
    name: "US Dollar",
    flagUrl: "https://flagcdn.com/w40/us.png",
    symbol: "$",
  },
  {
    code: "EUR",
    name: "Euro",
    flagUrl: "https://flagcdn.com/w40/eu.png",
    symbol: "€",
  },
  {
    code: "GBP",
    name: "British Pound",
    flagUrl: "https://flagcdn.com/w40/gb.png",
    symbol: "£",
  },
  {
    code: "JPY",
    name: "Japanese Yen",
    flagUrl: "https://flagcdn.com/w40/jp.png",
    symbol: "¥",
  },
  {
    code: "AUD",
    name: "Australian Dollar",
    flagUrl: "https://flagcdn.com/w40/au.png",
    symbol: "$",
  },
  {
    code: "CAD",
    name: "Canadian Dollar",
    flagUrl: "https://flagcdn.com/w40/ca.png",
    symbol: "$",
  },
  {
    code: "CHF",
    name: "Swiss Franc",
    flagUrl: "https://flagcdn.com/w40/ch.png",
    symbol: "CHF",
  },
];

const API_KEY = import.meta.env.VITE_EXCHANGE_API_KEY;
const BASE_URL = "https://v6.exchangerate-api.com/v6";

function CurrencyWidget() {
  const [baseCurrency, setBaseCurrency] = useState("USD");
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${BASE_URL}/${API_KEY}/latest/${baseCurrency}`
        );
        const data = await response.json();

        if (data && data.conversion_rates) {
          const newRates = Object.entries(data.conversion_rates)
            .filter(([code]) => code !== baseCurrency)
            .map(([code, rate]) => ({ code, rate: Number(rate) }))
            .filter((rate) => CURRENCIES.some((c) => c.code === rate.code));
          setRates(newRates);
        }
      } catch (error) {
        console.error("Error fetching rates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, [baseCurrency]);

  const getCurrencyInfo = (code) =>
    CURRENCIES.find((c) => c.code === code) || {
      code,
      name: code,
      flagUrl: "",
      symbol: code,
    };

  const handleCurrencySelect = (code) => {
    setBaseCurrency(code);
    setIsOpen(false);
  };

  const selectedCurrency = getCurrencyInfo(baseCurrency);

  return (
    <div className="relative min-w-[300px] pt-5 pr-5 pl-5 pb-5 mr-3 mb-3 bg-gradient-to-r from-[rgba(126,126,126,0.2)] to-[rgba(173,173,173,0.2)] rounded-lg max-h-[400px] overflow-hidden group">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl">Today's Rates</h2>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 bg-[#1C1C1C] px-2 py-1 rounded-md hover:opacity-80 transition-colors"
          >
            <Globe2 size={16} />
            <span className="flex items-center gap-2">
              <span>1 {baseCurrency}</span>
            </span>
            <ChevronDown
              size={16}
              className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#1C1C1C] opacity-95 rounded-xl shadow-lg py-2 z-10">
              {CURRENCIES.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => handleCurrencySelect(currency.code)}
                  className={`w-full px-4 py-2 text-left hover:bg-white/10 flex items-center gap-2
                    ${currency.code === baseCurrency ? "bg-white/5" : ""}`}
                >
                  <img
                    src={currency.flagUrl}
                    alt={`${currency.code} flag`}
                    className="w-6 h-4 rounded-sm"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{currency.code}</span>
                    <span className="text-sm text-gray-400">
                      {currency.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3 max-h-[300px] p-2 pr-3 overflow-y-auto overflow-x-hidden scrollbar-hide">
        {loading ? (
          <p className="text-center">Loading rates...</p>
        ) : (
          rates.map((rate) => {
            const currency = getCurrencyInfo(rate.code);
            return (
              <div
                key={rate.code}
                className={`p-4 rounded-2xl transition-all hover:scale-105 bg-white/10`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={currency.flagUrl}
                      alt={`${currency.code} flag`}
                      className="w-6 h-4 rounded-sm"
                    />
                  </div>
                  <div className="flex flex-col justify-between">
                    <div className="flex flex-row">
                      <p className="font-xs">{currency.name}</p>
                    </div>
                    <div className="flex justify-between gap-3 text-sm font-semibold">
                      <div className="text-2xl font-normal">{rate.code}</div>
                      <div className="text-2xl text-green-300">
                        {currency.symbol} {rate.rate.toFixed(5)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default CurrencyWidget;

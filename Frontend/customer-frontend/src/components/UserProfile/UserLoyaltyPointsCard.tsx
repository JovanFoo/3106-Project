import { useState, useEffect } from "react";
const API_URL = import.meta.env.VITE_API_URL;

export default function UserLoyaltyPointsCard() {
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);

  useEffect(() => {
    async function fetchUserData() {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);

        try {
          const response = await fetch(
            `${API_URL}/api/customers/${user.customer._id}`,
            {
              method: "GET",
              headers: {
                Authorization: `${user.tokens.token}`,
              },
            }
          );
          const data = await response.json();
          if (response.ok) {
            setLoyaltyPoints(data.loyaltyPoints);
          } else {
            console.error(data);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    }

    fetchUserData();
  }, []);

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Loyalty Points:
          </h4>
          <p className="text-gray-700 dark:text-white">
            You currently have{" "}
            <strong className="text-blue-600 dark:text-blue-400 font-bold">
              {loyaltyPoints} {loyaltyPoints === 1 ? "Point" : "Points"}
            </strong>
            ! Book appointments using our site and earn more for discounts!
          </p>
        </div>
      </div>
    </div>
  );
}

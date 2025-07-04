import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import SettingsSidebar from "../SettingsPage/SettingsSidebar";
import axios from "axios";

type Review = {
  _id: number;
  text: string;
  stars: number;
  customer: string;
  title: string;
};

// const api_address = import.meta.env.VITE_APP_API_ADDRESS_PROD;
const api_address = import.meta.env.VITE_APP_API_ADDRESS_DEV;

export default function ClientTestimonials() {
  const config = {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
      Authorization: sessionStorage.getItem("token"),
    },
  };
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avegeRating, setAverageRating] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  // const [recommendations, setRecommendations] = useState<number>(0);
  useEffect(() => {
    const selfId = sessionStorage.getItem("stylistId");
    const fetchReviews = async () => {
      try {
        const res = await axios.get(
          `${api_address}/api/reviews/${selfId}/stylistReviews`,
          config
        );
        setReviews(res.data);
        console.log(res.data);
        const reviews1: Review[] = res.data;
        setTotalReviews(reviews1.length);
        const avg =
          reviews1.map((review) => review.stars).reduce((a, b) => a + b, 0) /
          reviews1.length;
        setAverageRating(avg || 0);
        // const recommendationsCount =
        //   (reviews1.filter((review) => review.stars >= 4).length /
        //     reviews1.length) *
        //   100;
        // setRecommendations(recommendationsCount);
      } catch (err) {
        console.log(err);
      }
    };
    fetchReviews();
  }, []);
  return (
    <div className="flex">
      <SettingsSidebar />
      <div className="flex-1 p-5">
        <PageBreadcrumb pageTitle="Client Testimonials" />
        <div className="rounded-2xl  min-h-[80vh] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          {/* <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Client Testimonials
          </h4> */}

          {/* Summary Section */}
          <div className="p-4 bg-gray-100 dark:bg-black rounded-lg mb-6">
            <h5 className="text-md font-semibold mb-2 dark:text-white">
              Summary
            </h5>
            <div className="text-lg font-bold  dark:text-white">
              {avegeRating} ⭐
            </div>
            <p className="text-sm text-gray-500  dark:text-white">
              {totalReviews} Reviews
            </p>
            {/* <p className="text-sm text-gray-500">
              {recommendations.toFixed(2)}% Recommended
            </p> */}
          </div>

          {/* Reviews Grid */}
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 ${
              reviews && reviews.length > 0 && "overflow-auto"
            }`}
          >
            {reviews &&
              reviews.map((review) => (
                <div
                  key={review._id}
                  className="p-4 border rounded-lg shadow-sm"
                >
                  <div className="flex items-center mb-2">
                    <span className="text-sm font-medium dark:text-white">
                      {review.customer}
                    </span>
                    <span className="text-xs text-gray-500 ml-2 dark:text-white">
                      {review.stars.toString()} ⭐
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mb-1 dark:text-white">
                    {review.title}
                  </div>
                  <div className="text-yellow-500 dark:text-white">
                    {"⭐".repeat(review.stars)}
                  </div>
                  {/* <h5 className="font-semibold text-sm mt-2">{review.text}</h5> */}
                  <p className="text-xs text-gray-600 mt-1 dark:text-white">
                    {review.text}
                  </p>
                </div>
              ))}
            {(reviews.length === 0 || reviews === undefined) && (
              <div className="col-span-1 md:col-span-2 lg:col-span-5 p-4 border rounded-lg shadow-sm text-center">
                <p className="text-gray-500">No reviews available.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

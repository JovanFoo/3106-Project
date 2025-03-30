import axios from "axios";
import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

type Review = {
    _id: number;
    text: string;
    stars: number;
    customer: string;
    title: string;
};

const api_address = import.meta.env.VITE_APP_API_ADDRESS_DEV;

export default function ClientTestimonials() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [averageRating, setAverageRating] = useState<number>(0);
    const [totalReviews, setTotalReviews] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    const config = {
        headers: {
            Authorization: sessionStorage.getItem("token"),
        },
    };

    useEffect(() => {
        const selfId = sessionStorage.getItem("stylistId");
        const fetchReviews = async () => {
            try {
                const res = await axios.get(`${api_address}/api/reviews/${selfId}/stylistReviews`, config);
                const data: Review[] = res.data || [];

                setReviews(data);
                setTotalReviews(data.length);

                const avg = data.length
                    ? data.map((r) => r.stars).reduce((a, b) => a + b, 0) / data.length
                    : 0;

                setAverageRating(avg);
            } catch (err) {
                console.error("Error fetching reviews:", err);
                setErrorMsg("Failed to load reviews.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchReviews();
    }, []);

    if (isLoading) return <p className="text-gray-500">Loading reviews...</p>;
    if (errorMsg) return <p className="text-red-500">{errorMsg}</p>;

    return (
        <div className="flex min-h-screen mr-4">
            <div className="flex-1 p-5">
                <PageBreadcrumb pageTitle="Client Testimonials" />

                <div className="space-y-4">
                    {/* Summary */}
                    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <h5 className="text-md font-semibold mb-1 text-gray-800 dark:text-white">Summary</h5>
                        <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{averageRating.toFixed(1)} ⭐</div>
                        <p className="text-sm text-gray-500">{totalReviews} Reviews</p>
                    </div>

                    {/* Reviews */}
                    {reviews.length === 0 ? (
                        <p className="text-gray-500 italic">No reviews available.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {reviews.map((review) => (
                                <div key={review._id} className="p-4 rounded-lg border shadow-sm">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-gray-800 dark:text-white">{review.customer}</span>
                                        <span className="text-xs text-gray-500">{review.stars} ⭐</span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold">{review.title}</p>
                                    <p className="text-xs text-gray-500 mt-1">{review.text}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

import axios from "axios";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";

type Review = {
  _id: string;
  text: string;
  stars: number;
  customer: string;
  title: string;
};
type Props = {
  stylist: { _id: string }; // only requires _id from Teams.tsx
};
const api_address = import.meta.env.VITE_APP_API_ADDRESS_DEV;

export default function ClientTestimonials({ stylist }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  const config = {
    headers: {
      Authorization: sessionStorage.getItem("token"),
    },
  };

  useEffect(() => {
    const selfId = stylist._id;
    const fetchReviews = async () => {
      try {
        const res = await axios.get(
          `${api_address}/api/reviews/${selfId}/stylistReviews`,
          config
        );
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

  const confirmDeleteReview = (id: string) => {
    setReviewToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    try {
      await axios.delete(
        `${api_address}/api/reviews/${reviewToDelete}/admin`,
        config
      );
      // Remove the deleted review from the state
      setReviews((prev) => prev.filter((r) => r._id !== reviewToDelete));
      setTotalReviews((prev) => prev - 1);
      const remaining = reviews.filter((r) => r._id !== reviewToDelete);
      const avg =
        remaining.length > 0
          ? remaining.map((r) => r.stars).reduce((a, b) => a + b, 0) /
            remaining.length
          : 0;
      setAverageRating(avg);
      toast.success("Review deleted successfully.");
    } catch (err) {
      console.error("Failed to delete review:", err);
      toast.error("Failed to delete review.");
    }
  };

  if (isLoading) return <p className="text-gray-500">Loading reviews...</p>;
  if (errorMsg) return <p className="text-red-500">{errorMsg}</p>;

  return (
    <div className="flex  mr-4">
      <div className="flex-1 p-5 mr-4">
        <PageBreadcrumb pageTitle="Client Testimonials" />

        <div className="space-y-4">
          {/* Summary */}
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h5 className="text-md font-semibold mb-1 text-gray-800 dark:text-white">
              Summary
            </h5>
            <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
              {averageRating.toFixed(1)} ⭐
            </div>
            <p className="text-sm text-gray-500">{totalReviews} Reviews</p>
          </div>

          {/* Reviews */}
          {reviews.length === 0 ? (
            <p className="text-gray-500 italic">No reviews available.</p>
          ) : (
            <div className="max-h-[400px] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="p-4 rounded-lg border shadow-sm"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-800 dark:text-white">
                      {review.customer}
                    </span>
                    <span className="text-xs text-gray-500">
                      {review.stars} ⭐
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold">
                    {review.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{review.text}</p>
                  <Button
                    className="mt-2 w-full"
                    size="sm"
                    type="danger"
                    onClick={() => confirmDeleteReview(review._id)}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
            </div>
          )}
        </div>

        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          className="max-w-md p-6"
        >
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4 dark:text-white">
              Confirm Delete
            </h4>
            <p className="text-sm text-gray-600 mb-6 dark:text-white">
              Are you sure you want to delete this review? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="outline"
                type="danger"
                onClick={() => handleDelete()}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        className={"z-999999"}
      />
    </div>
  );
}

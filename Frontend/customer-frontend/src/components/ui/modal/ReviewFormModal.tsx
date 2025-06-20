import React, { useState, useEffect } from "react";
import { Star } from "lucide-react"; // or any other star icon lib you use

interface Review {
  _id?: string;
  title: string;
  text: string;
  stars: number;
  stylist: {
    name: string;
  };
  customer: {
    username: string;
  };
}

interface ReviewFormModalProps {
  review?: Review | null; // if undefined, means this is a new review
  onClose: () => void;
  onSubmit: (formData: { title: string; text: string; stars: number }) => void;
  onDelete?: () => void; // optional callback for deleting a review
}

const ReviewFormModal: React.FC<ReviewFormModalProps> = ({
  review,
  onClose,
  onSubmit,
  onDelete,
}) => {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [stars, setStars] = useState(0);
  const [ratingError, setRatingError] = useState("");

  useEffect(() => {
    if (review) {
      setTitle(review.title);
      setText(review.text);
      setStars(review.stars);
    }
  }, [review]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (stars === 0) {
      setRatingError(
        "Please select a star rating (out of 5) before submitting."
      );
      return;
    }

    setRatingError("");

    onSubmit({ title, text, stars });
  };

  const handleDelete = () => {
    if (onDelete && review?._id) {
      onDelete();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-99999"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white dark:bg-gray-800 max-w-lg w-full p-6 rounded-xl shadow-xl relative text-gray-800 dark:text-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl font-bold transition-colors"
          aria-label="Close"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {review ? "Edit Review" : "Add Review"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">
              Title
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">
              Review Text
            </label>
            <textarea
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              rows={5}
            />
          </div>

          <div className="flex justify-center">
            <div className="flex items-center space-x-2">
              <label className="block font-medium mr-2 text-gray-700 dark:text-gray-300">
                Rating:
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setStars(n)}
                    className="focus:outline-none"
                    aria-label={`Rate ${n} stars`}
                  >
                    <Star
                      size={36}
                      className={
                        n <= stars
                          ? "fill-yellow-400 stroke-yellow-400"
                          : "stroke-gray-400 dark:stroke-gray-600"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {ratingError && (
            <p className="text-sm text-red-600 mt-1 text-center">
              {ratingError}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
          >
            {review ? "Update Review" : "Submit Review"}
          </button>

          {review && onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md mt-4 transition-colors"
            >
              Delete Review
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default ReviewFormModal;

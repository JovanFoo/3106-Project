import React, { useState, useEffect } from "react";

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
  const [stars, setStars] = useState(5);

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
    onSubmit({ title, text, stars });
  };

  const handleDelete = () => {
    if (onDelete && review?._id) {
      onDelete();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-99999"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white max-w-lg w-full p-6 rounded-xl shadow-xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-5 text-gray-400 hover:text-gray-700 text-2xl font-bold transition-colors"
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {review ? "Edit Review" : "Add Review"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Title
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Review Text
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              rows={4}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Stars
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={stars}
              onChange={(e) => setStars(Number(e.target.value))}
              required
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
          >
            {review ? "Update Review" : "Submit Review"}
          </button>

          {/* Conditionally render delete button if the review exists */}
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

import React from "react";

interface Review {
  _id: string;
  title: string;
  text: string;
  stars: number;
  createdAt: Date;
  modifiedAt: Date;
  stylist: {
    name: string;
  };
  customer: {
    username: string;
  };
}

interface ReviewModalProps {
  review: Review;
  onClose: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ review, onClose }) => {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // only close if the click target is the backdrop itself
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-99999"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white max-w-lg w-full p-6 rounded-xl shadow-xl relative"
        onClick={(e) => e.stopPropagation()} // prevent click inside modal from closing it
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-5 text-gray-400 hover:text-gray-700 text-2xl font-bold transition-colors"
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-gray-900">{review.title}</h2>
        <div className="mt-2 flex items-center">
          <span className="text-yellow-500 text-lg">
            {"★".repeat(review.stars)}
          </span>
          <span className="ml-2 text-sm text-gray-500">{review.stars}/5</span>
        </div>
        <p className="mt-4 text-gray-700">{review.text}</p>
        <div className="mt-6 text-sm text-gray-500 space-y-1">
          <p>Stylist: {review.stylist.name}</p>
          <p>Reviewed by: {review.customer.username}</p>
          <p>
            Created On: {new Date(review.createdAt).toLocaleDateString()} ||
            Last Modified: {new Date(review.modifiedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;

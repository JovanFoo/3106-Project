import React from "react";

interface Review {
  _id: string;
  title: string;
  text: string;
  stars: number;
  createdAt: Date;
  modifiedAt: Date;
  stylist: {
    _id: string;
    name: string;
  };
  customer: {
    username: string;
  };
}

interface ReviewModalProps {
  review: Review;
  onClose: () => void;
  stylistBranchMap: Record<string, string>; // <stylistId, location>
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  review,
  onClose,
  stylistBranchMap,
}) => {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
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

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {review.title}
        </h2>

        <div className="mt-2 flex items-center">
          <span className="text-yellow-500 text-lg">
            {"★".repeat(review.stars)}
          </span>
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            {review.stars}/5
          </span>
        </div>

        <div className="mt-4 text-gray-700 dark:text-gray-300 whitespace-pre-line">
          {review.text}
        </div>
        <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 space-y-1">
          <hr className="mb-2 border-t-1 border-gray-300 dark:border-gray-400" />
          <p>Stylist: {review.stylist.name}</p>
          <p>Branch: {stylistBranchMap[review.stylist._id]}</p>
          <p>Reviewed by: {review.customer.username}</p>
          <p>
            Created On: {new Date(review.createdAt).toLocaleString() + " "}
            {review.createdAt !== review.modifiedAt && (
              <>
                || Last Modified:
                {" " + new Date(review.modifiedAt).toLocaleString()}
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;

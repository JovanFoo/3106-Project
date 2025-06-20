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

interface ReviewCardProps {
  review: Review;
  onClick: () => void;
  stylistBranchMap: Record<string, string>; // <stylistId, location>
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onClick,
  stylistBranchMap,
}) => {
  return (
    <div
      onClick={onClick}
      className="flex flex-col justify-between max-w-sm rounded-lg border border-gray-200 bg-white p-4 shadow-md transition duration-200 hover:brightness-95 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 cursor-pointer"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {review.title}
        </h3>
        <div className="flex items-center">
          <span className="text-yellow-400 dark:text-yellow-300">
            {"★".repeat(review.stars)}
          </span>
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            {review.stars}/5
          </span>
        </div>
      </div>
      <p className="mt-2 text-gray-600 dark:text-gray-300 line-clamp-3">
        {/* did not include "whitespace-pre-line", this includes \n*/}
        {review.text}
      </p>
      <div className="mt-auto pt-4 text-sm text-gray-500 dark:text-gray-400">
        <hr className="mb-2 border-t-1 border-gray-300 dark:border-gray-400" />
        <p>Stylist: {review.stylist.name}</p>
        <p>Branch: {stylistBranchMap[review.stylist._id]}</p>
        <p>Reviewed by: {review.customer.username}</p>
        <p>Created On: {new Date(review.createdAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default ReviewCard;

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

interface ReviewCardProps {
  review: Review;
  onClick: () => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="max-w-sm rounded-lg border border-gray-200 shadow-md p-4 cursor-pointer transition duration-200 hover:brightness-95 hover:shadow-xl"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">{review.title}</h3>
        <div className="flex items-center">
          <span className="text-yellow-500">{"★".repeat(review.stars)}</span>
          <span className="ml-2 text-sm text-gray-500">{review.stars}/5</span>
        </div>
      </div>
      <p className="mt-2 text-gray-600 line-clamp-3">{review.text}</p>
      <div className="mt-4 text-sm text-gray-500">
        <p>Stylist: {review.stylist.name}</p>
        <p>Reviewed by: {review.customer.username}</p>
        <p>Created On: {new Date(review.createdAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default ReviewCard;

import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import SettingsSidebar from "../SettingsSidebar";

const reviews = [
    {
        id: 1,
        name: "Andre",
        country: "US",
        type: "Verified User",
        rating: 5,
        title: "Exceptional Service and Precision Cuts!",
        review:
            "My barber was incredibly skilled and took the time to understand exactly what I wanted. The attention to detail was outstanding—from the precise fade to the sharp lineup, every cut was done with care and expertise. They even offered great styling tips and product recommendations to keep my hair looking fresh between visits.",
    },
    {
        id: 2,
        name: "Andre",
        country: "US",
        type: "Verified Buyer",
        rating: 5,
        title: "Exceptional Service and Precision Cuts!",
        review:
            "What really stood out was the customer service. The staff was friendly, professional, and genuinely passionate about their craft. The conversation was great, but they also knew when to let me enjoy the experience in silence.",
    },
    {
        id: 3,
        name: "Andre",
        country: "US",
        type: "Verified Buyer",
        rating: 5,
        title: "Exceptional Service and Precision Cuts!",
        review:
            "If you're looking for a top-notch haircut, a clean shave, or just an overall fantastic grooming experience, I highly recommend. Definitely my go-to spot from now on!",
    },
];

export default function ClientTestimonials() {
    return (
        <div className="flex min-h-screen">
            <SettingsSidebar />
            <div className="flex-1 p-5">
                <PageBreadcrumb pageTitle="Client Testimonials" />
                <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
                        Client Testimonials
                    </h4>

                    {/* Summary Section */}
                    <div className="p-4 bg-gray-100 rounded-lg mb-6">
                        <h5 className="text-md font-semibold mb-2">Summary</h5>
                        <div className="text-lg font-bold">4.5 ⭐</div>
                        <p className="text-sm text-gray-500">273 Reviews</p>
                        <p className="text-sm text-gray-500">88% Recommended</p>
                    </div>

                    {/* Reviews Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {reviews.map((review) => (
                            <div key={review.id} className="p-4 border rounded-lg shadow-sm">
                                <div className="flex items-center mb-2">
                                    <span className="text-sm font-medium">{review.name}</span>
                                    <span className="text-xs text-gray-500 ml-2">{review.country}</span>
                                </div>
                                <div className="text-xs text-gray-500 mb-1">{review.type}</div>
                                <div className="text-yellow-500">{'⭐'.repeat(review.rating)}</div>
                                <h5 className="font-semibold text-sm mt-2">{review.title}</h5>
                                <p className="text-xs text-gray-600 mt-1">{review.review}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

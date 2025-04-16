import axios from "axios";
import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

const api_address = import.meta.env.VITE_APP_API_ADDRESS_DEV;

type GalleryItem = {
  _id: string;
  title: string;
  image: string;
};

type Props = {
  stylist: { _id: string }; // only requires _id from Teams.tsx
};

export default function PortfolioGallery({ stylist }: Props) {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const config = {
    headers: {
      Authorization: sessionStorage.getItem("token"),
    },
  };

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await axios.get(
          `${api_address}/api/galleries/all/${stylist._id}`,
          config
        );
        setGallery(res.data || []);
      } catch (error) {
        console.error("Error fetching gallery:", error);
        setErrorMsg("Failed to load portfolio.");
      } finally {
        setIsLoading(false);
      }
    };

    if (stylist) fetchGallery();
  }, [stylist]);

  if (isLoading) return <p className="text-gray-500">Loading portfolio...</p>;
  if (errorMsg) return <p className="text-red-500">{errorMsg}</p>;

  return (
    <div className="flex h-full mr-16 overflow-auto">
      <div className="flex-1 p-2">
        {/* <PageBreadcrumb pageTitle="Portfolio/Gallery" /> */}
        <div className="space-y-4">
          {gallery.length === 0 ? (
            <p className="text-gray-500 italic">No portfolio items found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 ">
              {gallery.map((item) => (
                <div key={item._id} className="p-2 rounded-lg border">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-40 object-cover rounded-md"
                  />
                  <p className="text-center mt-2 text-sm font-medium text-gray-800 dark:text-white">
                    {item.title}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

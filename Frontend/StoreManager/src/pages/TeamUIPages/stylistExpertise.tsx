import axios from "axios";
import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

const api_address = import.meta.env.VITE_APP_API_ADDRESS_DEV;

type Expertise = {
  _id: string;
  name: string;
  description: string;
};

type Props = {
  stylist: { _id: string };
};

export default function Expertise({ stylist }: Props) {
  const [expertiseList, setExpertiseList] = useState<Expertise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const config = {
    headers: {
      Authorization: sessionStorage.getItem("token"),
    },
  };

  useEffect(() => {
    const fetchStylistExpertise = async () => {
      try {
        const res = await axios.get(
          `${api_address}/api/stylists/${stylist._id}`,
          config
        );

        const stylistExpertise = res.data.expertises || [];

        // If populated: set directly. If only IDs, filter from allExpertise.
        if (
          stylistExpertise.length &&
          typeof stylistExpertise[0] === "object"
        ) {
          setExpertiseList(stylistExpertise); // Already populated
        } else {
          // Fallback: fetch all expertise and match by ID
          const all = await axios.get(`${api_address}/api/expertises`, config);
          const matched = all.data.filter((item: Expertise) =>
            stylistExpertise.includes(item._id)
          );
          setExpertiseList(matched);
        }
      } catch (error) {
        console.error("Error fetching expertise:", error);
        setErrorMsg("Failed to load expertise.");
      } finally {
        setIsLoading(false);
      }
    };

    if (stylist?._id) fetchStylistExpertise();
  }, [stylist]);

  if (isLoading) return <p className="text-gray-500">Loading expertise...</p>;
  if (errorMsg) return <p className="text-red-500">{errorMsg}</p>;

  return (
    <div className="flex  mr-4">
      <div className="flex-1 p-5 mr-4">
        <PageBreadcrumb pageTitle="Expertise" />
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          {expertiseList.length === 0 ? (
            <p className="text-gray-500 italic">No expertise listed yet.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {expertiseList.map((item) => (
                <div
                  key={item._id}
                  className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium shadow-md"
                >
                  {item.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

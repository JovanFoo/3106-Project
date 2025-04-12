import React, { useState, useEffect } from "react";
import ReviewCard from "./UiElements/ReviewCard";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import ReviewModal from "../components/ui/modal/ReviewModal";

const API_URL = import.meta.env.VITE_API_URL;

const ReviewsList = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branch, setBranch] = useState<string>(""); // Now stores branch location (name)
  const [allStylists, setAllStylists] = useState<Stylist[]>([]); // New state for all stylists
  const [stylist, setStylist] = useState<string>(""); // Holds the selected stylist ID
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAllBranchesDefault(); // Fetch branches on page load
    fetchAllStylists(); // Fetch all stylists on page load
  }, []); // This will run only once, when the component is mounted

  useEffect(() => {
    if (branch) {
      fetchReviews(branch, stylist); // Fetch reviews for the selected branch and stylist
    }
    fetchAllBranches; // reload if there are new branches added to system
    fetchAllStylists; // reload if there are new stylists added to system
  }, [branch, stylist]); // Whenever the branch or stylist changes, this effect will run

  // ---------------------------------- Defining Interfaces ---------------------------------- //
  interface Branch {
    _id: string;
    location: string;
    stylists: string[];
  }

  interface Stylist {
    _id: string;
    name: string;
  }

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
  // ---------------------------------- Defining Interfaces ---------------------------------- //

  // Fetch all branches
  const fetchAllBranchesDefault = async () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const customer = JSON.parse(userData);
      const token = customer.tokens.token;
      try {
        const response = await fetch(`${API_URL}/api/branches`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch branches");

        const data: Branch[] = await response.json();
        const sortedBranches = data.sort((a: Branch, b: Branch) =>
          a.location.localeCompare(b.location)
        );
        setBranches(sortedBranches);

        // Set default branch (location) for the page
        if (sortedBranches.length > 0) {
          const defaultBranch = sortedBranches[0];
          setBranch(defaultBranch.location); // Set default branch by location
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    }
  };

  // Fetch all branches
  const fetchAllBranches = async () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const customer = JSON.parse(userData);
      const token = customer.tokens.token;
      try {
        const response = await fetch(`${API_URL}/api/branches`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch branches");

        const data: Branch[] = await response.json();
        const sortedBranches = data.sort((a: Branch, b: Branch) =>
          a.location.localeCompare(b.location)
        );
        setBranches(sortedBranches);
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    }
  };

  // Fetch all stylists (to filter later)
  const fetchAllStylists = async () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const customer = JSON.parse(userData);
      const token = customer.tokens.token;
      try {
        const response = await fetch(`${API_URL}/api/stylists`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch stylists");

        const data: Stylist[] = await response.json();
        setAllStylists(data); // Store all stylists
      } catch (error) {
        console.error("Error fetching all stylists:", error);
      }
    }
  };

  // Fetch reviews for the selected branch and stylist
  const fetchReviews = async (
    branchLocation: string,
    selectedStylistName: string
  ) => {
    if (!branchLocation) return;

    const userData = localStorage.getItem("user");
    if (!userData) return;

    const customer = JSON.parse(userData);
    const token = customer.tokens.token;

    try {
      const branchId = await retrieveBranchIdByBranchLocation(branchLocation);
      if (!branchId) return;

      let url = `${API_URL}/api/reviews/branch/${branchId}`; // default: branch reviews

      // If a stylist is selected, validate they belong to the branch
      if (selectedStylistName) {
        const matchingStylists = await retrieveStylistsByName(
          selectedStylistName
        );
        const branchObj = branches.find((b) => b.location === branchLocation);

        if (!branchObj || matchingStylists.length === 0) return;

        // Find a stylist with matching name who works at the current branch
        const branchStylist = matchingStylists.find(
          (stylist: { _id: string }) => branchObj.stylists.includes(stylist._id)
        );

        if (branchStylist) {
          url = `${API_URL}/api/reviews/stylist/${branchStylist._id}`;
        } else {
          // No stylist match for this branch – return empty review list
          setReviews([]);
          return;
        }
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch reviews");

      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  // Retrieve branch ID by location (helper function)
  const retrieveBranchIdByBranchLocation = async (branchLocation: string) => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const customer = JSON.parse(userData);
      const token = customer.tokens.token;
      try {
        const response = await fetch(
          `${API_URL}/api/branches/location/${branchLocation}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
          }
        );
        if (!response.ok)
          throw new Error("Failed to retrieve branch by location");
        const branch: Branch = await response.json();
        return branch._id;
      } catch (error) {
        console.error("Error fetching branch by location:", error);
      }
    }
  };

  // Retrieve stylists by name (with token in header)
  const retrieveStylistsByName = async (name: string) => {
    const userData = localStorage.getItem("user");
    if (!userData) return []; // Early return if no user data

    const customer = JSON.parse(userData);
    const token = customer.tokens.token; // Extract token from stored user data

    try {
      const response = await fetch(`${API_URL}/api/stylists/search/${name}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to retrieve stylist");
      }
      const data: Stylist[] = await response.json();
      return data; // Return the array of stylists
    } catch (error) {
      console.error("RetrieveStylistByName error:", error);
      throw error;
    }
  };

  // Handle branch change
  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedBranchLocation = e.target.value; // This now stores the branch location
    setBranch(selectedBranchLocation);
    setStylist(""); // Reset the selected stylist when branch changes
    setReviews([]);
  };

  // Handle stylist change
  const handleStylistChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedStylistName = e.target.value;
    setStylist(selectedStylistName);
    setReviews([]);
    fetchReviews(branch, selectedStylistName); // Re-fetch reviews for the branch with the selected stylist
  };

  // Filter stylists to show only those working at the selected branch
  const filteredStylists = allStylists.filter((stylist) =>
    branches.find((b) => b.location === branch)?.stylists.includes(stylist._id)
  );

  return (
    <>
      <PageMeta title="Customer Reviews" description="View Customer Reviews" />
      <PageBreadcrumb pageTitle="Reviews" />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
        {/* Flex container for branch and stylist selects */}
        <div className="flex space-x-6 mb-6">
          {/* Branch Label and Dropdown */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-3">
              Select Branch:
            </label>
            <select
              value={branch}
              onChange={handleBranchChange}
              className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              <option value="">Select a branch</option>
              {branches.map((b) => (
                <option key={b._id} value={b.location}>
                  {b.location}
                </option>
              ))}
            </select>
          </div>

          {/* Stylist Label and Dropdown */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-3">
              Filter by Stylist:
            </label>
            <select
              value={stylist}
              onChange={handleStylistChange}
              className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              <option value="">All Stylists</option>
              {filteredStylists.map((s) => (
                <option key={s._id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Scrollable Review Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              onClick={() => {
                setSelectedReview(review);
                setShowModal(true);
              }}
            />
          ))}

          {showModal && selectedReview && (
            <ReviewModal
              review={selectedReview}
              onClose={() => setShowModal(false)}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default ReviewsList;

import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import SettingsSidebar from "../SettingsSidebar";
import { useUser } from "../../context/UserContext";
import axios from "axios";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import Alert from "../../components/ui/alert/Alert";
import { set } from "date-fns";

// const api_address = import.meta.env.VITE_APP_API_ADDRESS_PROD;
const api_address = import.meta.env.VITE_APP_API_ADDRESS_DEV;

const portfolioItems = [
  { id: 1, title: "2 block", image: "/images/2block1.jpg" },
  { id: 2, title: "Low Taper Fade", image: "/images/lowtaper1.jpg" },
  { id: 3, title: "Wolf Cut", image: "/images/wolfcut1.jpg" },
  { id: 4, title: "2 block", image: "/images/2block2.jpg" },
  { id: 5, title: "Low Taper Fade", image: "/images/lowtaper2.jpg" },
  { id: 6, title: "Wolf Cut", image: "/images/wolfcut2.jpg" },
];
type GalleryItem = {
  _id: string;
  title: string;
  image: string;
};
export default function PortfolioGallery() {
  const [selected, setSelected] = useState("");
  const { isOpen, openModal, closeModal } = useModal();

  const user = useUser();
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [variant, setVariant] = useState<
    "success" | "error" | "warning" | "info"
  >("success");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [currentImage, setCurrentImage] = useState("");
  const [currentTitle, setCurrentTitle] = useState("");
  const config = {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
      Authorization: sessionStorage.getItem("token"),
    },
  };
  useEffect(() => {
    const fetchGallery = async () => {
      if (!user._id) return;
      try {
        await axios
          .get(`${api_address}/api/galleries/all/${user._id}`, config)
          .then((response: any) => {
            setGallery(response.data);
          })
          .catch((error: any) => {
            setShowAlert(true);
            setVariant("error");
            setTitle("Error fetching gallery");
            setMessage("Failed to fetch gallery items.");
          });
      } catch (error) {
        setShowAlert(true);
        setVariant("error");
        setTitle("Error fetching gallery");
        setMessage("Failed to fetch gallery items.");
      }
    };
    fetchGallery();
  }, [user._id]);
  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Adding photos...");
    setIsUpdating(true);
    setVariant("info");
    setTitle("Adding Photos");
    setMessage("Please wait...");
    setShowAlert(true);
    if (!currentImage) {
      setShowAlert(true);
      setVariant("error");
      setTitle("Error");
      setMessage("Please select an image.");
      return;
    }
    if (!currentTitle) {
      setShowAlert(true);
      setVariant("error");
      setTitle("Error");
      setMessage("Please enter a title.");
      return;
    }
    try {
      await axios
        .post(
          `${api_address}/api/galleries/`,
          {
            title: currentTitle,
            image: currentImage,
          },
          config
        )
        .then((response: any) => {
          setShowAlert(true);
          setVariant("success");
          setTitle("Success");
          setMessage("Photos added successfully.");
          setGallery((prev) => [...prev, response.data]);
          setCurrentImage("");
          setCurrentTitle("");
          user.addGalleries(response.data._id);
          setIsUpdating(false);
        })
        .catch((error: any) => {
          setShowAlert(true);
          setVariant("error");
          setTitle("Error adding photos");
          setMessage("Failed to add photos.");
          console.log(error);
        });
    } catch (error) {
      setShowAlert(true);
      setVariant("error");
      setTitle("Error adding photos");
      setMessage("Failed to add photos.");
    }
    setIsUpdating(false);
    setCurrentImage("");
    setCurrentTitle("");
    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
    closeModal();
  };
  return (
    <div className="flex min-h-screen">
      <SettingsSidebar />
      <div className="flex-1 p-5">
        <PageBreadcrumb pageTitle="Portfolio/Gallery" />
        <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
          <div className={showAlert ? "mb-5" : "hidden"}>
            <Alert title={title} message={message} variant={variant} />
          </div>
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Portfolio/Gallery
            </h4>
            <Button
              size="sm"
              variant="primary"
              onClick={openModal}
              disabled={isUpdating}
            >
              Add Photos +
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {gallery.map((item) => (
              <div
                key={item._id}
                className={`p-2 rounded-lg border cursor-pointer transition ${
                  selected === item._id
                    ? "border-blue-500"
                    : "border-transparent"
                }`}
                onClick={() => setSelected(item._id)}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full  object-cover rounded-md"
                />
                <p className="text-center mt-2 text-sm font-medium text-gray-800 dark:text-white">
                  {item.title}
                </p>
              </div>
            ))}
          </div>
        </div>
        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          className="max-w-[500px] m-4"
        >
          <div className="relative w-full max-w-[500px] rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Update Password
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Enter your current password and set a new one.
            </p>

            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => handleAdd(e)}
            >
              <div>
                <Label>Image title</Label>
                <Input
                  type="text"
                  placeholder="Enter image title"
                  value={currentTitle}
                  onChange={(e) => setCurrentTitle(e.target.value)}
                />
              </div>

              <div>
                <Input
                  type="file"
                  name="image"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (!files) return;
                    const file = files[0];
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setCurrentImage(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </div>
              {currentImage && (
                <div className="mt-4 overflow-auto h-40 ">
                  <img
                    src={currentImage}
                    alt="Selected"
                    className="w-full object-cover rounded-md"
                  />
                </div>
              )}

              <div className="flex items-center gap-3 mt-4 lg:justify-end">
                <Button size="sm" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button size="sm">Save Changes</Button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </div>
  );
}

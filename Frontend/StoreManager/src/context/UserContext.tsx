import axios, { AxiosResponse } from "axios";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
} from "react";
type UserContextType = {
  _id: string;
  username: string;
  name: string;
  email: string;
  profilePicture: string;
  phoneNumber: string;
  bio: string;
  role: "Manager" | "Stylist" | string;
  stylists: string[];
  expertises: string[];
  setId: Dispatch<string>;
  setUsername: Dispatch<string>;
  setName: Dispatch<string>;
  setEmail: Dispatch<string>;
  setProfilePicture: Dispatch<string>;
  setPhoneNumber: Dispatch<string>;
  setBio: Dispatch<"Manager" | "Stylist" | string>;
  setRole: Dispatch<string>;
  setStylists: Dispatch<string[]>;
  setExpertises: Dispatch<string[]>;
  addStylists: (stylist: string) => void;
  addExpertises: (expertise: string) => void;
  saveUserContext: (
    id: string,
    username: string,
    name: string,
    email: string,
    profilePicture: string,
    phoneNumber: string,
    bio: string,
    role: string,
    stylists: string[],
    expertises: string[]
  ) => void;
  loadUserContext: () => void;
  fetchUserContext: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
// UserProvider component
export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState("Manager");
  const [stylists, setStylists] = useState<string[]>([]);
  const [expertises, setExpertises] = useState<string[]>([]);
  const [_id, setId] = useState("");

  const addStylists = (stylist: string) => {
    setStylists([...stylists, stylist]);
  };
  const addExpertises = (expertise: string) => {
    setExpertises([...expertises, expertise]);
  };

  useEffect(() => {
    loadUserContext();
  }, []);

  const saveUserContext = (
    _id: string,
    username: string,
    name: string,
    email: string,
    profilePicture: string,
    phoneNumber: string,
    bio: string,
    role: string,
    stylists: string[],
    expertises: string[]
  ) => {
    sessionStorage.setItem(
      "stylist",
      JSON.stringify({
        _id,
        username,
        name,
        email,
        profilePicture,
        phoneNumber,
        bio,
        role,
        stylists,
        expertises,
      })
    );

    console.log("UserContext saved.");
  };

  const loadUserContext = () => {
    const user = sessionStorage.getItem("stylist");
    if (user) {
      const userObj = JSON.parse(user);
      setId(userObj._id);
      setUsername(userObj.username);
      setName(userObj.name);
      setEmail(userObj.email);
      setProfilePicture(userObj.profilePicture);
      setPhoneNumber(userObj.phoneNumber);
      setBio(userObj.bio);
      setRole(userObj.role);
      setStylists(userObj.stylists);
      setExpertises(userObj.expertises);

      console.log("UserContext loaded.");
    }
  };

  const fetchUserContext = async () => {
    const api_address = import.meta.env.VITE_APP_API_ADDRESS_PROD;
    // const api_address = import.meta.env.VITE_APP_API_ADDRESS_DEV;
    const config = {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
        Authorization: sessionStorage.getItem("token"),
      },
    };
    await axios
      .get(api_address + "/api/stylists/" + _id, config)
      .then((res: AxiosResponse) => {
        if (res.status !== 200) {
          console.log("Failed to fetch user data.");
          return;
        }
        console.log("UserContext fetched.");
        saveUserContext(
          res.data._id,
          res.data.username,
          res.data.name,
          res.data.email,
          res.data.profilePicture || "/images/user/owner.jpg",
          res.data.phoneNumber || "Phone number has not been set yet.",
          res.data.bio || "Bio has not been set yet.",
          res.data.stylists.length > 0 ? "Manager" : "Stylist",
          res.data.stylists,
          res.data.expertises
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <UserContext.Provider
      value={{
        _id,
        username,
        name,
        email,
        profilePicture,
        phoneNumber,
        bio,
        role,
        stylists,
        expertises,
        setId,
        setUsername,
        setName,
        setEmail,
        setProfilePicture,
        setPhoneNumber,
        setBio,
        setRole,
        setStylists,
        setExpertises,
        addStylists,
        addExpertises,
        saveUserContext,
        loadUserContext,
        fetchUserContext,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

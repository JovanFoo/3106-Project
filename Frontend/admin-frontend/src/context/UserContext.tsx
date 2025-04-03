import axios, { AxiosResponse } from "axios";
import { set } from "date-fns";
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
  setId: Dispatch<string>;
  setUsername: Dispatch<string>;
  setName: Dispatch<string>;
  setEmail: Dispatch<string>;
  setProfilePicture: Dispatch<string>;
  setPhoneNumber: Dispatch<string>;
  saveUserContext: (
    _id: string,
    username: string,
    name: string,
    email: string,
    profilePicture: string,
    phoneNumber: string
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
  const [_id, setId] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    loadUserContext();
  }, []);

  const saveUserContext = (
    _id: string,
    username: string,
    name: string,
    email: string,
    profilePicture: string,
    phoneNumber: string
  ) => {
    sessionStorage.setItem(
      "admin",
      JSON.stringify({
        _id,
        username,
        name,
        email,
        profilePicture,
        phoneNumber,
      })
    );

    console.log("UserContext saved.");
  };

  const loadUserContext = () => {
    const user = sessionStorage.getItem("admin");
    if (user) {
      const userObj = JSON.parse(user);
      setId(userObj._id);
      setUsername(userObj.username);
      setName(userObj.name);
      setEmail(userObj.email);
      setProfilePicture(userObj.profilePicture || "/images/user/owner.jpg");
      setPhoneNumber(userObj.phoneNumber);
      console.log("UserContext loaded.");
    }
  };

  const fetchUserContext = async () => {
    // const api_address = import.meta.env.VITE_APP_API_ADDRESS_PROD;
    const api_address = import.meta.env.VITE_APP_API_ADDRESS_DEV;
    const config = {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
        Authorization: sessionStorage.getItem("token"),
      },
    };
    await axios
      .get(api_address + "/api/admins/" + _id, config)
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
          res.data.phoneNumber || "Phone number has not been set yet."
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
        setId,
        setUsername,
        setName,
        setEmail,
        setProfilePicture,
        setPhoneNumber,
        saveUserContext,
        loadUserContext,
        fetchUserContext,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

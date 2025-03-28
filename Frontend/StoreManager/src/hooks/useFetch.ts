import axios, { AxiosResponse } from "axios";
import { useState, useEffect } from "react";

const useGet = (url: string, authorization: boolean) => {
  const [data, setData] = useState(null);
  const config = authorization
    ? {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    : {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
        },
      };
  useEffect(() => {
    axios.get(url, config).then((data: AxiosResponse) => setData(data.data));
  }, [url]);

  return data;
};
const usePost = (url: string, authorization: boolean, dataToSend: any) => {
  const [data, setData] = useState(null);
  const config = authorization
    ? {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
          Authorization: sessionStorage.getItem("token"),
        },
      }
    : {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
        },
      };
  useEffect(() => {
    axios
      .post(url, config, dataToSend)
      .then((data: AxiosResponse) => setData(data.data));
  }, [url]);

  return data;
};

export default { useGet, usePost };

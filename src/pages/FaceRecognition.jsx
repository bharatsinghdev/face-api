import React, { useContext, useEffect, useState } from "react";

// import {  FaceThresholdDistanceContext } from "../context";
import { createMatcher } from "../faceUtil";

// import ProcessFaceRecognition from "./ProcessFaceRecognition";
import faceApi from "../api/api";
import ProcessFaceRecognition from "./ProcessFaceRecognition";

export default (props) => {
  // const { threshold } = useContext(FaceThresholdDistanceContext);
  const [data, setData] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [facePhotos, setFacePhotos] = useState([]);
  const [faceMatcher, setFaceMatcher] = useState(null);

  const getData = async () => {
    const { data } = await faceApi.get();
    return data;
  };

  useEffect(() => {
    (async () => {
      let data = await getData();
      setData(data);
      if (data.data) {
        setParticipants(data);
        setFacePhotos(data);
      }
    })();
  }, []);
  useEffect(() => {
    async function matcher() {
      //check there should be at least one matcher
      const validMatcher = data;
      const profileList = await createMatcher(validMatcher, 0.45);
      setFaceMatcher(profileList);
    }
    if (!!data) {
      matcher();
    }
  }, [data, facePhotos]);

  return (
    <>
      <ProcessFaceRecognition
        {...props}
        faceMatcher={faceMatcher}
        facePhotos={facePhotos}
        participants={participants}
      />
    </>
  );
};

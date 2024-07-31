import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import {
  isFaceDetectionModelLoaded,
  isFacialLandmarkDetectionModelLoaded,
  isFeatureExtractionModelLoaded,
  loadModels,
} from "./faceUtil";
import { UploadFromWebcam } from "./pages/UploadFromWebcam";
import { UploadFromDisk } from "./pages/UploadFromDisk";

function App() {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [loadingMessageError, setLoadingMessageError] = useState(null);
  const [isAllModelLoaded, setIsAllModelLoaded] = useState(false);
  useEffect(() => {
    async function loadingtheModel() {
      await loadModels(setLoadingMessage, setLoadingMessageError);
      setIsAllModelLoaded(true);
    }
    if (
      !!isFaceDetectionModelLoaded() &&
      !!isFacialLandmarkDetectionModelLoaded() &&
      !!isFeatureExtractionModelLoaded()
    ) {
      setIsAllModelLoaded(true);
      return;
    }
    loadingtheModel();
  }, [isAllModelLoaded]);

  const addFacePhotoCallback = () => {};

  const galleryRefetch = () => {};

  const countRefetch = () => {};
  return (
    <>
      <div>
        {loadingMessage && <p>{loadingMessage}</p>}
        {loadingMessageError && <p>{loadingMessageError}</p>}

        <UploadFromWebcam
          addFacePhotoCallback={addFacePhotoCallback}
          galleryRefetch={galleryRefetch}
          countRefetch={countRefetch}
          loading={loading}
        />
        {/* <UploadFromDisk
          addFacePhotoCallback={addFacePhotoCallback}
          galleryRefetch={galleryRefetch}
          countRefetch={countRefetch}
          loading={loading}
        /> */}
      </div>
    </>
  );
}

export default App;

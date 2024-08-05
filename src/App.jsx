import { useEffect, useState } from "react";

import "./App.css";
import {
  isFaceDetectionModelLoaded,
  isFacialLandmarkDetectionModelLoaded,
  isFeatureExtractionModelLoaded,
  loadModels,
} from "./faceUtil";
import { UploadFromWebcam } from "./pages/UploadFromWebcam";
import { UploadFromDisk } from "./pages/UploadFromDisk";
import FaceRecognition from "./pages/FaceRecognition";
import { FaceThresholdDistanceProvider } from "./context";

function App() {
  const [type, setType] = useState("upload");
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
      <div className="align-center">
        {loadingMessage && <p>{loadingMessage}</p>}
        {loadingMessageError && <p>{loadingMessageError}</p>}

        <div style={{ display: "flex" }}>
          <button type="button" onClick={() => setType("upload")}>
            Upload
          </button>
          <button type="button" onClick={() => setType("camera")}>
            Camera
          </button>
          <button type="button" onClick={() => setType("detect")}>
            Detect
          </button>
        </div>

        {type == "camera" && (
          <UploadFromWebcam
            addFacePhotoCallback={addFacePhotoCallback}
            galleryRefetch={galleryRefetch}
            countRefetch={countRefetch}
            loading={loading}
          />
        )}
        {type == "upload" && (
          <UploadFromDisk
            addFacePhotoCallback={addFacePhotoCallback}
            galleryRefetch={``}
            countRefetch={countRefetch}
            loading={loading}
          />
        )}
        {type == "detect" && (
          <FaceThresholdDistanceProvider>
            <FaceRecognition />
          </FaceThresholdDistanceProvider>
        )}
      </div>
    </>
  );
}

export default App;

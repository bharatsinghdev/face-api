import React, { useContext, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { FaceThresholdDistanceContext } from "../context";

import {
  getFullFaceDescription,
  isFaceDetectionModelLoaded,
  isFacialLandmarkDetectionModelLoaded,
  isFeatureExtractionModelLoaded,
  loadModels,
} from "../faceUtil";
import {
  DEFAULT_WEBCAM_RESOLUTION,
  inputSize,
  webcamResolutionType,
} from "../globalData";
import { drawRectAndLabelFace } from "../utils/drawRectAndLabelFace";
import ModelLoading from "../utils/ModelLoading";
import ModelLoadStatus from "../utils/ModelLoadStatus";

export default (props) => {
  const { participants, faceMatcher, facePhotos } = props;

  const { threshold } = useContext(FaceThresholdDistanceContext);

  const fileRef = useRef();
  const webcamRef = useRef();
  const canvasRef = useRef();
  const [isMatched, setIsMatched] = useState(true);

  const [selectedWebcam, setSelectedWebcam] = useState();

  const [inputDevices, setInputDevices] = useState([]);
  const [camWidth, setCamWidth] = useState(DEFAULT_WEBCAM_RESOLUTION.width);
  const [camHeight, setCamHeight] = useState(DEFAULT_WEBCAM_RESOLUTION.height);

  const [isAllModelLoaded, setIsAllModelLoaded] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [loadingMessageError, setLoadingMessageError] = useState("");
  const [fullDesc, setFullDesc] = useState(null);
  const [waitText, setWaitText] = useState("");

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

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(async (devices) => {
      let inputDevice = await devices.filter(
        (device) => device.kind === "videoinput"
      );
      setInputDevices({ ...inputDevices, inputDevice });
    });
  }, []);

  // useEffect(() => {
  //   function capture() {
  //     if (
  //       typeof webcamRef.current !== "undefined" &&
  //       webcamRef.current !== null &&
  //       webcamRef.current.video.readyState === 4
  //     ) {
  //       const videoWidth = webcamRef.current.video.videoWidth;
  //       const videoHeight = webcamRef.current.video.videoHeight;

  //       // Set canvas height and width
  //       canvasRef.current.width = videoWidth;
  //       canvasRef.current.height = videoHeight;

  //       // 4. TODO - Make Detections
  //       // e.g. const obj = await net.detect(video);

  //       // Draw mesh
  //       getFullFaceDescription(webcamRef.current.getScreenshot(), inputSize)
  //         .then((data) => {
  //           setFullDesc(data);
  //           setWaitText("");
  //         })
  //         .catch((err) => {
  //           setWaitText(
  //             "Preparing face matcher and device setup, please wait..."
  //           );
  //         });
  //       const ctx = canvasRef.current.getContext("2d");

  //       drawRectAndLabelFace(fullDesc, faceMatcher, participants, ctx);

  //       if (!!fullDesc) {
  //         console.log("Now got full desc");
  //         fullDesc.map((desc) => {
  //           const bestMatch = faceMatcher.findBestMatch(desc.descriptor);
  //           console.log(bestMatch);
  //           if (bestMatch._label != "unknown") {
  //             createTrxCallback({
  //               variables: {
  //                 attendanceID: props.match.params.attendanceID,
  //                 studentID: bestMatch._label,
  //               },
  //             });
  //             console.log("Saving in db now");
  //           }
  //         });
  //       }
  //     }
  //   }

  //   let interval = setInterval(() => {
  //     capture();
  //   }, 700);

  //   return () => clearInterval(interval);
  // });

  const handleSelectWebcam = (value) => {
    setSelectedWebcam(value);
  };

  const handleWebcamResolution = (value) => {
    webcamResolutionType.map((type) => {
      if (value === type.label) {
        setCamWidth(type.width);
        setCamHeight(type.height);
      }
    });
  };

  const fileHandler = () => {
    var img = new Image();
    img.onload = draw;
    img.onerror = failed;
    img.src = URL.createObjectURL(fileRef.current.files[0]);
  };

  function draw() {
    canvasRef.current.width = this.width;
    canvasRef.current.height = this.height;
    var ctx = canvasRef.current.getContext("2d");
    ctx.drawImage(this, 0, 0);
    capture();
  }

  const capture = async () => {
    try {
      const data = await getFullFaceDescription(
        URL.createObjectURL(fileRef.current.files[0]),
        inputSize
      );
      setFullDesc(data);
      setWaitText("");

      console.log("Face Descriptions:", data);

      const ctx = canvasRef.current.getContext("2d");
      drawRectAndLabelFace(data, faceMatcher, participants, ctx);

      if (data) {
        data.forEach((desc) => {
          const bestMatch = faceMatcher.findBestMatch(desc.descriptor);
          console.log("Best Match:", bestMatch);
        });
      }
    } catch (err) {
      console.error("Error in capturing face description:", err);
      setWaitText("Preparing face matcher and device setup, please wait...");
    }
  };

  useEffect(() => {
    let interval = setInterval(() => {
      if (fullDesc && faceMatcher && isMatched) {
        setIsMatched(false);
        capture();
      }
      if (isMatched == false) {
        clearInterval(interval);
      }
    }, 700);

    return () => clearInterval(interval);
  }, [fullDesc, faceMatcher]);

  const failed = () => {
    console.error("Failed to load image");
  };

  return (
    <>
      <select
        defaultValue="Select Webcam"
        style={{ width: 500 }}
        onChange={handleSelectWebcam}
      >
        {inputDevices?.inputDevice?.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label}
          </option>
        ))}
      </select>

      <select
        defaultValue={DEFAULT_WEBCAM_RESOLUTION.label}
        style={{ width: 200 }}
        onChange={handleWebcamResolution}
      >
        {webcamResolutionType.map((type) => (
          <option key={type.label} value={type.label}>
            {type.label}
          </option>
        ))}
      </select>

      <div>
        <div>Face Descriptor Matcher: {facePhotos.length}</div>
        <div>Threshold Distance: {threshold}</div>
      </div>

      {facePhotos.length === 0 && (
        <p className="alert">No have any face matcher.</p>
      )}
      <ModelLoadStatus errorMessage={loadingMessageError} />

      {!isAllModelLoaded ? (
        <ModelLoading loadingMessage={loadingMessage} />
      ) : loadingMessageError ? (
        <div className="error">{loadingMessageError}</div>
      ) : (
        <div></div>
      )}
      <input type="file" accept="image" ref={fileRef} />
      <button onClick={fileHandler}>Check</button>
      {isAllModelLoaded && loadingMessageError.length == 0 && (
        <>
          <p>{waitText}</p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Webcam
              muted={true}
              ref={webcamRef}
              audio={false}
              width={camWidth}
              height={camHeight}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                deviceId: selectedWebcam,
              }}
              mirrored
            />
            <canvas
              ref={canvasRef}
              style={{
                position: "absolute",
                textAlign: "center",
                zindex: 8,
                width: camWidth,
                height: camHeight,
              }}
            />
          </div>
        </>
      )}
    </>
  );
};

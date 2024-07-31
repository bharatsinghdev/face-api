import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { getFullFaceDescription } from "../faceUtil";
import {
  DEFAULT_WEBCAM_RESOLUTION,
  inputSize,
  webcamResolutionType,
} from "../globalData";
import { CheckError } from "../utils/ErrorHandling";
import { drawFaceRect } from "../utils/drawFaceRect";

export const UploadFromWebcam = ({
  addFacePhotoCallback,
  galleryRefetch,
  countRefetch,
  loading,
}) => {
  const [camWidth, setCamWidth] = useState(DEFAULT_WEBCAM_RESOLUTION.width);
  const [camHeight, setCamHeight] = useState(DEFAULT_WEBCAM_RESOLUTION.height);
  const [inputDevices, setInputDevices] = useState([]);
  const [selectedWebcam, setSelectedWebcam] = useState();
  const [error, setError] = useState("");
  const [fullDesc, setFullDesc] = useState(null);

  const [faceDescriptor, setFaceDescriptor] = useState([]);

  const [detectionCount, setDetectionCount] = useState(0);
  const [previewImage, setPreviewImage] = useState("");

  const [waitText, setWaitText] = useState("");

  const webcamRef = useRef();
  const canvasRef = useRef();

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
  0;

  const fetchVideoInputDevices = async () => {
    // navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(
    //   (stream) => {
    //     alert(stream);
    //   },
    //   (e) => {}
    // );
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );
        setInputDevices(videoInputDevices);
      } catch (err) {
        setError("Error enumerating devices: ", err);
      }
    } else {
      setError("enumerateDevices is not supported");
    }
  };
  useEffect(() => {
    fetchVideoInputDevices();
  }, []);

  useEffect(() => {
    function capture() {
      if (
        typeof webcamRef.current !== "undefined" &&
        webcamRef.current !== null &&
        webcamRef.current.video.readyState === 4
      ) {
        setPreviewImage(webcamRef.current.getScreenshot());

        const videoWidth = webcamRef.current.video.videoWidth;
        const videoHeight = webcamRef.current.video.videoHeight;

        // Set canvas height and width
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;

        // 4. TODO - Make Detections
        // e.g. const obj = await net.detect(video);

        // Draw mesh
        getFullFaceDescription(webcamRef.current.getScreenshot(), inputSize)
          .then((data) => {
            setFullDesc(data);
            setFaceDescriptor(data[0]?.descriptor);
            setWaitText("");
          })
          .catch((err) => {
            setWaitText(
              "Preparing face matcher and device setup, please wait..."
            );
          });
        const ctx = canvasRef.current.getContext("2d");

        drawFaceRect(fullDesc, ctx);
      }
    }

    let interval = setInterval(() => {
      capture();
    }, 700);

    return () => clearInterval(interval);
  });

  const handleSubmit = () => {
    addFacePhotoCallback({
      update() {
        galleryRefetch();
        countRefetch();
        alert("Add Face Photo Success!");
      },
      onError(err) {
        CheckError(err);
      },
      variables: {
        photoData: previewImage,
        faceDescriptor: faceDescriptor.toString(),
      },
    });
  };

  return (
    <div>
      {JSON.stringify(inputDevices)}
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

      <p style={{ fontSize: "18px" }}>{waitText}</p>

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
      {previewImage && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h3>Previous Capture: </h3>
          <img
            src={previewImage}
            alt="Capture"
            style={{ width: "200px", height: "200px" }}
          />
          <div style={{ marginTop: "10px" }}>
            <button
              type="primary"
              onClick={handleSubmit}
              disabled={
                loading ||
                (fullDesc && fullDesc.length !== 1) ||
                (faceDescriptor && faceDescriptor.length !== 128)
              }
              loading={loading}
            >
              Save
            </button>
          </div>
        </div>
      )}

      <div>
        <p>
          Number of detection: {fullDesc ? fullDesc.length : 0}{" "}
          {fullDesc && fullDesc.length > 1 && (
            <span className="alert">Cannot more than 2</span>
          )}
        </p>
        Face Descriptors:{" "}
        {fullDesc &&
          fullDesc.map((desc, index) => (
            <div
              key={index}
              style={{
                wordBreak: "break-all",
                marginBottom: "10px",
                backgroundColor: "lightblue",
              }}
            >
              <strong style={{ fontSize: "20px", color: "red" }}>
                Face #{index}:{" "}
              </strong>
              {desc.descriptor.toString()}
            </div>
          ))}
      </div>
    </div>
  );
};

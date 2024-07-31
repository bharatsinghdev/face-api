import React, { useState } from "react";
import { CheckError } from "../utils/ErrorHandling";
import { getFullFaceDescription } from "../faceUtil";
import { inputSize } from "../globalData";

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

export const UploadFromDisk = ({
  addFacePhotoCallback,
  galleryRefetch,
  countRefetch,
  loading,
}) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [fullDesc, setFullDesc] = useState([]);
  const [faceDescriptor, setFaceDescriptor] = useState([]);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [isRunningFaceDetector, setIsRunningFaceDetector] = useState(false);
  const [detectionCount, setDetectionCount] = useState(0);

  const [fileList, setFileList] = useState([]);
  const handleCancel = () => setPreviewVisible(false);

  const handlePreview = async (file) => {
    setPreviewVisible(true);
    setPreviewTitle(
      file.name || file.url.substring(file.url.lastIndexOf("/") + 1)
    );
  };

  const handleChange = async (e) => {
    let file = e.target.files[0];
    let blob = await getBase64(file);

    if (file) {
      setPreviewImage(blob);
      setIsRunningFaceDetector(true);
      await getFullFaceDescription(blob, inputSize).then((data) => {
        console.log(data);
        setFullDesc(data);
        setDetectionCount(data.length);
        setFaceDescriptor(data[0]?.descriptor);
        setIsRunningFaceDetector(false);
      });
    }
    // if (fileList.length === 0) {
    //   setFaceDescriptor([]);
    //   setDetectionCount(0);
    //   setFileList([]);
    //   return;
    // }

    // if (!fileList[0].url && !fileList[0].preview) {
    //   if (/\.(jpe?g|png)$/i.test(fileList[0].name) === false) {
    //     alert("Not an image file (only JPG/JEPG/PNG accepted)!");
    //     return;
    //   }
    //   fileList[0].preview = await getBase64(fileList[0].originFileObj);
    // }
    // setPreviewImage(fileList[0].url || fileList[0].preview);
    // setFileList(fileList);

    // if (fileList[0].preview.length > 0) {
    //   setIsRunningFaceDetector(true);
    //   await getFullFaceDescription(fileList[0].preview, inputSize).then(
    //     (data) => {
    //       setFullDesc(data);
    //       setDetectionCount(data.length);
    //       setFaceDescriptor(data[0]?.descriptor);
    //       setIsRunningFaceDetector(false);
    //     }
    //   );
    // }
  };

  const handleSubmit = () => {
    if (previewImage.length > 0 && faceDescriptor.length === 128)
      addFacePhotoCallback({
        update(_, data) {
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
    <>
      <input
        type="file"
        multiple={false}
        onChange={handleChange}
        // accept="image/x-png,image/jpeg"
        progress
      />
      {loading && "LOADING ..........."}
      {fileList.length >= 1 ? null : (
        <div>
          <div style={{ marginTop: 8 }}>Upload</div>
        </div>
      )}
      {previewImage ? <img src={previewImage} /> : null}

      <div>
        {detectionCount > 1 && (
          <span className="alert">Only single face allowed</span>
        )}
        {detectionCount === 0 && (
          <span className="alert">No face detected</span>
        )}
        <p>
          Number of detection:{" "}
          {isRunningFaceDetector ? <>Detecting face...</> : detectionCount}
        </p>
        Face Descriptor:{" "}
        {detectionCount === 0 && !isRunningFaceDetector && <span>Empty</span>}
        {isRunningFaceDetector && <>Generating 128 measurements...</>}
        <br />
        {fullDesc.map((desc, index) => (
          <div
            key={index}
            style={{
              wordBreak: "break-all",
              marginBottom: "10px",
              backgroundColor: "lightblue",
            }}
          >
            <p style={{ color: "red", fontSize: "20px", fontWeight: 900 }}>
              Face #{index + 1}:{" "}
            </p>{" "}
            {desc.descriptor.toString()}
          </div>
        ))}
      </div>
    </>
  );
};

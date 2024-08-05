import React from 'react';
import {
  isFaceDetectionModelLoaded,
  isFeatureExtractionModelLoaded,
  isFacialLandmarkDetectionModelLoaded,
} from '../faceUtil';
export default ({ errorMessage }) => (
  <p className="box-title">{
    errorMessage
  }</p>
);

import * as faceapi from 'face-api.js';

export async function loadModels(
    setLoadingMessage,
    setLoadingMessageError
) {
    const MODEL_URL = '/models';

    try {
        setLoadingMessage('Loading Face Detector');
        await faceapi.loadSsdMobilenetv1Model(MODEL_URL);

        setLoadingMessage('Loading 68 Facial Landmark Detector');
        await faceapi.loadFaceLandmarkTinyModel(MODEL_URL);

        setLoadingMessage('Loading Feature Extractor');
        await faceapi.loadFaceRecognitionModel(MODEL_URL);
    } catch (err) {
        setLoadingMessageError(
            'Model loading failed. Please contact me about the bug:attendlytical@gmail.com'
        );
    }
}

export async function getFullFaceDescription(blob, inputSize = 512) {
    // tiny_face_detector options
    let scoreThreshold = 0.8;
    const OPTION = new faceapi.SsdMobilenetv1Options({
        inputSize,
        scoreThreshold,
    });
    const useTinyModel = true;

    // fetch image to api
    let img = await faceapi.fetchImage(blob);

    // detect all faces and generate full description from image
    // including landmark and descriptor of each face
    let fullDesc = await faceapi
        .detectAllFaces(img, OPTION)
        .withFaceLandmarks(useTinyModel)
        .withFaceDescriptors();
    return fullDesc;
}

export async function createMatcher(faceProfile, maxDescriptorDistance) {
    // Create labeled descriptors of member from profile
    console.log(faceProfile, maxDescriptorDistance)
    let labeledDescriptors = faceProfile.map(
        (profile) => {

            let descriptior = new Float32Array(profile?.faceDescriptor?.match(/-?\d+(?:\.\d+)?/g).map(Number))
            let label = new faceapi.LabeledFaceDescriptors(
                profile.name,
                [descriptior]
            )
            return label
        }
    );

    if (labeledDescriptors.length == 0) return

    let faceMatcher = new faceapi.FaceMatcher(
        labeledDescriptors,
        maxDescriptorDistance
    );
    console.log('label', faceMatcher)
    return faceMatcher;
}

export function isFaceDetectionModelLoaded() {
    return !!faceapi.nets.ssdMobilenetv1.params;
}

export function isFeatureExtractionModelLoaded() {
    return !!faceapi.nets.faceRecognitionNet.params;
}

export function isFacialLandmarkDetectionModelLoaded() {
    return !!faceapi.nets.faceLandmark68TinyNet.params;
}
<script setup>
import { ref, onMounted, watch } from "vue";
import * as faceapi from "face-api.js";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user.store";
import { storeToRefs } from "pinia";
const { user } = storeToRefs(useUserStore());
const videoRef = ref(null);
const canvasRef = ref(null);
const videoWidth = 640;
const videoHeight = 360;
const tempAccount = ref("");
const localUserStream = ref(null);
const modelsLoaded = ref(false);
const faceApiLoaded = ref(false);
const loginResult = ref("PENDING");
const imageError = ref(false);
const counter = ref(5);
const labeledFaceDescriptors = ref({});
const faceApiIntervalRef = ref(null);

const router = useRouter();

const loadModels = async () => {
  const uri = "/models";
  await faceapi.nets.ssdMobilenetv1.loadFromUri(uri);
  await faceapi.nets.faceLandmark68Net.loadFromUri(uri);
  await faceapi.nets.faceRecognitionNet.loadFromUri(uri);
};

const getLocalUserVideo = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.value.srcObject = stream;
    const testVideo = document.getElementById("test-video");
    testVideo.srcObject = stream;
    localUserStream.value = stream;
  } catch (err) {
    console.error("Error getting user video:", err);
  }
};

const scanFace = async () => {
  faceapi.matchDimensions(canvasRef.value, videoRef.value);
  faceApiIntervalRef.value = setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(videoRef.value)
      .withFaceLandmarks()
      .withFaceDescriptors();
    const resizedDetections = faceapi.resizeResults(detections, {
      width: videoWidth,
      height: videoHeight,
    });
    // session user face
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors.value);
    const results = resizedDetections.map((d) =>
      faceMatcher.findBestMatch(d.descriptor)
    );

    if (canvasRef.value) {
      const context = canvasRef.value.getContext("2d");
      context.clearRect(0, 0, videoWidth, videoHeight);
      faceapi.draw.drawDetections(canvasRef.value, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvasRef.value, resizedDetections);
    }
    if (results[0].distance <= 0.6) {
      loginResult.value = "SUCCESS";
    } else {
      loginResult.value = "FAILED";
    }

    if (!faceApiLoaded.value) {
      faceApiLoaded.value = true;
    }
  }, 1000 / 15);
};

const loadLabeledImages = async () => {
  const descriptions = [];
  const imgPath = `${tempAccount.value.picture}`;
  try {
    const img = await faceapi.fetchImage(imgPath);
    const detections = await faceapi
      .detectSingleFace(img)
      .withFaceLandmarks()
      .withFaceDescriptor();
    if (detections) descriptions.push(detections.descriptor);
  } catch {
    imageError.value = true;
    return null;
  }
  return new faceapi.LabeledFaceDescriptors(tempAccount.value.id, descriptions);
};

onMounted(() => {
  tempAccount.value = user.value;
  if (tempAccount.value) {
    loadModels().then(async () => {
      labeledFaceDescriptors.value = await loadLabeledImages();
      modelsLoaded.value = true;
    });
  }
});

watch(
  () => loginResult.value,
  (newResult) => {
    if (newResult === "SUCCESS") {
      const counterInterval = setInterval(() => {
        counter.value--;
        if (counter.value === 0) {
          clearInterval(counterInterval);
          clearInterval(faceApiIntervalRef.value);
          localUserStream.value.getTracks().forEach((track) => track.stop());
          user.value = tempAccount.value;
          router.push("/");
        }
      }, 1000);
    }
  }
);
</script>

<template>
  <video
    style="width: 500px; height: 500px"
    autoplay
    muted
    controls
    id="test-video"
  ></video>
  <div
    class="h-full flex flex-col items-center justify-center gap-[24px] max-w-[720px] mx-auto"
  >
    <div
      v-if="imageError"
      class="min-h-screen flex flex-col items-center justify-center gap-[24px] max-w-[840px] mx-auto"
    >
      <h2
        class="text-center text-3xl font-extrabold tracking-tight text-rose-700 sm:text-4xl"
      >
        <span class="block">
          Upps! There is no profile picture associated with this account.
        </span>
      </h2>
      <span class="block mt-4">
        Please contact administration for registration or try again later.
      </span>
    </div>

    <h2
      v-if="!localUserStream && !modelsLoaded"
      class="text-center text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl"
    >
      <span class="block"> You're Attempting to Log In With Your Face. </span>
      <span class="block text-indigo-600 mt-2">Loading Models...</span>
    </h2>

    <h2
      v-if="!localUserStream && modelsLoaded"
      class="text-center text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl"
    >
      <span class="block text-indigo-600 mt-2">
        Please Recognize Your Face to Completely Log In.
      </span>
    </h2>

    <h2
      v-if="localUserStream && loginResult === 'SUCCESS'"
      class="text-center text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl"
    >
      <span class="block text-indigo-600 mt-2">
        We've successfully recognize your face!
      </span>
      <span class="block text-indigo-600 mt-2">
        Please stay {{ counter }} more seconds...
      </span>
    </h2>

    <h2
      v-if="localUserStream && loginResult === 'FAILED'"
      class="text-center text-3xl font-extrabold tracking-tight text-rose-700 sm:text-4xl"
    >
      <span class="block mt-[56px]">
        Upps! We did not recognize your face.
      </span>
    </h2>

    <h2
      v-if="localUserStream && !faceApiLoaded && loginResult === 'PENDING'"
      class="text-center text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl"
    >
      <span class="block mt-[56px]">Scanning Face...</span>
    </h2>

    <div class="w-full">
      <div class="relative flex flex-col items-center p-[10px]">
        <video
          ref="videoRef"
          muted
          autoplay
          :height="videoHeight"
          :width="videoWidth"
          @play="scanFace"
          :style="{
            objectFit: 'fill',
            height: '360px',
            borderRadius: '10px',
            display: localUserStream ? 'block' : 'none',
          }"
        />
        <canvas
          ref="canvasRef"
          :style="{
            position: 'absolute',
            display: localUserStream ? 'block' : 'none',
          }"
        />
      </div>
      <div v-if="!localUserStream">
        <img
          v-if="modelsLoaded"
          alt="loading models"
          src="../assets/images/auth-face.svg"
          class="cursor-pointer my-8 mx-auto object-cover h-[272px]"
        />
        <img
          v-else
          alt="loading models"
          src="../assets/images/auth-idle.svg"
          class="cursor-pointer my-8 mx-auto object-cover h-[272px]"
        />
        <button
          @click="getLocalUserVideo"
          type="button"
          :disabled="!modelsLoaded"
          :class="{
            ' justify-center items- w-full py-2.5 px-5 mr-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg border border-gray-200 inline-flex items-center':
              modelsLoaded,
            'cursor-not-allowed  justify-center  w-full py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 inline-flex items-center':
              !modelsLoaded,
          }"
        >
          <span
            v-if="!modelsLoaded"
            class="inline mr-2 w-4 h-4 text-gray-200 animate-spin"
          ></span>
          Scan my face
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any custom styles if needed */
</style>

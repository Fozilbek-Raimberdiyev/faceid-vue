<template>
  <div
    class="h-full flex flex-col items-center justify-center gap-6 w-full max-w-[720px] mx-auto"
  >
    <h1 class="text-2xl font-semibold">Select a Dummy User to Log In</h1>
    <div class="w-full p-4 text-right">
      <div class="mx-auto w-full max-w-md">
        <RadioGroup v-model="selected">
          <RadioGroupLabel class="sr-only">Server size</RadioGroupLabel>
          <div class="space-y-2">
            <User
              v-for="account in accounts"
              :key="account.id"
              :user="account"
              :selected="selected.id === account.id"
              @click="selected = account"
            />
            <div v-if="customUser" class="relative">
              <User
                :key="customUser.id"
                :user="customUser"
                type="CUSTOM"
                :selected="selected.id === customUser.id"
                @click="selected = customUser"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="text-indigo-800 w-6 h-6 absolute top-1/2 -translate-y-1/2 right-[-32px] cursor-pointer"
                @click="removeCustomUser"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>
        </RadioGroup>

        <div
          v-if="!customUser"
          class="flex flex-col items-center justify-center w-full mt-3"
        >
          <label
            for="dropzone-file"
            class="flex flex-col items-center justify-center w-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:border-indigo-200 hover:bg-gray-100"
          >
            <div class="flex flex-col items-center justify-center py-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-6 h-6 text-indigo-500 mb-2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                />
              </svg>
              <p
                class="font-semibold mb-2 text-sm text-gray-500 dark:text-gray-400"
              >
                Click to upload referral image
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                PNG, JPG or JPEG
              </p>
            </div>
            <input
              id="dropzone-file"
              type="file"
              accept=".png, .jpg, .jpeg"
              class="hidden"
              @change="handleFileUpload"
            />
          </label>
          <p v-if="errorMessage" class="text-red-500 text-xs mt-2">
            {{ errorMessage }}
          </p>
        </div>
        <RouterLink
          to="/auth/login"
          class="mt-4 inline-flex items-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600"
        >
          Continue
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="ml-1.5 h-5 w-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"
            />
          </svg>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { RouterLink } from "vue-router";
import { RadioGroup, RadioGroupLabel } from "@headlessui/vue";
import User from "../components/User.vue";
import { useUserStore } from "../stores/user.store";
import { storeToRefs } from "pinia";
const { setUser } = useUserStore();
const { user } = storeToRefs(useUserStore());
const accounts = [
  {
    id: "374ed1e4-481b-4074-a26e-6137657c6e35",
    fullName: "Bilal Gümüş",
    picture: "https://xsgames.co/randomusers/avatar.php?g=male",
  },
  {
    id: "43332f46-89a4-435c-880e-4d72bb51149a",
    fullName: "Andrew Clark",
    picture: "https://xsgames.co/randomusers/avatar.php?g=male",
  },
  {
    id: "b8476d8d-bd7e-405f-aa66-9a22a9727930",
    fullName: "Amelia Miller",
    picture: "https://xsgames.co/randomusers/avatar.php?g=female",
  },
  {
    id: "88421e2c-ca7a-4332-815f-6e12824e2d05",
    fullName: "Sophia Smith",
    picture: "https://xsgames.co/randomusers/avatar.php?g=female",
  },
  {
    id: "0c2f5599-9296-4f94-97d5-e773043188ae",
    fullName: "Emily Martinez",
    picture: "https://xsgames.co/randomusers/avatar.php?g=male",
  },
];

const selected = ref(accounts[0]);
const customUser = ref(null);
const errorMessage = ref(null);

const convertBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);

    fileReader.onload = () => {
      resolve(fileReader.result);
    };

    fileReader.onerror = (error) => {
      reject(error);
    };
  });
};

const removeCustomUser = () => {
  customUser.value = null;
  if (selected.value?.type === "CUSTOM") {
    selected.value = accounts[0];
  }
};

const handleFileUpload = async (event) => {
  const files = event.target.files;
  if (!files || files.length === 0) {
    errorMessage.value = "No files wait for import.";
    return;
  }

  const file = files[0];
  const name = file.name;
  const suffix = name.split(".").pop().toLowerCase();

  if (!["png", "jpg", "jpeg"].includes(suffix)) {
    errorMessage.value = "Only support png jpg or jpeg files.";
    return;
  }

  try {
    const base64 = await convertBase64(file);
    const user = {
      id: "custom",
      fullName: name,
      type: "CUSTOM",
      picture: base64,
    };

    customUser.value = user;
    selected.value = user;
    setUser(user);
    errorMessage.value = null;
  } catch (error) {
    errorMessage.value = "Error processing file.";
  }
};
</script>

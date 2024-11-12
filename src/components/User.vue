<template>
  <RadioGroupOption :key="user.id" :value="user" v-slot="{ checked }">
    <div
      :class="[
        checked ? 'bg-indigo-600 bg-opacity-75 text-white' : 'bg-white',
        'relative flex cursor-pointer rounded-lg px-5 py-4 shadow-md focus:outline-none',
      ]"
    >
      <div class="flex w-full items-center justify-between">
        <div class="flex items-center">
          <div class="text-sm">
            <RadioGroupLabel
              as="div"
              :class="[
                'flex items-center gap-x-6 font-medium',
                checked ? 'text-white' : 'text-gray-900',
              ]"
            >
              <img
                class="object-cover h-10 w-10 rounded-full"
                :src="getImageSource"
                :alt="user.fullName"
              />
              {{ user.fullName }}
            </RadioGroupLabel>
          </div>
        </div>
        <div v-if="checked" class="shrink-0 text-white">
            <svg viewBox="0 0 24 24" fill="none" v-bind="props">
    <circle cx="12" cy="12" r="12" fill="#fff" opacity="0.2" />
    <path
      d="M7 13l3 3 7-7"
      stroke="#fff"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
        </div>
      </div>
    </div>
  </RadioGroupOption>
</template>

<script setup>
import { computed } from "vue";
import { RadioGroupOption, RadioGroupLabel } from "@headlessui/vue";

// Props definition
const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  type: {
    type: String,
    default: null,
  },
});

// Computed property for image source
const getImageSource = computed(() => {
  if (props.type === "CUSTOM") {
    return props.user.picture;
  }
  // Uncomment and modify based on your environment setup
  // return import.meta.env.DEV
  //   ? `/temp-accounts/${props.user.picture}`
  //   : `/react-face-auth/temp-accounts/${props.user.picture}`
  return `/temp-accounts/${props.user.picture}`;
});
</script>

<template>
  <div class="bg-white pt-40 md:pt-60">
    <div class="mx-auto max-w-7xl">
      <h2
        class="text-center text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl mb-12"
      >
        You have successfully logged in!
      </h2>
      <div class="text-center mb-24">
        <img
          class="mx-auto mb-8 object-cover h-48 w-48 rounded-full"
          :src="user?.type === 'CUSTOM' ? user.picture : `${user.picture}`"
          alt="account.fullName"
        />
        <h1
          class="block text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-800"
          style="line-height: '1.5'"
        >
          {{ user?.fullName }}
        </h1>
        <button
          @click="logout"
          class="flex gap-2 mt-12 w-fit mx-auto cursor-pointer z-10 py-3 px-6 rounded-full bg-gradient-to-r from-red-400 to-red-600"
        >
          <span class="text-white">Log Out</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="{1.5}"
            stroke="white"
            class="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "../stores/user.store";
import { storeToRefs } from "pinia";
const { user } = storeToRefs(useUserStore());
import { useRouter } from "vue-router";
const router = useRouter();
function logout() {
  user.value = null;
  router.push("/auth/register");
}
</script>

<style scoped></style>

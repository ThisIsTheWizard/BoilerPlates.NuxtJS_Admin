import { defineNuxtPlugin, useRuntimeConfig } from "nuxt/app";
import { ApolloClient, HttpLink, InMemoryCache, from } from "@apollo/client/core";
import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import { DefaultApolloClient, provideApolloClient } from "@vue/apollo-composable";
import type { Pinia } from "pinia";

import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";

export default defineNuxtPlugin((nuxtApp) => {
  const pinia = (nuxtApp as unknown as { $pinia: Pinia }).$pinia;
  const authStore = useAuthStore(pinia);
  const { tokens } = storeToRefs(authStore);

  const runtimeConfig = useRuntimeConfig();

  const httpLink = new HttpLink({
    uri: `${runtimeConfig.public.apiBaseUrl}/graphql`,
    credentials: "include",
  });

  const authLink = setContext((_, { headers }) => {
    authStore.hydrate();

    const token = tokens.value?.accessToken;

    return {
      headers: {
        ...headers,
        ...(token ? { Authorization: token } : {}),
        "Content-Type": "application/json",
      },
    };
  });

  const errorLink = onError(({ graphQLErrors }) => {
    if (!graphQLErrors) return;

    if (!tokens.value?.accessToken) return;

    for (const error of graphQLErrors) {
      if (error.extensions?.code === "UNAUTHENTICATED") {
        authStore.clear();
        break;
      }
    }
  });

  const apolloClient = new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache(),
  });

  provideApolloClient(apolloClient);
  (nuxtApp as any).vueApp.provide(DefaultApolloClient, apolloClient);

  return {
    provide: {
      apollo: apolloClient,
    },
  };
});

"use client";

import dataProviderSimpleRest from "@refinedev/simple-rest";

const API_URL = "https://api.fake-rest.refine.dev";
// const API_URL = "http://127.0.0.1:8787/api";

export const dataProvider = dataProviderSimpleRest(API_URL);

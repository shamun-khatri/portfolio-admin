"use client";

import { dataProviderCustom } from "./dataProviderCustom";



// const API_URL = "https://api.fake-rest.refine.dev";
const API_URL = "http://127.0.0.1:8787/api";

export const dataProvider = dataProviderCustom(API_URL);

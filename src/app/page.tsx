"use client";

import { Suspense, useEffect } from "react";

import { Authenticated } from "@refinedev/core";
import { NavigateToResource } from "@refinedev/nextjs-router";
import { useSession } from "next-auth/react";
import { decode } from "next-auth/jwt";

export default function IndexPage() {

  const { data: session } = useSession();

  const sessionToken = "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..-sWttd8Az8UKquL9.rC1UL1DFSZjUcaOsf5kRT6rzRozKbgqsMDRI8yrzowRrPja0m1dx5bt_G7fhp8f_XgIugR8FktVAAZ-nEqfz5g0mrrnIhimmvw0xQsxrpPkE4haHVdvEHF9U-1Xhlc8gejtUbAIIHkahDuILhGQqfIWegVs0avoOzGerrQNBMfTl0ixWGBBAsJLk5jpZ8Fp8U-0gCzXoitYXB36kkWCcqIzxRGIGkBrLGVpY1sEc4uKOQNSszIc1iomZtHF7hvrXiZyTbubyjvMAMtTBNYIHlYpwLsXyNkqUHFYZioaaqethYWXgbxi5odvVGJ483fiqEaO-IsXDhnKO5oJeijcpvtMsKSRut_Gvfaokl3lKaOgUqbjbZad2BUKlXS3NywTLJbTvDJw3mTD_7tk3Tm3bizcVcouM5XRCib4SFz8V0heZMFwhyHf5Y9yEj_JZoz1mby2k-XVt6iPE-b2rQOckErA3ZIE6bMp3oFHQYStK4meV6nSaZbRWiI7jrnYlCqjsqi6PXOQcmLUSmjsmZ-o6joEipEGznGqURLmV_UmVjSCxYWfzlzo1PbXGEKZtl5O5QgSUwYvp4A4ri9O9sWOoLfIuKT4TlGBFOeTlDiPX4FNX1wLkWxhM-5c-eemahcgOTAFV5vib_R1z7pbO4uuIkIWmy-8uoGW6jSF4pUCME8lQ2KITqNlVtoF8Dtjub6RR_VHQ42zJQC2_K9iOhaZ-uM70jif1A1mNi5pVS5rEZbUil52b_igUOSOyPvDI_H3I52ZwC4BfrCwycgAagr_YML6fu7ThOnX0NdWNsUzwcDIgG0AsGIqxIoU-QcsEQQH6xi8SNTu9p2NiJPICXqLVk4lpgDw9LqcO5nxlvVyImoUjpop-UR6tu5y9-IJh3OzOEEJjf_ELKtG2meavumaHxOyTp8z9iu_iORZqZR-aM0GCFJqgZR8YB7l26nf7jTGbykrQ4EJQYtaemGBAWJYmsE1Ka4TsY6pemeKi6FLP8Dec-VwG6cc8T1JXYbRGZRN-J4xW9YKtkSkdNrtIv4BX30j-tSD95fQbghFvVLLEiffU8kn1KQdp5-cBkVuqaA0RgzZZmQdB7hTml-kwYB8o2k8QU4G7j9vuOKGKj_T3zauYFCu_6XnKyUL4jZTmlAfoCmJiBLOUiddmr2MXzUcmbHLrzF6VNpupeqmGAw0EVUquSQ-83XugP_WPIpXeGXRjdc5xeBONzAP9bie7LRL-GonYtjbqb19kEu0qhkIo5doNI9GrNiuEFmxuKc4UgEkvWkr5IRdtnzKUjbOysg9KNeSlRR9Y72SkprKjKaxqMM-CkbOtlutbKdKvgwsYvz5haciROHCPz6aiGlqZrFgrd3sUz1eD49A6cR484zrtFJZAACqL-odlESzLNq_TgpH7I7bGZq-q_Ao92QlctaLElRrWRtJYtzF1SN9j7Nox-7Q6GeSYu7xzQdu3Lan8JBPbrzCGvEf2-kZPZt4IwquO-OFtKMxC0AXwKn61DlU3DL3S84qqhxoBX033ax8dlS-GGK08gm2HzDtUMq1KTAZR1gNNln7qTH4zRo9JJo9JHT94Gjoqlj8qeIj5lLKtNKm__FzUelOtHe7qPRm7rfTpU6Q36u6n5V8JK-dbAqkz4Zubf-o58kRXGbtfDXKkZevbTrECXwbtvvGh9Ltf3ODbB1HMJmRQqyvM7zP2EPiUYfooMx45sQrXIhrI6iS3NuLAjpM384FJYleBHcW4neR6cw2qhkILWiWyiokPTFkyBnuvYwyo85NxYVBO6HPQhTpi1_juYnpgVkhjccOIXgB75wP3i_iIbmVXML4g1EOeJr4y-PJpZJ_inNF3GqdMgo9mYIXXh29OJ1UGhPD415nF5Q0SieOBewCyc188QA71gprVdCE-Ljj-1s9SNorWogvB9ATmV5Dj3HAggoCN9w-O14uRuK1poZUBoVqbl13pyQFgzloVah1jic97RxaTbiE6Kuh6JTmaj_2rmnxG521Sbz94brMyo01stCp5Uga9n08PKMrEP55I0FQ98cIy9gsR7qcLKIyzsnp3quIXWhW5Jah2x7gmmcUvbAIqqXwePxGIlq_vK8BJY5s9kqXJQm5sQ-DMSayCWgQ9VM5qFm-yYKnhWcBMSvdXJfsEerWnSTga8mNR9DluXX7tKLONHpQPe3xELm6LJOSNOiCSUDWNE-0GHIt9lLZzR7H-eR1NGsdBz8-Rs5leFy8NL6kj.by3KXwEkU_ez3SksaVHP0A";


  const secret = "UItTuD1HcGXIj8ZfHUswhYdNd40Lc325R8VlxQPUoR0=";

  useEffect(() => {
    console.log("sessions", session);
    // Define an async function within the effect
  const decodeToken = async () => {
    try {
      const decoded = await decode({
        token: sessionToken, // Make sure 'sessionToken' is defined
        secret: secret,      // Make sure 'secret' is defined
        salt: "",
      });
      console.log("Hereeeeeeeeeeeeeeeeeee");
      console.log("Decoded Token:", decoded);
    } catch (error) {
      console.log("error", error);
      console.error("Error decoding token:", error);
    }
  };

  // Call the async function
  if (sessionToken) {
    decodeToken();
  }

  }, []);

  return (
    <Suspense>
      <Authenticated key="home-page">
        <NavigateToResource />
      </Authenticated>
    </Suspense>
  );
}

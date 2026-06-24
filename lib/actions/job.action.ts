"use server";

import { JobFilterParams } from "@/types/action";

export const fetchLocation = async () => {
  const response = await fetch("http://ip-api.com/json/?fields=country");
  const location = await response.json();
  return location.country;
};

export const fetchCountries = async () => {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/mledoze/countries/master/dist/countries.json"
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.log(error);
  }
};


export const fetchJobs = async (filters: JobFilterParams) => {
  const { query, page } = filters;

  const headers = {
    "X-RapidAPI-Key": process.env.RAPID_API_KEY ?? "",
    "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
  };

  try {
    const response = await fetch(
      `https://jsearch.p.rapidapi.com/search-v2?query=${query}&page=${page}`,
      {
        headers,
      }
    );

    if (!response.ok) {
      console.error(`JSearch API failed: Status ${response.status} - ${response.statusText}`);
      const text = await response.text();
      console.error("API response text:", text);
      return [];
    }

    const result = await response.json();
    
    if (!result || !result.data || !result.data.jobs) {
      console.error("JSearch API returned no data. Result:", result);
      return [];
    }

    return result.data.jobs;
  } catch (error) {
    console.error("Error fetching jobs from RapidAPI JSearch:", error);
    return [];
  }
};

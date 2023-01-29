import axios from "axios";
import moment from "moment";
import { Moment } from "moment";

export interface ClientInformation {
  city: string;
  region: string;
  country: string;
  ip: string;
  timeStamp: Moment;
  clientVisits: number;
}

export const getClientInformation = async (): Promise<ClientInformation> => {
  // let counterContainer = document.querySelector("#visits");
  // let resetButton = document.querySelector('#reset');
  let visitCountString: string | null = localStorage.getItem("page_view");
  let visitCountNumber: number = Number(visitCountString)
    ? Number(visitCountString)
    : 0;

  // Check if page_view entry is present
  if (visitCountString !== null) {
    visitCountNumber =
      (Number(visitCountString) ? Number(visitCountString) : 0) + 1;
    localStorage.setItem("page_view", JSON.stringify(visitCountNumber));
  } else {
    localStorage.setItem("page_view", "1");
  }

  // if (counterContainer !== null) {
  //   counterContainer.innerHTML = visitCountString ? visitCountString : '1';
  // }

  // let ref = document.referrer;
  // let href = location.href;
  // let agent = navigator.userAgent;

  let response = await fetch("https://ipapi.co/json/");
  let responseJSON = await response.json();
  // let city = responseJSON.city;
  // let country = responseJSON.country;
  // location =
  //   responseJSON.city +
  //   ", " +
  //   responseJSON.region +
  //   " (" +
  //   responseJSON.country +
  //   ")";
  // if (
  //   document.querySelector('#city') !== null &&
  //   document.querySelector('#city') !== undefined &&
  //   document.querySelector('#city')?.innerHTML !== null
  // ) {
  //   document.querySelector('#city').innerHTML = location;
  // }
  // document.querySelector('#ip').innerHTML = responseJSON.ip;
  // document.querySelector("#region").innerHTML=responseJSON.region;
  // document.querySelector("#country").innerHTML=responseJSON.country;
  console.log(responseJSON);

  let clientInformation: ClientInformation = {
    ip: responseJSON.ip,
    timeStamp: moment(),
    city: responseJSON.city,
    region: responseJSON.region,
    country: responseJSON.country,
    clientVisits: visitCountNumber,
  };

  // axios post to server http://localhost:9000/api/smashed/create
  await axios.post(
    "http://localhost:9000/api/smashed/create",
    clientInformation
  );

  console.log(clientInformation);

  return clientInformation;
};

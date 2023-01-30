import axios from 'axios';
import moment from 'moment';
import { Moment } from 'moment';
import { Debug, SmashConfig } from '../scenes/interfaces';

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
  let visitCountString: string | null = localStorage.getItem('page_view');
  let visitCountNumber: number = Number(visitCountString)
    ? Number(visitCountString)
    : 0;

  // Check if page_view entry is present
  if (visitCountString !== null) {
    visitCountNumber =
      (Number(visitCountString) ? Number(visitCountString) : 0) + 1;
    localStorage.setItem('page_view', JSON.stringify(visitCountNumber));
  } else {
    localStorage.setItem('page_view', '1');
  }

  // if (counterContainer !== null) {
  //   counterContainer.innerHTML = visitCountString ? visitCountString : '1';
  // }

  // let ref = document.referrer;
  // let href = location.href;
  // let agent = navigator.userAgent;

  let response = await fetch('https://ipapi.co/json/');
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

  console.log(clientInformation);

  return clientInformation;
};

export interface SessionInfo {
  smashConfig: string;
  debug: string;
  ip: string;
  timeStamp: Moment;
  city: string;
  region: string;
  country: string;
  clientVisits: number;
}

export const saveToAxios = async (
  clientInformation: ClientInformation,
  smashConfig: SmashConfig,
  debug: Debug
): Promise<SessionInfo> => {
  let sessionInfo: SessionInfo = {
    smashConfig: JSON.stringify(smashConfig),
    debug: JSON.stringify(debug),
    ip: clientInformation.ip,
    timeStamp: clientInformation.timeStamp,
    city: clientInformation.city,
    region: clientInformation.region,
    country: clientInformation.country,
    clientVisits: clientInformation.clientVisits,
  };

  if (process.env.NODE_ENV === 'production') {
    await axios.post('/api/smashed/create', sessionInfo);
  } else {
    await axios.post('http://localhost:8000/api/smashed/create', sessionInfo);
  }
  // await axios.post("http://localhost:8000/api/smashed/create", sessionInfo);
  return sessionInfo;
};

export const getAllAxios = async (): Promise<SessionInfo[]> => {
  let response;
  if (process.env.NODE_ENV === 'production') {
    response = await axios.get('/api/smashed');
  } else {
    response = await axios.get('http://localhost:8000/api/smashed');
  }
  // let response = await axios.get("http://localhost:8000/api/smashed");
  return response.data;
};

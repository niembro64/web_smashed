import axios from 'axios';
import moment from 'moment';
import { Moment } from 'moment';
import { momentToDate } from '../scenes/helpers/time';
import { Debug, SmashConfig } from '../scenes/interfaces';

export interface ClientInformation {
  city: string;
  region: string;
  country: string;
  ip: string;
  date: Date;
  clientVisits: number;
  countryArea: number;
  latitude: number;
  longitude: number;
  network: string;
  postal: string;
}

export const fetchClientData = async (): Promise<ClientInformation> => {
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

  let response = await fetch('https://ipapi.co/json/');
  let responseJSON = await response.json();

  console.log('responseJSON', responseJSON);

  let clientInformation: ClientInformation = {
    ip: responseJSON.ip,
    date: momentToDate(moment()),
    city: responseJSON.city,
    region: responseJSON.region,
    country: responseJSON.country,
    clientVisits: visitCountNumber,
    countryArea: responseJSON.country_area,
    latitude: responseJSON.latitude,
    longitude: responseJSON.longitude,
    network: responseJSON.network,
    postal: responseJSON.postal,
  };

  console.log(clientInformation);

  return clientInformation;
};

export interface SessionInfo {
  smashConfig: string;
  debug: string;
  ip: string;
  date: Date;
  city: string;
  region: string;
  country: string;
  clientVisits: number;
  countryArea: number;
  latitude: number;
  longitude: number;
  network: string;
  postal: string;
  matrixShotsUnto: string;
  matrixDeathsUnto: string;
  matrixHitsUnto: string;
}

export type GameMatrix = number[][];

export const axiosSaveOne = async (
  clientInformation: ClientInformation,
  smashConfig: SmashConfig,
  debug: Debug
): Promise<SessionInfo> => {
  let sessionInfo: SessionInfo = {
    smashConfig: JSON.stringify(smashConfig),
    debug: JSON.stringify(debug),
    ip: clientInformation.ip,
    date: clientInformation.date,
    city: clientInformation.city,
    region: clientInformation.region,
    country: clientInformation.country,
    clientVisits: clientInformation.clientVisits,
    countryArea: clientInformation.countryArea,
    latitude: clientInformation.latitude,
    longitude: clientInformation.longitude,
    network: clientInformation.network,
    postal: clientInformation.postal,
    matrixShotsUnto: 'null',
    matrixDeathsUnto: 'null',
    matrixHitsUnto: 'null',
  };

  if (process.env.NODE_ENV === 'production') {
    // await axios.post('http://3.86.180.36:8000/api/smashed/create', sessionInfo);
    await axios.post('/api/smashed/create', sessionInfo);
  } else {
    await axios.post('http://localhost:8000/api/smashed/create', sessionInfo);
  }
  return sessionInfo;
};

export const axiosUpsertOne = async (
  momentObject: Moment,
  matrixShotsUnto: GameMatrix,
  matrixDeathsUnto: GameMatrix,
  matrixHitsUnto: GameMatrix
): Promise<SessionInfo> => {
  let myDate = momentToDate(momentObject);
  console.log('about to call timestamp:', myDate);
  let s: SessionInfo = await axios.get('/api/smashed/timestamp/' + myDate);

  let sessionInfo: SessionInfo = {
    smashConfig: s.smashConfig,
    debug: s.debug,
    ip: s.ip,
    date: s.date,
    city: s.city,
    region: s.region,
    country: s.country,
    clientVisits: s.clientVisits,
    countryArea: s.countryArea,
    latitude: s.latitude,
    longitude: s.longitude,
    network: s.network,
    postal: s.postal,
    matrixShotsUnto: JSON.stringify(matrixShotsUnto),
    matrixDeathsUnto: JSON.stringify(matrixDeathsUnto),
    matrixHitsUnto: JSON.stringify(matrixHitsUnto),
  };

  let sessionInfoReturn = {
    smashConfig: JSON.parse(sessionInfo.smashConfig),
    debug: JSON.parse(sessionInfo.debug),
    ip: sessionInfo.ip,
    date: sessionInfo.date,
    city: sessionInfo.city,
    region: sessionInfo.region,
    country: sessionInfo.country,
    clientVisits: sessionInfo.clientVisits,
    countryArea: sessionInfo.countryArea,
    latitude: sessionInfo.latitude,
    longitude: sessionInfo.longitude,
    network: sessionInfo.network,
    postal: sessionInfo.postal,
    matrixShotsUnto: JSON.parse(sessionInfo.matrixShotsUnto),
    matrixDeathsUnto: JSON.parse(sessionInfo.matrixDeathsUnto),
    matrixHitsUnto: JSON.parse(sessionInfo.matrixHitsUnto),
  };

  // let sessionInfo: SessionInfo = {
  //   smashConfig: JSON.stringify(smashConfig),
  //   debug: JSON.stringify(debug),
  //   ip: clientInformation.ip,
  //   timeStamp: clientInformation.timeStamp,
  //   city: clientInformation.city,
  //   region: clientInformation.region,
  //   country: clientInformation.country,
  //   clientVisits: clientInformation.clientVisits,
  //   countryArea: clientInformation.countryArea,
  //   latitude: clientInformation.latitude,
  //   longitude: clientInformation.longitude,
  //   network: clientInformation.network,
  //   postal: clientInformation.postal,
  //   matrixShotsUnto: JSON.stringify(matrixShotsUnto),
  //   matrixDeathsUnto: JSON.stringify(matrixDeathsUnto),
  //   matrixHitsUnto: JSON.stringify(matrixHitsUnto),
  // };

  if (process.env.NODE_ENV === 'production') {
    await axios.patch('/api/smashed/upsert/', sessionInfo);
  } else {
    await axios.patch('http://localhost:8000/api/smashed/upsert', sessionInfo);
  }
  return sessionInfoReturn;
};

export const getAllAxios = async (): Promise<SessionInfo[]> => {
  let response;
  if (process.env.NODE_ENV === 'production') {
    // response = await axios.get('http://3.86.180.36:8000/api/smashed');
    response = await axios.get('/api/smashed');
  } else {
    response = await axios.get('http://localhost:8000/api/smashed');
  }
  return response.data;
};

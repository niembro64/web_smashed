import axios from 'axios';
import moment, { Moment } from 'moment';
import { momentStringToMoment, momentToDate } from '../scenes/helpers/time';
import { Debug, SmashConfig } from '../scenes/interfaces';

export interface ClientInformation {
  city: string;
  region: string;
  country: string;
  ip: string;
  momentCreated: string;
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
    momentCreated: JSON.stringify(moment()),
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

  console.log('clientInformation', clientInformation);

  return clientInformation;
};

export interface SessionInfo {
  smashConfig: string;
  debug: string;
  ip: string;
  momentCreated: string;
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
  momentCreated: Moment,
  clientInformation: ClientInformation,
  smashConfig: SmashConfig,
  debug: Debug
): Promise<SessionInfo> => {
  let sessionInfo: SessionInfo = {
    smashConfig: JSON.stringify(smashConfig),
    debug: JSON.stringify(debug),
    ip: clientInformation.ip,
    momentCreated: moment(momentCreated).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
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

  console.log('sessionInfo', sessionInfo);

  if (process.env.NODE_ENV === 'production') {
    // await axios.post('http://3.86.180.36:8000/api/smashed/create', sessionInfo);
    await axios.post('/api/smashed/create', sessionInfo);
  } else {
    await axios.post('http://localhost:8000/api/smashed/create', sessionInfo);
  }
  return sessionInfo;
};

export const axiosUpsertOne = async (
  momentCreated: Moment,
  matrixShotsUnto: GameMatrix,
  matrixDeathsUnto: GameMatrix,
  matrixHitsUnto: GameMatrix
): Promise<void> => {
  console.log(
    'about to call timestamp:',
    moment(momentCreated).format('YYYY-MM-DDTHH:mm:ss.SSSZ')
  );

  let s: SessionInfo;
  if (process.env.NODE_ENV === 'production') {
    let apiString: string =
      '/api/smashedByMomentCreated/' +
      moment(momentCreated).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    console.log('apiString', apiString);
    s = await axios.get(apiString);
  } else {
    let apiString: string =
      'http://localhost:8000/api/smashedByMomentCreated/' +
      moment(momentCreated).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    console.log('apiString', apiString);
    s = await axios.get(apiString);
  }

  console.log('axiosUpsertOne');
  console.log('PREVIOUS SESSION PULLED', s);

  let si: SessionInfo = {
    smashConfig: s.smashConfig,
    debug: s.debug,
    ip: s.ip,
    momentCreated: moment(momentCreated).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
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
  console.log('NEW SESSION', si);

  // let sessionInfoReturn = {
  //   smashConfig: JSON.parse(si.smashConfig),
  //   debug: JSON.parse(si.debug),
  //   ip: si.ip,
  //   date: si.date,
  //   city: si.city,
  //   region: si.region,
  //   country: si.country,
  //   clientVisits: si.clientVisits,
  //   countryArea: si.countryArea,
  //   latitude: si.latitude,
  //   longitude: si.longitude,
  //   network: si.network,
  //   postal: si.postal,
  //   matrixShotsUnto: JSON.parse(si.matrixShotsUnto),
  //   matrixDeathsUnto: JSON.parse(si.matrixDeathsUnto),
  //   matrixHitsUnto: JSON.parse(si.matrixHitsUnto),
  // };

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
    await axios.patch('/api/smashed/momentCreated/' + si.momentCreated, si);
  } else {
    await axios.patch(
      'http://localhost:8000/api/smashed/momentCreated/' + si.momentCreated,
      si
    );
  }
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

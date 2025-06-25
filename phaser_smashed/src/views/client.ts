import axios from 'axios';
import { INeuralNetworkJSON } from 'brain.js/dist/neural-network';
import moment, { Moment } from 'moment';
import { Debug, SmashConfig } from '../scenes/types';

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

export const nodeEnvIsProduction = process.env.NODE_ENV === 'production';

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

  print('responseJSON', responseJSON);

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

  print('clientInformation', clientInformation);

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

  print('axiosSaveOne: sessionInfo', sessionInfo);

  let res: any = null;
  try {
    if (nodeEnvIsProduction) {
      // await axios.post('http://3.86.180.36:8000/api/smashed/create', sessionInfo);
      res = await axios.post('/api/smashed/create', sessionInfo);
    } else {
      res = await axios.post(
        'http://localhost:8000/api/smashed/create',
        sessionInfo
      );
    }
  } catch (error) {
    print('axiosSaveOne: error', error);
  }

  print('axiosSaveOne: res', res);

  return sessionInfo;
};

export const axiosUpsertOne = async (
  momentCreated: Moment,
  matrixShotsUnto: GameMatrix,
  matrixDeathsUnto: GameMatrix,
  matrixHitsUnto: GameMatrix
): Promise<void> => {
  print(
    'about to call timestamp:',
    moment(momentCreated).format('YYYY-MM-DDTHH:mm:ss.SSSZ')
  );

  let s: SessionInfo;
  if (nodeEnvIsProduction) {
    let apiString: string =
      '/api/smashedByMomentCreated/' +
      moment(momentCreated).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    print('apiString', apiString);
    s = await axios.get(apiString);
  } else {
    let apiString: string =
      'http://localhost:8000/api/smashedByMomentCreated/' +
      moment(momentCreated).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    print('apiString', apiString);
    s = await axios.get(apiString);
  }

  print('axiosUpsertOne');
  print('PREVIOUS SESSION PULLED', s);

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
  print('NEW SESSION', si);

  if (nodeEnvIsProduction) {
    await axios.patch('/api/smashed/momentCreated/' + si.momentCreated, si);
  } else {
    await axios.patch(
      'http://localhost:8000/api/smashed/momentCreated/' + si.momentCreated,
      si
    );
  }
};

export const getAllGameHistory = async (): Promise<SessionInfo[]> => {
  let response;
  if (nodeEnvIsProduction) {
    // response = await axios.get('http://3.86.180.36:8000/api/smashed');
    response = await axios.get('/api/smashed');
  } else {
    response = await axios.get('http://localhost:8000/api/smashed');
  }

  return response.data;
};

export function sumNumbersIn2DArrayString(s: string) {
  const arr: number[][] = JSON.parse(s);
  const sum = arr
    .reduce((acc, curr) => {
      // Concatenate the current sub-array with the accumulator array
      return acc.concat(curr);
    }, [])
    .reduce((acc, curr) => {
      // Check if the current element is a number, and add it to the accumulator
      return typeof curr === 'number' ? acc + curr : acc;
    }, 0);

  return sum;
}

export const print = (...args: any[]): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
};

export const getBarsFromNumber = (num: number): string => {
  if (num < 0) return '';
  return '▇'.repeat(Math.round(num));
};

export const getBarsFromPercent = (
  percent: number,
  maxBars: number = 8
): string => {
  if (percent < 0) return '';

  return getBarsFromNumber(Math.round(percent * maxBars));
};

//////////////////////////////////////////
//////////////////////////////////////////
// NEURAL NETWORK STUFF
//////////////////////////////////////////
//////////////////////////////////////////

const getApiBaseUrl = () => {
  if (nodeEnvIsProduction) {
    return ''; // Assuming the production URL will be relative to the current domain
  } else {
    return 'http://localhost:8000';
  }
};

// Function to fetch the neural network from the backend
export const fetchNeuralNetwork =
  async (): Promise<INeuralNetworkJSON | null> => {
    try {
      const response = await axios.get(`${getApiBaseUrl()}/api/neural-network`);
      const neuralNetwork = response.data;
      // Use the neural network data
      print('Neural network fetched:', neuralNetwork);
      return neuralNetwork;
    } catch (error) {
      console.error('Error fetching neural network:', error);
    }

    return null;
  };

// Function to send the updated neural network to the backend
export const saveNeuralNetwork = async (nn: any): Promise<boolean> => {
  let firstWeight;
  firstWeight = getFirstWeightOfNNJson(nn);
  // if (!nn?.toJSON) {
  // } else {
  //   firstWeight = getFirstWeightOfNNJson(nn);
  // }
  print('///////////////////////////////////');
  print('SAVING NEURAL NETWORK', firstWeight);
  print('///////////////////////////////////');
  try {
    print('attmepting to save neural network');
    const response = await axios.post(
      `${getApiBaseUrl()}/api/neural-network`,
      nn
    );

    print('response', response);

    if (response.status !== 200) {
      print('failed to save neural network');
    }

    const savedNetwork = response.data;
    // Handle the response
    console.log(savedNetwork);

    return true;
  } catch (error) {
    console.error('Error saving neural network:', error);
    return false;
  }
};

export const getFirstWeightOfNNJson = (
  neuralNetwork: INeuralNetworkJSON
): number | null => {
  print('neuralNetwork', neuralNetwork);
  if (
    neuralNetwork &&
    neuralNetwork.layers &&
    neuralNetwork.layers[1] &&
    neuralNetwork.layers[1].weights &&
    neuralNetwork.layers[1].weights[0] &&
    neuralNetwork.layers[1].weights[0][0]
  ) {
    return neuralNetwork.layers[1].weights[0][0];
  }

  if (
    neuralNetwork &&
    // @ts-ignore
    neuralNetwork.weights &&
    // @ts-ignore
    neuralNetwork.weights[1] &&
    // @ts-ignore
    neuralNetwork.weights[1][0] &&
    // @ts-ignore
    neuralNetwork.weights[1][0][0]
  ) {
    // @ts-ignore
    return neuralNetwork.weights[1][0][0];
  }

  return null;
};

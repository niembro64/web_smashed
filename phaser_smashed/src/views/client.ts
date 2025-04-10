import axios from 'axios';
import moment, { Moment } from 'moment';
import { Debug, SmashConfig } from '../scenes/types';
import { INeuralNetworkJSON } from 'brain.js/dist/neural-network';
import { sendRestartSignal } from '../scenes/helpers/state';
import { debugInit } from '../debugInit';
import { debug } from 'console';

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

export const fetchClientData = async (): Promise<ClientInformation | null> => {
  if (!debugInit.Allow_API_Calls) {
    print('axiosUpsertOne: Allow_API_Calls is false');
    return null;
  }
  
  try {
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

    // Check if running in Electron
    const isElectron = window.navigator.userAgent.toLowerCase().indexOf('electron') > -1;
    
    if (isElectron) {
      // Skip API call in Electron and return a mock object
      console.log('Running in Electron - skipping ipapi call');
      let clientInformation: ClientInformation = {
        ip: '127.0.0.1',
        momentCreated: JSON.stringify(moment()),
        city: 'Local',
        region: 'Local',
        country: 'Local',
        clientVisits: visitCountNumber,
        countryArea: 0,
        latitude: 0,
        longitude: 0,
        network: 'local',
        postal: '00000',
      };
      
      print('clientInformation (local)', clientInformation);
      return clientInformation;
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
  } catch (error) {
    console.error('Error in fetchClientData:', error);
    
    // Return a fallback object on error
    return {
      ip: '0.0.0.0',
      momentCreated: JSON.stringify(moment()),
      city: 'Unknown',
      region: 'Unknown',
      country: 'Unknown',
      clientVisits: 0,
      countryArea: 0,
      latitude: 0,
      longitude: 0,
      network: 'unknown',
      postal: '00000',
    };
  }
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

export const axiosSaveOne = async (params: {
  momentCreated: Moment;
  clientInformation: ClientInformation | null;
  smashConfig: SmashConfig;
  debug: Debug;
}): Promise<SessionInfo | null> => {
  const { momentCreated, clientInformation, smashConfig, debug } = params;

  if (!debugInit.Allow_API_Calls) {
    print('axiosSaveOne: Allow_API_Calls is false');
    return null;
  }

  if (!clientInformation) {
    print('axiosSaveOne: clientInformation is null');
    return null;
  }
  
  // Check if running in Electron
  const isElectron = window.navigator.userAgent.toLowerCase().indexOf('electron') > -1;
  if (isElectron) {
    console.log('Running in Electron - skipping session save to API');
    
    // Return a mock session info for Electron
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
    
    return sessionInfo;
  }

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
  if (!debugInit.Allow_API_Calls) {
    print('axiosUpsertOne: Allow_API_Calls is false');
    return;
  }
  
  // Check if running in Electron
  const isElectron = window.navigator.userAgent.toLowerCase().indexOf('electron') > -1;
  if (isElectron) {
    console.log('Running in Electron - skipping matrix upsert to API');
    return;
  }

  try {
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
  } catch (error) {
    console.error('Error in axiosUpsertOne:', error);
  }
};

export const getAllGameHistory = async (): Promise<SessionInfo[]> => {
  if (!debugInit.Allow_API_Calls) {
    print('axiosGetAll: Allow_API_Calls is false');
    return [];
  }
  
  // Check if running in Electron
  const isElectron = window.navigator.userAgent.toLowerCase().indexOf('electron') > -1;
  if (isElectron) {
    console.log('Running in Electron - skipping game history fetch');
    return [];
  }

  try {
    let response;
    if (nodeEnvIsProduction) {
      // response = await axios.get('http://3.86.180.36:8000/api/smashed');
      response = await axios.get('/api/smashed');
    } else {
      response = await axios.get('http://localhost:8000/api/smashed');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching game history:', error);
    return [];
  }
};

export function sumNumbersIn2DArrayString(s: string): number {
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
  // async (): Promise<INeuralNetworkJSON | null> => {
  async (): Promise<any> => {
    if (!debugInit.Allow_API_Calls) {
      print('fetchNeuralNetwork: Allow_API_Calls is false');
      return null;
    }
    
    // Check if running in Electron
    const isElectron = window.navigator.userAgent.toLowerCase().indexOf('electron') > -1;
    if (isElectron) {
      console.log('Running in Electron - skipping neural network fetch');
      return null;
    }

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
  if (!debugInit.Allow_API_Calls) {
    print('saveNeuralNetwork: Allow_API_Calls is false');
    return false;
  }
  
  // Check if running in Electron
  const isElectron = window.navigator.userAgent.toLowerCase().indexOf('electron') > -1;
  if (isElectron) {
    console.log('Running in Electron - skipping neural network save');
    return false;
  }

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
  if (!debugInit.Allow_API_Calls) {
    print('getFirstWeightOfNNJson: Allow_API_Calls is false');
    return null;
  }

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

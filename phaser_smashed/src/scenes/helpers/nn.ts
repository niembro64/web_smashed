import { NeuralNetwork } from 'brain.js';
import Game from '../Game';
import { NNObject } from '../interfaces';

export const nnConfigBaby = {
  inputSize: 2,
  outputSize: 2,
  learningRate: 0.1,
  activation: 'sigmoid',
  hiddenLayers: [3],
};
export const nnConfig = {
  inputSize: 19,
  outputSize: 11,
  learningRate: 0.1,
  activation: 'sigmoid',
  hiddenLayers: [],
};

export const NNTrain = (game: Game): void => {
  let i = 0;
  console.log('TRAINING', i++);
  const net = new NeuralNetwork(nnConfig);
  console.log('TRAINING', i++);
  net.train(game.nnObjects);
  let netJson = net.toJSON();
  console.log('TRAINING', i++);
  // game.net = NeuralNetwork.fromJSON(netJson);
  console.log('netJson', JSON.stringify(netJson, null, 2));
};

export const NNGetOutput = (game: Game): number[] => {
  let player = game.players[0];
  let enemy = game.players[1];
  let input = [
    game.flag.completedCurr ? 1 : 0,
    player.state.name === 'player-state-alive' ? 1 : 0,
    player.emitterDark.visible ? 1 : 0,
    player.char.sprite.x,
    player.char.sprite.y,
    player.char.sprite.body.velocity.x,
    player.char.sprite.body.velocity.y,
    player.char.attackEnergy.sprite.x,
    player.char.attackEnergy.sprite.y,
    player.char.attackEnergy.sprite.body.velocity.x,
    player.char.attackEnergy.sprite.body.velocity.y,
    enemy.char.sprite.x,
    enemy.char.sprite.y,
    enemy.char.sprite.body.velocity.x,
    enemy.char.sprite.body.velocity.y,
    enemy.char.attackEnergy.sprite.x,
    enemy.char.attackEnergy.sprite.y,
    enemy.char.attackEnergy.sprite.body.velocity.x,
    enemy.char.attackEnergy.sprite.body.velocity.y,
  ];

  let output = game.net.run(input);
  return output;
};

export const NNSetPlayer2Output = (game: Game): void => {
  let player = game.players[1];
  let output = NNGetOutput(game);

  player.padCurr.up = output[0] > 0.5 ? true : false;
  player.padCurr.down = output[1] > 0.5 ? true : false;
  player.padCurr.left = output[2] > 0.5 ? true : false;
  player.padCurr.right = output[3] > 0.5 ? true : false;
  player.padCurr.A = output[4] > 0.5 ? true : false;
  player.padCurr.B = output[5] > 0.5 ? true : false;
  player.padCurr.X = output[6] > 0.5 ? true : false;
  player.padCurr.Y = output[7] > 0.5 ? true : false;
  player.padCurr.L = output[8] > 0.5 ? true : false;
  player.padCurr.R = output[9] > 0.5 ? true : false;
  player.padCurr.start = false;
  // player.padCurr.start = output[10] > 0.5 ? true : false;
  player.padCurr.select = output[11] > 0.5 ? true : false;
};

export const addPlayerOneNNObjects = (game: Game): void => {
  let player = game.players[0];
  let enemy = game.players[1];

  let newNNObject: NNObject = {
    input: [
      game.flag.completedCurr ? 1 : 0,
      player.state.name === 'player-state-alive' ? 1 : 0,
      player.emitterDark.visible ? 1 : 0,
      player.char.sprite.x,
      player.char.sprite.y,
      player.char.sprite.body.velocity.x,
      player.char.sprite.body.velocity.y,
      player.char.attackEnergy.sprite.x,
      player.char.attackEnergy.sprite.y,
      player.char.attackEnergy.sprite.body.velocity.x,
      player.char.attackEnergy.sprite.body.velocity.y,
      enemy.char.sprite.x,
      enemy.char.sprite.y,
      enemy.char.sprite.body.velocity.x,
      enemy.char.sprite.body.velocity.y,
      enemy.char.attackEnergy.sprite.x,
      enemy.char.attackEnergy.sprite.y,
      enemy.char.attackEnergy.sprite.body.velocity.x,
      enemy.char.attackEnergy.sprite.body.velocity.y,
    ],
    output: [
      player.padCurr.up ? 1 : 0,
      player.padCurr.down ? 1 : 0,
      player.padCurr.left ? 1 : 0,
      player.padCurr.right ? 1 : 0,
      player.padCurr.A ? 1 : 0,
      player.padCurr.B ? 1 : 0,
      player.padCurr.X ? 1 : 0,
      player.padCurr.Y ? 1 : 0,
      player.padCurr.L ? 1 : 0,
      player.padCurr.R ? 1 : 0,
      player.padCurr.start ? 1 : 0,
      player.padCurr.select ? 1 : 0,
    ],
  };

  game.nnObjects.push(newNNObject);

  console.log('game.nnObjects', game.nnObjects);
};

export const NNDownloadNNObjects = (game: Game): void => {
  let nnObjects = game.nnObjects;
  let nnObjectsString = JSON.stringify(nnObjects, null, 2);
  let blob = new Blob([nnObjectsString], { type: 'text/plain' });
  let url = URL.createObjectURL(blob);
  // Create an anchor tag with the download attribute
  const downloadLink = document.createElement('a');
  downloadLink.setAttribute('href', url);
  downloadLink.setAttribute('download', 'example.txt');

  // Simulate a click on the anchor tag to trigger the download
  downloadLink.click();

  // Clean up the URL object
  URL.revokeObjectURL(url);
};

export const netJson = {
  type: 'NeuralNetwork',
  sizes: [19, 12],
  layers: [
    {
      weights: [],
      biases: [],
    },
    {
      weights: [
        [
          0.09678597748279572, 0.1679760217666626, 0.1506688892841339,
          -3.618373394012451, -1.594062328338623, 0.03222081437706947,
          2.2827041149139404, -2.9758715629577637, -3.003563404083252,
          0.1250201016664505, 0.11185777932405472, -4.1849775314331055,
          -0.6057445406913757, 0.7776682376861572, 0.1271287351846695,
          -7.670292377471924, -0.8568991422653198, -1.2273575067520142,
          -0.021293148398399353,
        ],
        [
          -0.04012995958328247, 0.1965559422969818, -0.002209334634244442,
          -0.21711644530296326, -0.3049347996711731, -0.2786625921726227,
          0.013314659707248211, -0.047357458621263504, -0.41269412636756897,
          0.13459967076778412, -0.21352128684520721, -0.2446907013654709,
          -0.12212469428777695, -0.05232134461402893, 0.05674772709608078,
          -0.1371689736843109, 0.056925270706415176, 0.360365629196167,
          0.06339409202337265,
        ],
        [
          -0.18215425312519073, 0.16287066042423248, 0.011360425502061844,
          -10.731146812438965, -5.571242332458496, -5.018329620361328,
          -0.30929136276245117, 3.006457805633545, -13.081642150878906,
          -0.08740556240081787, -0.05473795160651207, -12.028013229370117,
          -5.059574127197266, -0.35235312581062317, 0.8787196278572083,
          3.126725435256958, 2.924747943878174, -0.1746511161327362,
          -0.04834211245179176,
        ],
        [
          0.10366752743721008, -0.10392268747091293, -0.18516068160533905,
          0.18230082094669342, -0.006869683042168617, 0.08635887503623962,
          -0.14273777604103088, 0.15030556917190552, -0.1364278495311737,
          -0.09185539931058884, 0.15250594913959503, 0.2248520404100418,
          0.09340803325176239, 0.12516076862812042, 0.0846657007932663,
          0.1540941298007965, -0.05549982190132141, -0.0022857210133224726,
          -0.15549202263355255,
        ],
        [
          0.12432760000228882, -0.0071741268038749695, 0.11232984066009521,
          0.022462932392954826, -0.1411697119474411, 0.34893620014190674,
          -0.41001003980636597, 0.10238209366798401, 0.6665776968002319,
          0.14296813309192657, -0.2469116747379303, 0.20873259007930756,
          -0.07699910551309586, -0.0018941151211038232, -0.08450096845626831,
          0.5218428373336792, 0.19900594651699066, -0.04863912612199783,
          -0.19614388048648834,
        ],
        [
          -0.12618528306484222, 0.06764829158782959, 0.12013065069913864,
          -2.4305357933044434, -0.8509172201156616, -0.06835590302944183,
          -1.1848680973052979, 1.0705009698867798, 1.0494734048843384,
          -0.051046036183834076, -1.295181155204773, -2.9454383850097656,
          -0.738185465335846, 0.10584960132837296, -1.1517057418823242,
          1.0415546894073486, 1.1063319444656372, -0.06885303556919098,
          0.02286839671432972,
        ],
        [
          0.11672621220350266, -0.16952811181545258, 0.06256077438592911,
          -1.7922070026397705, -0.8407130241394043, -0.18669342994689941,
          0.9282199144363403, -2.4562900066375732, -1.4866571426391602,
          0.06358097493648529, 0.19037070870399475, -2.0276787281036377,
          -0.536356508731842, 0.18360033631324768, -0.9621937274932861,
          -0.9032012820243835, -0.7035084962844849, 0.7912200689315796,
          -0.0388217531144619,
        ],
        [
          0.06984712183475494, 0.14973436295986176, -0.09523438662290573,
          -0.18582427501678467, -0.06362690031528473, 0.14089858531951904,
          0.17122595012187958, -0.055253151804208755, -0.04420777037739754,
          -0.0640946701169014, -0.017007911577820778, -0.11638035625219345,
          -0.18545521795749664, 0.19291986525058746, -0.03730699419975281,
          -0.048578742891550064, -0.1870431900024414, 0.09647621214389801,
          -0.19964200258255005,
        ],
        [
          0.0997716411948204, 0.029165176674723625, 0.13487687706947327,
          -0.17095404863357544, -0.01756265014410019, 0.06355966627597809,
          -0.19324541091918945, -0.19475388526916504, -0.18026630580425262,
          -0.06468284130096436, -0.10053156316280365, -0.3127191662788391,
          -0.2090597003698349, 0.13552416861057281, 0.1330316960811615,
          -0.16444465517997742, -0.05295553058385849, 0.027453472837805748,
          0.15959849953651428,
        ],
        [
          -0.04867986589670181, 0.08499094098806381, -0.1388632357120514,
          -4.2824835777282715, -1.672670841217041, 0.01062186248600483,
          -3.7190704345703125, 1.4801276922225952, 1.1476250886917114,
          -0.17887338995933533, -3.682251214981079, -4.790842533111572,
          -1.8921022415161133, 0.04788646101951599, -3.424853563308716,
          1.743622064590454, 1.5813106298446655, 0.11100088059902191,
          0.11929637938737869,
        ],
        [
          0.1958508938550949, 0.12689833343029022, 0.12316569685935974,
          0.1844581514596939, 0.030120214447379112, -0.19658263027668,
          -0.1037917286157608, 0.07191059738397598, 0.12686549127101898,
          -0.19290511310100555, -0.0413704551756382, 0.048798512667417526,
          -0.05977775529026985, 0.1917594075202942, 0.14538447558879852,
          0.021424753591418266, 0.046237602829933167, -0.024169331416487694,
          0.058741677552461624,
        ],
        [
          0.1867770254611969, 0.07873577624559402, -0.07656173408031464,
          -0.8760218024253845, -0.307368665933609, -0.09060389548540115,
          -1.0894616842269897, 0.35375556349754333, 0.10730564594268799,
          -0.10161224007606506, -1.0590379238128662, -0.8262119293212891,
          -0.5558141469955444, -0.12081200629472733, -0.763594925403595,
          0.2588709890842438, 0.25417688488960266, -0.13364362716674805,
          0.09850744158029556,
        ],
      ],
      biases: [
        0.19541089236736298, -0.09318767488002777, 0.11288225650787354,
        -0.1811055839061737, 0.04163626208901405, 0.12412286549806595,
        0.18313539028167725, -0.08652094006538391, 0.19710490107536316,
        0.10292970389127731, -0.06505978107452393, 0.1498209685087204,
      ],
    },
  ],
  inputLookup: null,
  inputLookupLength: 0,
  outputLookup: null,
  outputLookupLength: 0,
  options: {
    inputSize: 19,
    outputSize: 11,
    binaryThresh: 0.5,
    learningRate: 0.1,
    activation: 'sigmoid',
    hiddenLayers: [],
  },
  trainOpts: {
    activation: 'sigmoid',
    iterations: 20000,
    errorThresh: 0.005,
    log: false,
    logPeriod: 10,
    leakyReluAlpha: 0.01,
    learningRate: 0.1,
    momentum: 0.1,
    callbackPeriod: 10,
    timeout: 'Infinity',
    beta1: 0.9,
    beta2: 0.999,
    epsilon: 1e-8,
  },
};

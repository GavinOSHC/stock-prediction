const brain = require("brain.js");
const csvtojson = require("csvtojson");

// GET DATA FROM CSV FILE
const data = async () => {
  const csvFilePath = "./data/EURUSD_M30.csv";
  return await csvtojson().fromFile(csvFilePath);
};

// NORMALISE DATA FUNCTION
const normaliseData = (data, lowest, highest) => {
  return {
    open: (data.Open - lowest) / (highest - lowest),
    high: (data.High - lowest) / (highest - lowest),
    low: (data.Low - lowest) / (highest - lowest),
    close: (data.Close - lowest) / (highest - lowest),
  };
};

// DENORMALISE DATA FUNCTION
const denormaliseData = (data, lowest, highest) => {
  return {
    open: data.open * (highest - lowest) + lowest,
    high: data.high * (highest - lowest) + lowest,
    low: data.low * (highest - lowest) + lowest,
    close: data.close * (highest - lowest) + lowest,
  };
};

//HELPER FUNCTIONS TO GET HIGHEST VALUE IN THE DATA
const getHighestValueInData = (data) => {
  const max = (data, key) => {
    const maxValue = data.reduce((prev, current) =>
      prev[`${key}`] > current[`${key}`] ? prev : current
    );
    return Number(maxValue[`${key}`]);
  };

  const maxOpen = max(data, "Open");
  const maxHigh = max(data, "High");
  const maxLow = max(data, "Low");
  const maxClose = max(data, "Close");

  return Math.max(...[maxOpen, maxHigh, maxLow, maxClose]);
};

//HELPER FUNCTIONS TO GET LOWEST VALUE IN THE DATA
const getLowestValueInData = (data) => {
  const low = (data, key) => {
    const lowValue = data.reduce((prev, current) =>
      prev[`${key}`] < current[`${key}`] ? prev : current
    );
    return Number(lowValue[`${key}`]);
  };

  const lowOpen = low(data, "Open");
  const lowHigh = low(data, "High");
  const lowLow = low(data, "Low");
  const lowClose = low(data, "Close");

  return Math.min(...[lowOpen, lowHigh, lowLow, lowClose]);
};

const main = async () => {
  const stockData = await data();

  const normaliseHighValue = getHighestValueInData(stockData);
  const normaliseLowValue = getLowestValueInData(stockData);

  // NORMALISE THE DATA
  const normalisedStockData = stockData.map((item) =>
    normaliseData(item, normaliseLowValue, normaliseHighValue)
  );

  // TRAINING DATA SPLIT INTO A 2D ARRAY WITH 5 ITEMS
  const trainingData = [
    normalisedStockData.slice(0, 5),
    normalisedStockData.slice(5, 10),
    normalisedStockData.slice(10, 15),
    normalisedStockData.slice(15, 20),
    normalisedStockData.slice(20, 25),
    normalisedStockData.slice(25, 30),
    normalisedStockData.slice(30, 35),
    normalisedStockData.slice(35, 40),
    normalisedStockData.slice(40, 45),
    normalisedStockData.slice(45, 50),
  ];

  // SET UP NEURAL NETWORK
  const neuralNetwork = new brain.recurrent.LSTMTimeStep({
    inputSize: 4,
    hiddenLayers: [8, 8],
    outputSize: 4,
  });

  neuralNetwork.train(trainingData, {
    learningRate: 0.005,
    errorThresh: 0.002,
    // log: (stats) => console.log(stats),
  });

  const result = neuralNetwork.run(trainingData[0]);

  const denormaliseResult = denormaliseData(
    result,
    normaliseLowValue,
    normaliseHighValue
  );

  console.log(denormaliseResult);
};

main();

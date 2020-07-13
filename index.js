const brain = require("brain.js");
const csvtojson = require("csvtojson");

const csvFilePath = "./data/EURUSD_M30.csv";

const data = async () => {
  return await csvtojson().fromFile(csvFilePath);
};

const main = async () => {
  const stockData = await data();

  console.log(stockData);
};

main();

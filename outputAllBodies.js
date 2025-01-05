import { ethers } from "ethers";
import fetch from "node-fetch";
import fs from "fs";
import path from 'path';
import sharp from 'sharp';

const bodyIndexes = [0, 1, 2, 3, 4];

// constants //
const CONTRACT_ADDRESS = "0x07152bfde079b5319e5308C43fB1Dbc9C76cb4F9"; // ChonksMain on Base
const pngOutputSize = 1024;
const svgStart = '<svg shape-rendering="crispEdges" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg"><style>rect{width:1px; height: 1px;} .bg{width:30px; height: 30px;} </style>'
const svgEnd = '</svg>'

const ABI = [
  "function getBodyImageSvg(uint256 _index) view returns (string)"
];

// provider //
const BASE_RPC_URL = "https://mainnet.base.org";
const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);

// contract //
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

if (!fs.existsSync('./output-all-bodies-transparent-svg')) {
  fs.mkdirSync('./output-all-bodies-transparent-svg');
}
if (!fs.existsSync('./output-all-bodies-transparent-png')) {
  fs.mkdirSync('./output-all-bodies-transparent-png');
}

(async () => {
  try {
    for (let bodyIndex of bodyIndexes) {
      console.log(`Processing Body Index: ${bodyIndex}`);

      const svgOutputPath = path.join('./output-all-bodies-transparent-svg', `${bodyIndex}.svg`);
      const pngOutputPath = path.join('./output-all-bodies-transparent-png', `${bodyIndex}.png`);

      const bodyImageSvg = await contract.getBodyImageSvg(bodyIndex);
      console.log('Body Image SVG:', bodyImageSvg);

      const svgFull = svgStart + bodyImageSvg + svgEnd;
      fs.writeFileSync(svgOutputPath, svgFull);
      console.log(`Saved SVG for Body Index ${bodyIndex} at ${svgOutputPath}`);

      // Convert to PNG using sharp
      await sharp(Buffer.from(svgFull))
        .resize(pngOutputSize, pngOutputSize)
        .png()
        .toFile(pngOutputPath);

      console.log(`Saved PNG for Body Index ${bodyIndex} at ${pngOutputPath}`);
    }

  } catch (error) {
    console.error("Error occurred:", error);
  }
})();

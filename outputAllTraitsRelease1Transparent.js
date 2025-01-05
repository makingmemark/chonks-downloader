import { ethers } from "ethers";
import fetch from "node-fetch";
import fs from "fs";
import path from 'path';
import sharp from 'sharp';

// these are the trait indexes defined in First Release Data Minter: https://basescan.org/address/0x7a929e4D752c488b263C5F7FfA8f1465010eb3Bb#code

const accessory = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
const head = [1000, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 1011, 1012, 1013, 1014, 1015, 1016, 1017, 1018, 1019, 1020, 1021, 1022, 1023, 1024, 1025, 1026, 1027, 1028, 1029, 1030, 1031];
const hair = [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036];
const face = [3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010, 3011];
const top = [4000, 4001, 4002, 4003, 4004, 4005, 4006, 4007, 4008, 4009, 4010, 4011, 4012, 4013, 4014, 4015, 4016, 4017, 4018, 4019, 4020, 4021, 4022, 4023, 4024, 4025, 4026, 4027, 4028, 4029, 4030, 4031, 4032, 4033, 4034, 4035, 4036, 4037, 4038, 4039, 4040, 4041, 4042, 4043, 4044, 4045, 4046, 4047, 4048, 4049, 4050, 4051, 4052, 4053, 4054, 4055, 4056, 4057, 4058, 4059, 4060, 4061, 4062, 4063, 4064, 4065, 4066, 4067, 4068, 4069, 4070, 4071, 4072];
const bottom = [5000, 5001, 5002, 5003, 5004, 5005, 5006, 5007, 5008, 5009, 5010, 5011, 5012, 5013, 5014, 5015, 5016, 5017, 5018, 5019, 5020, 5021, 5022, 5023, 5024, 5025, 5026, 5027, 5028, 5029, 5030, 5031, 5032, 5033, 5034, 5035, 5036, 5037, 5038, 5039, 5040, 5041, 5042, 5043, 5044];
const shoes = [6000, 6001, 6002, 6003, 6004, 6005, 6006, 6007, 6008, 6009, 6010, 6011, 6012, 6013, 6014, 6015, 6016, 6017];

const allCategories = [accessory, head, hair, face, top, bottom, shoes];

// constants //
const CONTRACT_ADDRESS = "0x6B8f34E0559aa9A5507e74aD93374D9745CdbF09"; // ChonkTraits on Base
const pngOutputSize = 1024;
const svgStart = '<svg shape-rendering="crispEdges" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg"><style>rect{width:1px; height: 1px;} .bg{width:30px; height: 30px;} </style>'
const svgEnd = '</svg>'

const ABI = [
  "function totalSupply() view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function getTraitIndexToMetadata(uint256 _traitIndex) view returns (tuple(uint256 traitIndex, string traitName, uint8 traitType, bytes colorMap, bytes zMap, address dataMinterContract, address creatorAddress, string creatorName, string release))",
  "function getTraitImageSvg(uint256 _traitIndex) view returns (string)"
];

// provider //
const BASE_RPC_URL = "https://mainnet.base.org";
const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);

// contract //
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

if (!fs.existsSync('./output-all-traits-transparent-svg')) {
  fs.mkdirSync('./output-all-traits-transparent-svg');
}
if (!fs.existsSync('./output-all-traits-transparent-png')) {
  fs.mkdirSync('./output-all-traits-transparent-png');
}

(async () => {
  try {
    for (let category of allCategories) {
      for (let traitIndex of category) {
        console.log(`Processing Trait Index: ${traitIndex}`);

        const svgOutputPath = path.join('./output-all-traits-transparent-svg', `${traitIndex}.svg`);
        const pngOutputPath = path.join('./output-all-traits-transparent-png', `${traitIndex}.png`);

        const traitImageSvg = await contract.getTraitImageSvg(traitIndex);
        console.log('Trait Image SVG:', traitImageSvg);

        const svgFull = svgStart + traitImageSvg + svgEnd;
        fs.writeFileSync(svgOutputPath, svgFull);
        console.log(`Saved SVG for Trait Index ${traitIndex} at ${svgOutputPath}`);

        // Convert to PNG using sharp
        await sharp(Buffer.from(svgFull))
          .resize(pngOutputSize, pngOutputSize)
          .png()
          .toFile(pngOutputPath);

        console.log(`Saved PNG for Trait Index ${traitIndex} at ${pngOutputPath}`);
      }
    }
  } catch (error) {
    console.error("Error occurred:", error);
  }
})();

import { ethers } from "ethers";
import fetch from "node-fetch";
import fs from "fs";
import path from 'path';
import sharp from 'sharp';

// constants //
const CONTRACT_ADDRESS = "0x07152bfde079b5319e5308C43fB1Dbc9C76cb4F9"; // ChonksMain on Base
const tokenId = 122;
const pngOutputSize = 1024;
const svgOutputPath = path.join('./output-chonk-svg', `${tokenId}.svg`);
const pngOutputPath = path.join('./output-chonk-png', `${tokenId}.png`);
const ABI = [
  "function totalSupply() view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function renderAsDataUri2D(uint256 tokenId) view returns (string)"
];

// provider //
const BASE_RPC_URL = "https://mainnet.base.org";
const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);

// contract //
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

if (!fs.existsSync('./output-chonk-svg')) {
    fs.mkdirSync('./output-chonk-svg');
}
if (!fs.existsSync('./output-chonk-png')) {
    fs.mkdirSync('./output-chonk-png');
}

(async () => {
  try {
    console.log(`Processing Token ID: ${tokenId}`);

    const tokenURI = await contract.renderAsDataUri2D(tokenId);
    console.log(`Fetched Token URI for Token ID ${tokenId}: ${tokenURI}`);

    let metadata;
    if (tokenURI.startsWith("data:application/json;base64,")) {
      const base64Metadata = tokenURI.split(",")[1];
      metadata = JSON.parse(Buffer.from(base64Metadata, "base64").toString());
    } else {
      const response = await fetch(tokenURI);
      metadata = await response.json();
    }

    console.log(`Metadata for Token ID ${tokenId}:`, metadata);

    // SVG //
    let svgData = metadata.image;
    if (!svgData) {
      throw new Error(`No image data found for Token ID ${tokenId}`);
    }

    console.log(`SVG Content for Token ID ${tokenId}:`, svgData);


    let svgContent;
    let svgBuffer;
    if (svgData.startsWith("data:image/svg+xml;base64,")) {
        svgBuffer = Buffer.from(svgData.split(",")[1], 'base64');
        svgContent = svgBuffer.toString('utf-8');
    } else if (svgData.startsWith("<svg")) {
        svgContent = svgData;
    } else {
        try {
            svgContent = decodeURIComponent(svgData);
        } catch (e) {
            console.error(`Error decoding SVG for token ${tokenId}:`, e);
            svgContent = svgData;
        }
    }

    if (!svgContent.includes("<svg")) {
        console.error(`Invalid SVG content for token ${tokenId}`);
        console.log("Content:", svgContent.substring(0, 100) + "...");
    } else {
        fs.writeFileSync(svgOutputPath, svgContent);
        console.log(`Saved SVG for Token ID ${tokenId} at ${svgOutputPath}`);
    }

    // PNG //
    sharp(svgBuffer)
      .resize(pngOutputSize, pngOutputSize)
      .png()
      .toFile(pngOutputPath, (err, info) => {
        if (err) {
          console.error('Error:', err);
        } else {
          console.log('PNG created:', info);
        }
      });

    console.log(`Saved PNG for Token ID ${tokenId} at ${pngOutputPath}`);
  } catch (error) {
    console.error("Error occurred:", error);
  }
})();

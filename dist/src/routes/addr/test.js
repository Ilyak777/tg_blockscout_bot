"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const base64url_1 = __importDefault(require("base64url"));
const exampleData = {
  hash: "0x1d9868dbd926421c5459f4251d2a91db3ce3fbea3c1ae73e17394196e9baf2f3",
  chainId: 1,
  userTgId: "123456789",
  timestamp: Date.now(),
};
const createUniqueId = (data) => {
  const rawString = `${data.hash}::${data.chainId}::${data.userTgId}::${data.timestamp}`;
  return base64url_1.default.encode(rawString);
};
const decodeUniqueId = (id) => {
  const decodedString = base64url_1.default.decode(id);
  const [hash, chainId, userTgId, timestamp] = decodedString.split("::");
  return {
    hash,
    chainId: parseInt(chainId, 10),
    userTgId,
    timestamp: parseInt(timestamp, 10),
  };
};

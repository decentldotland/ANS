import Arweave from "arweave";
import { SmartWeaveNodeFactory } from "redstone-smartweave";

export const arweave = Arweave.init({
  host: "arweave.net",
  protocol: "https",
  port: 443,
  timeout: 20000,
  logging: false,
});

export const smartweave = SmartWeaveNodeFactory.memCached(arweave);
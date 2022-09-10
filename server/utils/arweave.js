import Arweave from "arweave";
import axios from "axios";
import { SmartWeaveNodeFactory } from "redstone-smartweave";

export const arweave = Arweave.init({
  host: "arweave.net",
  protocol: "https",
  port: 443,
  timeout: 20000,
  logging: false,
});

export const smartweave = SmartWeaveNodeFactory.memCached(arweave);

export async function getBlockTimestampById(block_id) {
  try {
    const q = {
      query: `query {
    blocks(height: {
      min: ${block_id},
      max: ${block_id}
    }) {
      edges {
        cursor
        node {
            id
            timestamp
            height
            previous  
        }
      }
    }
  }`,
    };
    const response = await axios.post("https://arweave.net/graphql", q, {
      headers: { "Content-Type": "application/json" },
    });
    const gateway_res = response.data.data.blocks.edges;
    const res = gateway_res[0].node.timestamp;
    return res;
  } catch (error) {
    return null;
  }
}

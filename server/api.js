import express from "express";
import cors from "cors";
import { smartweave, getBlockTimestampById } from "./utils/arweave.js";
import { pk } from "./utils/wallet.js";
import { ANS_CONTRACT_ID } from "./utils/contracts.js";

const app = express();
const port = process.env.PORT || 3000;
const jwk = JSON.parse(pk);

app.use(
  cors({
    origin: "*",
  })
);

// functions
async function addressOf(label) {
  const contract = smartweave.contract(ANS_CONTRACT_ID).connect(jwk);

  const response = await contract.viewState({
    function: "getAddressOf",
    label: `${label}.ar`,
  });

  if (response.type !== "ok") {
    return response.errorMessage;
  }

  return response.result;
}

async function profile(AddyLabel) {
  let argType;

  if (AddyLabel.length <= 15) {
    argType = "label";
  } else if (AddyLabel.length === 43) {
    argType = "address";
  } else {
    return { result: undefined };
  }

  const state = await _getState();

  switch (argType) {
    case "label":
      const normalizedLabel = AddyLabel.toLowerCase().normalize("NFKC");
      const label = state.users.find((usr) =>
        usr.ownedLabels.find((domain) => domain["label"] === normalizedLabel)
      );
      if (!label) {
        return { result: undefined };
      }

      label.timestamp = await getBlockTimestampById(
        label.ownedLabels[0]?.acquisationBlock
      );

      return label;

    case "address":
      const address = state.users.find((usr) => usr.user == AddyLabel);
      if (!address) {
        return { result: undefined };
      }

      address.timestamp = await getBlockTimestampById(
        label.ownedLabels[0]?.acquisationBlock
      );
      return address;

    default:
      return { result: undefined };
  }
}

async function totalDistributedRewards() {
  const state = await _getState();

  return String(state.totalProfitSharing);
}

async function rewardPerUser(address) {
  _validateArweaveAddress(address);
  const state = await _getState();

  const user = state.users.find((usr) => usr.user === address);

  if (user) {
    return { earnings: user["earnings"] };
  }

  return {};
}

async function isOwned(label) {
  const contract = smartweave.contract(ANS_CONTRACT_ID).connect(jwk);

  const response = await contract.viewState({
    function: "isOwned",
    label: `${label}`,
  });

  if (response.type !== "ok") {
    return response.errorMessage;
  }

  return response.result;
}

async function balanceOf(address) {
  const contract = smartweave.contract(ANS_CONTRACT_ID).connect(jwk);

  const response = await contract.viewState({
    function: "balanceOf",
    address: address,
  });

  if (response.type !== "ok") {
    return response.errorMessage;
  }

  return response.result;
}

async function usersCount() {
  const contract = smartweave.contract(ANS_CONTRACT_ID).connect(jwk);

  const response = await contract.viewState({
    function: "usersCount",
  });

  if (response.type !== "ok") {
    return response.errorMessage;
  }

  return response.result;
}

// HELPER FUNCTIONS
async function _getState() {
  const contract = smartweave.contract(ANS_CONTRACT_ID);
  const state = (await contract.readState()).state;
  return state;
}

function _validateArweaveAddress(address) {
  if (typeof address !== "string" || address.length !== 43) {
    throw new Error("invalid Arweave address");
  }
}

// API ENDPOINTS
app.get("/users", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const count = await usersCount();

  res.send(count);
});

app.get("/address/:label", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const address = await addressOf(req.params.label);

  res.send(address);
});

app.get("/profile/:AddyLabel", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const result = await profile(req.params.AddyLabel);

  res.send(result);
});

app.get("/totalRewards", async (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  const rewards = await totalDistributedRewards();

  res.send(rewards);
});

app.get("/earning/:address", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const earnings = await rewardPerUser(req.params.address);

  res.send(earnings);
});

app.get("/isOwned/:label", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const result = await isOwned(req.params.label);

  res.send(result);
});

app.get("/balance/:address", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const result = await balanceOf(req.params.address);

  res.send(result);
});

app.listen(port, () => {
  console.log(`listening at port:${port}`);
});

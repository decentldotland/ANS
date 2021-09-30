// imports
const express = require("express");
const { SmartWeaveNodeFactory } = require("redstone-smartweave");
const Arweave = require("arweave");
const { pk } = require("./exports/wallet.js");
const { ANS_CONTRACT_ID } = require("./exports/contracts.js");

// Configs
const arweave = Arweave.init({
  host: "arweave.net",
  protocol: "https",
  port: 443,
  timeout: 20000,
  logging: false,
});

const smartweave = SmartWeaveNodeFactory.memCached(arweave);
const app = express();
const port = process.env.PORT || 3000;

const jwk = JSON.parse(pk);

// functions
async function profile(label) {
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

  if (AddyLabel.length <= 7) {
    argType = "label";
  } else if (AddyLabel.length === 43) {
    argType = "address";
  } else {
    return { result: undefined };
  }

  const contract = smartweave.contract(ANS_CONTRACT_ID);
  const state = (await contract.readState()).state;
  console.log(state);

  switch (argType) {
    case "label":
      const label = state.users.find((usr) => usr.currentLabel === AddyLabel);
      if (!label) {
        return { result: undefined };
      }

      return label;

    case "address":
      const address = state.users.find((usr) => usr.user == AddyLabel);
      if (!address) {
        return { result: undefined };
      }

      return address;

    default:
      return { result: undefined };
  }
}

// e.g. /address/decent
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

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});

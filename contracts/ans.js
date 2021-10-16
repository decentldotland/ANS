export async function handle(state, action) {
  const input = action.input;
  const caller = action.caller;
  // STATE
  const users = state.users;
  const balances = state.balances;
  const availableLabels = state.availableLabels;
  const foreignCalls = state.foreignCalls;
  const invocations = state.invocations;
  const deposits = state.deposits;
  const withdrawals = state.withdrawals;
  // CONSTANTS
  const WDLT = "FdY68iYqTvA40U34aXQBBYseGmIUmLV-u57bT7LZWm0";
  //SMARTWEAVE API
  const blockHeight = SmartWeave.block.height;

  // alphabetical lower case characters + integers from 0 to 9
  const allowedCharCodes = [
    48, 49, 50, 51, 52, 53, 54, 55, 55, 56, 57, 97, 98, 99, 100, 101, 102, 103,
    104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118,
    119, 120, 121, 122,
  ];
  // ERRORS LIST,
  const ERROR_INVALID_ARWEAVE_ADDRESS =
    "the provided string is not a valid Arweave address";
  const ERROR_INVALID_PRIMITIVE_TYPE =
    "the function was supplied by an invalid primitive type";
  const ERROR_MISSING_REQUIRED_PARAMETER =
    "the function still require parameters";
  const ERROR_INVALID_STRING_LENGTH =
    "the supplied string length is not accepted";
  const ERROR_INVALID_CHARCODE =
    "the string contains an invalid character code";
  const ERROR_LABEL_SUPPLY_IS_ZERO = "label's supply is consumed";
  const ERROR_LABEL_ALREADY_ACQUIRED = "the given label has been minted";
  const ERROR_MISSING_REQUIRED_TAG = "the transaction requires a missing tag";
  const ERROR_INVALID_AVATAR_TYPE =
    "only image/* MIME type is allowed for avatars";
  const ERROR_INVALID_URL_TYPE = "the given url mime type is not supported";
  const ERROR_CALLER_EXIST = "the caller has already init-mint";
  const ERROR_CALLER_NOT_EXIST = "the caller has not init-mint";
  const ERROR_USER_HAS_NOT_REGISTERED =
    "caller must execute 'setProfile' before performing this action";
  const ERROR_INVALID_LABEL_FORMAT = "the given string is not a valid label";
  const ERROR_LABEL_DOES_NOT_RESOLVE =
    "the given label does not resolve to an address";
  const ERROR_DATA_TYPE_UNSUPPORTED =
    "the provided primitive type is not supported";
  const ERROR_INVALID_LENGTH = "options entries count exceed the limits";
  const ERROR_DUPLICATED_TX =
    "this transaction's deposit has been already reflected";
  const ERROR_INVALID_DEPOSITOR =
    "the function's caller is not the deposit TXID owner";
  const ERROR_INVALID_DEPOSIT_TX =
    "the provided deposit transaction is not valid";
  const ERROR_MISSING_INPUT_PROPOERTY = "missing a reuired Input's key";
  const ERROR_WRONG_FCP_FUNCTION = "deposit's function must be a 'transfer'";
  const ERROR_INVALID_TARGET =
    "deposit's TX target must be equal to this contract ID";
  const ERROR_CALLER_NOT_REGISTERED = "the caller has not deposited before";
  const ERROR_NOT_INTEGER = "only ineteger values are allowed";
  const ERROR_AMOUNT_TOO_HIGH =
    "the withdrawal qty is higher than the caller's balance";
  const ERROR_INVALID_WITHDRAWAL_AMOUNT =
    "only positive, non-zero integers are allowed";
  const ERROR_LABEL_NOT_OWNED = "the given label is owned by an another user";
  const ERROR_NO_EXTRA_LABEL_OWNED =
    "the caller does not own more than one label to switch amongst it";
  const ERROR_TRANSFERING_CURRENT_LABEL =
    "you have to switch the label from currentLabel to ownedLabels before making the transfer";
  const ERROR_INVALID_TARGET_TRANSFER =
    "the target is not a valid arweave address";
  const ERROR_CANNOT_ABDICT_CURENT_LABEL =
    "label's abdiction is only allowed for multi-owned labels";
  const ERROR_INVALID_CALLER =
    "the caller does not has the permission to call this function";
  const ERROR_INVALID_GH_USRNAME =
    "the given username is not a valid github username";
  const ERROR_INVALID_TWTR_USRNAME =
    "the given username is not a valid Twitter username";
  const ERROR_INVALID_CUSTOM_URL = "the given url is not valid";

  if (input.function === "setProfile") {
    const username = input.username;
    const bio = input.bio;
    const url = input.url;

    let avatar = input.avatar;
    let github = input.github;
    let twitter = input.twitter;
    let customUrl = input.customUrl;

    const socialLinks = {};

    _validateArweaveAddress(caller);
    _validateStringTypeLength(bio, 0, 75);
    _validateStringTypeLength(username, 2, 7);

    const label = _validateUsername(username);
    const labelScarcity = _getUsernameScarcity(label);
    const labelMintingCost = _getMintingCost(label);

    if (availableLabels[labelScarcity] === 0) {
      throw new ContractError(ERROR_LABEL_SUPPLY_IS_ZERO);
    }

    if (users.find((user) => user["user"] === caller)) {
      throw new ContractError(ERROR_CALLER_EXIST);
    }

    if (avatar.length === 0) {
      avatar = "78WdrVhNZ2i_KbimqcV4j-drX04HJr3E6UyD7xWc84Q";
    } else {
      await _validateAvatar(avatar);
    }

    if (url.length > 0) {
      await _validateUrl(url);
    }

    if (github) {
      _validateGithubUsername(github);
      socialLinks["github"] = github;
    }

    if (twitter) {
      _validateTwitterUsername(twitter);
      socialLinks["twitter"] = twitter;
    }

    if (customUrl) {
      _validateCustomUrl(customUrl);
      socialLinks["customUrl"] = customUrl;
    }

    // subs 1 from the label supply
    availableLabels[labelScarcity] -= 1;
    _checkAndSubstractMintingCost(labelMintingCost, caller);

    if (label.length > 2) {
      _por(label, labelMintingCost);
    }

    const labelObject = {
      label: label,
      scarcity: labelScarcity,
      acquisationBlock: SmartWeave.block.height,
      mintedFor: labelMintingCost,
    };

    users.push({
      user: caller,
      currentLabel: label,
      ownedLabels: [labelObject],
      bio: bio,
      url: url,
      avatar: avatar,
      earnings: 0,
      links: socialLinks,
    });

    return { state };
  }

  if (input.function === "mint") {
    const username = input.username;

    _validateArweaveAddress(caller);
    _validateStringTypeLength(username, 2, 7);

    const label = _validateUsername(username);
    const labelScarcity = _getUsernameScarcity(label);
    const labelMintingCost = _getMintingCost(label);

    if (availableLabels[labelScarcity] === 0) {
      throw new ContractError(ERROR_LABEL_SUPPLY_IS_ZERO);
    }

    const callerIndex = users.findIndex((user) => user["user"] === caller);

    if (callerIndex === -1) {
      throw new ContractError(ERROR_USER_HAS_NOT_REGISTERED);
    }

    const labelObject = {
      label: label,
      scarcity: labelScarcity,
      acquisationBlock: SmartWeave.block.height,
      mintedFor: labelMintingCost,
    };

    availableLabels[labelScarcity] -= 1;
    _checkAndSubstractMintingCost(labelMintingCost, caller);

    if (label.length > 2) {
      _por(label, labelMintingCost);
    }

    users[callerIndex]["ownedLabels"].push(labelObject);

    return { state };
  }

  if (input.function === "switch") {
    const label = input.label;

    _validateArweaveAddress(caller);
    const desiredLabel = _validateUsername(label, "read");
    const callerIndex = _validateLabelSwitching(desiredLabel, caller);

    users[callerIndex]["currentLabel"] = desiredLabel;

    return { state };
  }

  if (input.function === "updateBio") {
    const bio = input.bio;

    const callerIndex = _validateUserExistence(caller);

    _validateStringTypeLength(bio, 0, 75);
    users[callerIndex]["bio"] = bio;
    return { state };
  }

  if (input.function === "updateAvatar") {
    const avatar = input.avatar;

    const callerIndex = _validateUserExistence(caller);

    await _validateAvatar(avatar);
    users[callerIndex]["avatar"] = avatar;
    return { state };
  }

  if (input.function === "updateUrl") {
    const url = input.url;

    const callerIndex = _validateUserExistence(caller);

    await _validateUrl(url);
    users[callerIndex]["url"] = url;
    return { state };
  }

  if (input.function === "updateGithub") {
    const github = input.github;

    const callerIndex = _validateUserExistence(caller);
    _validateGithubUsername(github);
    users[callerIndex]["links"]["github"] = github;

    return { state };
  }

  if (input.function === "updateTwitter") {
    const twitter = input.twitter;

    const callerIndex = _validateUserExistence(caller);
    _validateTwitterUsername(twitter);
    users[callerIndex]["links"]["twitter"] = twitter;

    return { state };
  }

  if (input.function === "updateCustomUrl") {
    const customUrl = input.customUrl;

    const callerIndex = _validateUserExistence(caller);
    _validateCustomUrl(customUrl);
    users[callerIndex]["links"]["customUrl"] = customUrl;

    return { state };
  }

  if (input.function === "abdictOwnership") {
    const label = input.label;

    _validateArweaveAddress(caller);
    const desiredLabel = _validateUsername(label, "read");
    const { labelIndex, callerIndex } = _checkAbdicationPermission(
      desiredLabel,
      caller
    );

    users[callerIndex]["ownedLabels"].splice(labelIndex, 1);

    return { state };
  }

  if (input.function === "transfer") {
    const target = input.target;
    const label = input.label;
    let autoGeneratedTargetAcc = void 0;

    _validateArweaveAddress(caller);
    _validateArweaveAddress(target);

    const desiredLabel = _validateUsername(label, "read");
    const { ownedIn, callerIndex } = _getTransferablityStatus(
      desiredLabel,
      caller,
      target
    );

    const callerProfile = users[callerIndex];
    const isTargetRegistered = users.find((usr) => usr.user === target);
    const labelObject = callerProfile["ownedLabels"].find(
      (labels) => labels.label === desiredLabel
    );

    if (!isTargetRegistered) {
      autoGeneratedTargetAcc = {
        user: target,
        currentLabel: "",
        ownedLabels: [],
        bio: "account's metadata auto-generated at a transfer event",
        avatar: "78WdrVhNZ2i_KbimqcV4j-drX04HJr3E6UyD7xWc84Q",
      };
    }

    if (ownedIn === "currentLabel") {
      if (!isTargetRegistered) {
        autoGeneratedTargetAcc["currentLabel"] = desiredLabel;
        autoGeneratedTargetAcc["ownedLabels"].push(labelObject);
        users.splice(callerIndex, 1);
        users.push(autoGeneratedTargetAcc);

        return { state };
      }

      const targetIndex = users.findIndex((usr) => usr.user === target);
      users[targetIndex]["ownedLabels"].push(labelObject);
      users.splice(callerIndex, 1);

      return { state };
    }

    if (ownedIn === "ownedLabels") {
      const labelIndexInOwnedLabels = callerProfile["ownedLabels"].findIndex(
        (labels) => labels.label === desiredLabel
      );

      if (!isTargetRegistered) {
        autoGeneratedTargetAcc["currentLabel"] = desiredLabel;
        autoGeneratedTargetAcc["ownedLabels"] = [labelObject];
        users[callerIndex]["ownedLabels"].splice(labelIndexInOwnedLabels, 1);
        users.push(autoGeneratedTargetAcc);

        return { state };
      }

      const targetIndex = users.findIndex((usr) => usr.user === target);
      users[targetIndex]["ownedLabels"].push(labelObject);
      users[callerIndex]["ownedLabels"].splice(labelIndexInOwnedLabels, 1);

      return { state };
    }
  }

  // CONTRACT OWNER PERMISSIONS
  if (input.function === "addUrlMimeType") {
    const type = input.type;

    await _validateOnlyOwner();
    state.supportedUrlTypes.push(type);

    return { state };
  }

  if (input.function === "revokeUrlMimeType") {
    const type = input.type;

    await _validateOnlyOwner();
    const typeIndex = state.supportedUrlTypes.findIndex(type);

    if (typeIndex !== -1) {
      state.supportedUrlTypes.splice(typeIndex, 1);
    }

    return { state };
  }

  if (input.function === "isOwned") {
    const label = input.label;

    const validatedLabel = _validateUsername(label, "read");
    const existence = users.find((usr) =>
      usr["ownedLabels"].find((labels) => labels.label === validatedLabel)
    );

    const response = existence ? true : false;

    return {
      result: {
        isOwned: response,
      },
    };
  }

  // WDLT ACTIONS

  if (input.function === "getAddressOf") {
    const label = input.label;
    const validatedLabel = _getLabel(label);
    const userObject = state.users.find(
      (user) => user["currentLabel"] === validatedLabel
    );

    if (!userObject) {
      throw new ContractError(ERROR_LABEL_DOES_NOT_RESOLVE);
    }

    const address = userObject["user"];

    return {
      result: {
        address: address,
      },
    };
  }

  if (input.function === "withdraw") {
    const qty = input.qty;

    if (!balances[caller]) {
      throw new ContractError(ERROR_CALLER_NOT_REGISTERED);
    }

    _validateWithdrawQty(qty);

    balances[caller] -= qty;

    const invocation = {
      function: "transfer",
      target: caller,
      qty: qty,
    };

    state.foreignCalls.push({
      contract: WDLT,
      input: invocation,
    });

    withdrawals.push(SmartWeave.transaction.id);

    return { state };
  }

  if (input.function === "deposit") {
    const tx = input.tx;

    await _validateDepositTransaction(tx, caller);
    const depositQty = await _getDepositQty(tx);

    if (!balances[caller]) {
      balances[caller] = 0;
    }

    balances[caller] += depositQty;
    deposits.push(tx);

    return { state };
  }

  // HELPER FUNCTIONS
  function _validateArweaveAddress(address) {
    if (typeof address !== "string" || address.length !== 43) {
      throw new ContractError(ERROR_INVALID_ARWEAVE_ADDRESS);
    }
  }

  function _validateUserExistence(address) {
    _validateArweaveAddress(address);
    const callerIndex = users.findIndex((usr) => usr.user === address);

    if (callerIndex === -1) {
      throw new ContractError(ERROR_CALLER_NOT_EXIST);
    }

    return callerIndex;
  }

  function _validateStringTypeLength(string, minLen, maxLex) {
    if (typeof string !== "string") {
      throw new ContractError(ERROR_INVALID_PRIMITIVE_TYPE);
    }

    if (minLen === void 0 || maxLex === void 0) {
      throw new ContractError(ERROR_MISSING_REQUIRED_PARAMETER);
    }

    if (string.length < minLen || string.length > maxLex) {
      throw new ContractError(ERROR_INVALID_STRING_LENGTH);
    }
  }

  function _validateUsername(username, option) {
    const caseFolded = username.toLowerCase();
    const normalizedUsername = caseFolded.normalize("NFKC");

    const stringCharcodes = normalizedUsername
      .split("")
      .map((char) => char.charCodeAt(0));

    for (let charCode of stringCharcodes) {
      if (!allowedCharCodes.includes(charCode)) {
        throw new ContractError(ERROR_INVALID_CHARCODE);
      }
    }

    if (normalizedUsername.length < 2 || normalizedUsername.length > 7) {
      throw new ContractError(ERROR_INVALID_STRING_LENGTH);
    }
    // used to just validate label's syntax
    // and return the normalized label string
    if (option === "read") {
      return normalizedUsername;
    }

    if (
      users.find(
        (user) =>
          user["currentLabel"] === normalizedUsername ||
          user["ownedLabels"].findIndex(
            (labels) => labels.label === normalizedUsername
          ) !== -1
      )
    ) {
      throw new ContractError(ERROR_LABEL_ALREADY_ACQUIRED);
    }

    // return the proccessed username
    return normalizedUsername;
  }

  async function _validateAvatar(avatar) {
    _validateStringTypeLength(avatar, 43, 43);
    const tagsMap = new Map();
    const avatar_tx = await SmartWeave.unsafeClient.transactions.get(avatar);
    const tags = avatar_tx.get("tags");

    for (let tag of tags) {
      let key = tag.get("name", { decode: true, string: true });
      let value = tag.get("value", { decode: true, string: true });
      tagsMap.set(key, value);
    }

    if (!tagsMap.has("Content-Type")) {
      throw new ContractError(ERROR_MISSING_REQUIRED_TAG);
    }

    if (!tagsMap.get("Content-Type").startsWith("image/")) {
      throw new ContractError(ERROR_INVALID_AVATAR_TYPE);
    }
  }

  async function _validateUrl(url) {
    _validateStringTypeLength(url, 43, 43);

    const tagsMap = new Map();
    const url_tx = await SmartWeave.unsafeClient.transactions.get(url);
    const tags = url_tx.get("tags");

    for (let tag of tags) {
      let key = tag.get("name", { decode: true, string: true });
      let value = tag.get("value", { decode: true, string: true });
      tagsMap.set(key, value);
    }

    if (!tagsMap.has("Content-Type")) {
      throw new ContractError(ERROR_MISSING_REQUIRED_TAG);
    }

    if (!state.supportedUrlTypes.includes(tagsMap.get("Content-Type"))) {
      throw new ContractError(ERROR_INVALID_URL_TYPE);
    }
  }

  function _validateGithubUsername(username) {
    if (typeof username !== "string") {
      throw new ContractError(ERROR_INVALID_PRIMITIVE_TYPE);
    }

    const regex = /^([a-zA-Z0-9_]{1,38})$/i;
    const test = regex.test(username);

    if (!test) {
      throw new ContractError(ERROR_INVALID_GH_USRNAME);
    }
  }

  function _validateTwitterUsername(username) {
    if (typeof username !== "string") {
      throw new ContractError(ERROR_INVALID_PRIMITIVE_TYPE);
    }
    const regex = /^@?([a-zA-Z0-9_]{1,15})$/i;
    const test = regex.test(username);

    if (!test) {
      throw new ContractError(ERROR_INVALID_TWTR_USRNAME);
    }
  }

  function _validateCustomUrl(link) {
    if (typeof link !== "string") {
      throw new ContractError(ERROR_INVALID_PRIMITIVE_TYPE);
    }
  }

  async function _validateOnlyOwner() {
    const contractOwner = SmartWeave.contract.owner;

    if (caller !== contractOwner) {
      throw new ContractError(ERROR_INVALID_CALLER);
    }
  }

  function _getUsernameScarcity(username) {
    switch (username.length) {
      case 2:
        return "ni";
      case 3:
        return "san";
      case 4:
        return "shi";
      case 5:
        return "go";
      case 6:
        return "roku";
      case 7:
        return "shichi";
      default:
        throw new ContractError(ERROR_INVALID_STRING_LENGTH);
    }
  }

  function _getMintingCost(username) {
    switch (username.length) {
      case 2:
        return 1;
      case 3:
        return 0.1;
      case 4:
        return 0.01;
      case 5:
        return 0.001;
      case 6:
        return 0.0001;
      case 7:
        return 0.00001;
    }
  }

  function _getLabel(username) {
    if (typeof username !== "string" || !username.endsWith(".ar")) {
      throw new ContractError(ERROR_INVALID_LABEL_FORMAT);
    }

    const radical = username.slice(0, username.indexOf(".ar"));
    const label = _validateUsername(radical, "read");

    return label;
  }

  function _validateInteger(number, allowNull) {
    if (typeof allowNull === "undefined") {
      throw new ContractError("ERROR_REQUIRED_ARGUMENT");
    }

    if (!Number.isInteger(number)) {
      throw new ContractError("ERROR_INVALID_NUMBER_TYPE");
    }

    if (allowNull) {
      if (number < 0) {
        throw new ContractError("ERROR_NEGATIVE_INTEGER");
      }
    } else if (number <= 0) {
      throw new ContractError("ERROR_INVALID_NUMBER_TYPE");
    }
  }

  async function _validateDepositTransaction(txid, address) {
    if (deposits.includes(txid)) {
      throw new ContractError(ERROR_DUPLICATED_TX);
    }

    const txObject = await SmartWeave.unsafeClient.transactions.get(txid);
    const txOwner = txObject["owner"];
    const ownerAddress = await SmartWeave.unsafeClient.wallets.ownerToAddress(
      txOwner
    );

    if (ownerAddress !== address) {
      throw new ContractError(ERROR_INVALID_DEPOSITOR);
    }

    const fcpTxsValidation = await SmartWeave.contracts.readContractState(
      WDLT,
      void 0,
      true
    );
    const validity = fcpTxsValidation["validity"];

    if (!validity[txid]) {
      throw new ContractError(ERROR_INVALID_DEPOSIT_TX);
    }
  }

  async function _getDepositQty(txid) {
    const tagsMap = new Map();

    const depositTransactionObject =
      await SmartWeave.unsafeClient.transactions.get(txid);
    const depositTransactionTags = depositTransactionObject.get("tags");

    for (let tag of depositTransactionTags) {
      const key = tag.get("name", { decode: true, string: true });
      const value = tag.get("value", { decode: true, string: true });
      tagsMap.set(key, value);
    }

    if (!tagsMap.has("Input")) {
      throw new ContractError(ERROR_MISSING_REQUIRED_TAG);
    }

    const inputObject = JSON.parse(tagsMap.get("Input"));
    const inputsMap = new Map(Object.entries(inputObject));

    if (!inputsMap.has("qty")) {
      throw new ContractError(ERROR_MISSING_INPUT_PROPOERTY);
    }

    if (!inputsMap.has("function")) {
      throw new ContractError(ERROR_MISSING_INPUT_PROPOERTY);
    }

    if (inputsMap.get("function") !== "transfer") {
      throw new ContractError(ERROR_WRONG_FCP_FUNCTION);
    }

    if (inputsMap.get("target") !== SmartWeave.contract.id) {
      throw new ContractError(ERROR_INVALID_TARGET);
    }

    return inputsMap.get("qty");
  }

  function _validateWithdrawQty(qty) {
    if (!Number.isInteger(qty)) {
      throw new ContractError(ERROR_NOT_INTEGER);
    }

    if (qty > balances[caller]) {
      throw new ContractError(ERROR_AMOUNT_TOO_HIGH);
    }

    if (qty <= 0) {
      throw new ContractError(ERROR_INVALID_WITHDRAWAL_AMOUNT);
    }
  }

  function _checkAndSubstractMintingCost(mintingCost, address) {
    if (!balances[address]) {
      throw new ContractError(ERROR_CALLER_NOT_REGISTERED);
    }

    if (balances[address] < mintingCost) {
      throw new ContractError(ERROR_UNSUFFICIENT_BALANCE);
    }

    balances[address] -= mintingCost;
  }

  function _validateLabelSwitching(label, address) {
    const callerIndex = users.findIndex((usr) => usr.user === address);
    const callerProfile = users[callerIndex];

    if (callerProfile["ownedLabels"].length < 2) {
      throw new ContractError(ERROR_NO_EXTRA_LABEL_OWNED);
    }

    if (
      !callerProfile["ownedLabels"].find((labels) => labels.label === label)
    ) {
      throw new ContractError(ERROR_LABEL_NOT_OWNED);
    }

    return callerIndex;
  }

  function _getTransferablityStatus(label, from_address, to_address) {
    if (from_address === to_address) {
      throw new ContractError(ERROR_INVALID_TARGET_TRANSFER);
    }

    const callerIndex = users.findIndex((usr) => usr.user === from_address);
    const callerProfile = users[callerIndex];

    // check if the label is owner in the "ownedLabels" array
    // this conditional chain checks if the label is owned at all or no
    if (callerProfile["currentLabel"] !== label) {
      if (
        !callerProfile["ownedLabels"].find((labels) => labels.label === label)
      ) {
        throw new ContractError(ERROR_LABEL_NOT_OWNED);
      }
      return {
        ownedIn: "ownedLabels",
        callerIndex: callerIndex,
      };
    }
    // if the label's transfer attempt in the currentLabel with other owned labels in ownedLabels array
    if (
      callerProfile["currentLabel"] === label &&
      callerProfile["ownedLabels"].length > 1
    ) {
      throw new ContractError(ERROR_TRANSFERING_CURRENT_LABEL);
    }
    // if the caller only has one label, which is the chosen one for the transfer,
    // make the transfer and burn caller's account
    return {
      ownedIn: "currentLabel",
      callerIndex: callerIndex,
    };
  }

  function _checkAbdicationPermission(label, address) {
    const callerIndex = users.findIndex(
      (usr) =>
        usr.user === address &&
        usr["ownedLabels"].find((labels) => labels.label === label)
    );

    if (callerIndex === -1) {
      throw new ContractError(ERROR_LABEL_NOT_OWNED);
    }

    if (users[callerIndex]["ownedLabels"].length === 1) {
      throw new ContractError(ERROR_CANNOT_ABDICT_CURENT_LABEL);
    }

    const labelIndex = users[callerIndex]["ownedLabels"].findIndex(
      (labels) => labels.label === label
    );

    return {
      labelIndex: labelIndex,
      callerIndex: callerIndex,
    };
  }

  function _getSharePerRadicalOwner(label) {
    const radicalsOwners = users.filter((usr) =>
      usr["ownedLabels"].filter(
        (labels) => label.includes(labels["label"]) && label.length < 6
      )
    );
    const owners = {};

    for (let owner of radicalsOwners) {
      owners[owner.user] = {};

      owner["ownedLabels"].forEach((labels) => {
        if (label.includes(labels["label"])) {
          if (!owners[owner.user][labels["scarcity"]]) {
            owners[owner.user][labels["scarcity"]] = 1;
          } else {
            owners[owner.user][labels["scarcity"]] += 1;
          }
        }
      });
    }

    return owners;
  }

  function _allocatePerRadicalScarcity(label) {
    const owners = _getSharePerRadicalOwner(label);

    const shares = {
      ni: [],
      san: [],
      shi: [],
      go: [],
      roku: [],
    };

    for (let user in owners) {
      const userShares = owners[user];

      for (let labelShare of Object.entries(userShares)) {
        const data = [user, labelShare[1]];
        shares[labelShare[0]].push(data);
      }
    }

    return shares;
  }

  function _por(toMintLable, mintingCost) {
    const a = toMintLable.length;
    const unsortedPercentages = [];
    const foundRadicals = [];
    const shares = _allocatePerRadicalScarcity(toMintLable);

    for (let radical in shares) {
      const b = __getRadicalLength(radical); // radical length

      if (b < a && a !== b) {
        const radicalPercentage = (((a + b) / (a - b)) * 100) / Math.E ** b;
        unsortedPercentages.push((radicalPercentage / 100) * mintingCost);
        foundRadicals.push(radical);
      }
    }

    const sortedPercentages = unsortedPercentages.sort((a, b) => a - b);
    const scarcityPercentagesArray = sortedPercentages.map(
      (percentage, index) => [foundRadicals[index], percentage]
    );
    const finalDistribution = Object.fromEntries(scarcityPercentagesArray);

    return __distributeProfitSharing(finalDistribution, shares, mintingCost);
  }

  function __distributeProfitSharing(finalDistribution, shares, mintingCost) {
    for (let share in shares) {
      const sharePerScarcity = shares[share].flat();

      if (sharePerScarcity.length >= 1) {
        const totalShares = sharePerScarcity
          .filter((element) => typeof element === "number")
          .reduce((a, b) => a + b, 0);
        const totalRewardFromFee =
          (finalDistribution[share] / 100) * mintingCost;
        const rewardPerShare = totalRewardFromFee / totalShares;

        shares[share].forEach((user) => {
          if (!balances[user[0]]) {
            // if the user's account was setted up at transfer event
            balances[user[0]] = 0;
          }
          const sharePerUser = user[1];
          balances[user[0]] += rewardPerShare * sharePerUser;
          state.totalProfitSharing += rewardPerShare * sharePerUser;
          __addUserEarning(user[0], rewardPerShare * sharePerUser);
        });
      }
    }
  }

  function __addUserEarning(address, rewardToAdd) {
    const userIndex = users.findIndex((usr) => usr.user === address);
    users[userIndex]["earnings"] += rewardToAdd;
  }

  function __getRadicalLength(scarcity) {
    switch (scarcity) {
      case "ni":
        return 2;

      case "san":
        return 3;

      case "shi":
        return 4;

      case "go":
        return 5;

      case "roku":
        return 6;
    }
  }
}

/**
 * 
 * 
 * 
 * 
 * 
 *                               ░█████╗░███╗░░██╗░██████╗
 *                               ██╔══██╗████╗░██║██╔════╝
 *                               ███████║██╔██╗██║╚█████╗░
 *                               ██╔══██║██║╚████║░╚═══██╗
 *                               ██║░░██║██║░╚███║██████╔╝
 *                               ╚═╝░░╚═╝╚═╝░░╚══╝╚═════╝░
 * 
 *                                 Arweave Name Service 
 * 
 * @author charmful0x
 * @website https://ar.page
 * 
 **/


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
  const WDLT = "";
  //SMARTWEAVE API
  const blockHeight = SmartWeave.block.height;

  // alphabetical lower case characters + integers from 0 to 9
  const allowedCharCodes = [
    48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 97, 98, 99, 100, 101, 102, 103, 104,
    105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119,
    120, 121, 122,
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
  const ERROR_MISSING_INPUT_PROPOERTY = "missing a required Input's key";
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
  const ERROR_REQUIRED_ARGUMENT = "the function has a missing argument";
  const ERROR_INVALID_NUMBER_TYPE = "the number must be a positive integer";
  const ERROR_NEGATIVE_INTEGER = "a negative number has been seeded";
  const ERROR_NO_SUBDOMAINS_AVAILABLE = "you have reached the free-subdomains limit";
  const ERROR_INVALID_ARWEAVE_TXID = "an invalid TXID has been passed";


  if (input.function === "setProfile") {
    const username = input.username;
    const nickname = input.nickname;
    const bio = input.bio;
    const url = input.url;

    let avatar = input.avatar;
    let github = input.github;
    let twitter = input.twitter;
    let instagram = input.instagram;
    let customUrl = input.customUrl;

    const socialLinks = {};

    _validateArweaveAddress(caller);
    _validateStringTypeLength(bio, 0, 150);
    _validateStringTypeLength(username, 2, 15);

    const label = _validateUsername(username);
    const validatedNickname = _validateNickname(nickname);
    const labelScarcity = _getUsernameScarcity(label);
    const labelMintingCost = _getMintingCost(label);
    const addressColor = _generateAddressColor(caller);

    if (availableLabels[labelScarcity] === 0) {
      throw new ContractError(ERROR_LABEL_SUPPLY_IS_ZERO);
    }

    if (users.find((user) => user["user"] === caller)) {
      throw new ContractError(ERROR_CALLER_EXIST);
    }

    if (avatar?.length) {
      await _validateAvatar(avatar)
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
    
    if (instagram) {
      _validateInstagramUsername(instagram);
      socialLinks["instagram"] = instagram;
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
    } else {
      _addMintingCostToTreasury(labelMintingCost);
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
      nickname: nickname,
      address_color: addressColor,
      bio: bio,
      url: url,
      avatar: avatar,
      earnings: 0,
      links: socialLinks,
      subdomains: {},
      freeSubdomains: 3,
    });

    return { state };
  }

  if (input.function === "mint") {
    const username = input.username;

    _validateArweaveAddress(caller);
    _validateStringTypeLength(username, 2, 15);

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
    } else {
      _addMintingCostToTreasury(labelMintingCost);
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
  
  if (input.function === "updateProfileMetadata") {
    if (Object.keys(input).length <= 1) {
      throw new ContractError(ERROR_MISSING_INPUT_PROPOERTY);
    }
    const callerIndex = _validateUserExistence(caller);

    if (input.bio) {
      _validateStringTypeLength(input.bio, 0, 150);
      users[callerIndex]["bio"] = input.bio;
    }

    if (input.avatar) {
      await _validateAvatar(input.avatar);
      users[callerIndex]["avatar"] = input.avatar;
    }

    if (input.nickname) {
      const validatedNickname = _validateNickname(input.nickname);
      users[callerIndex]["nickname"] = input.nickname;
    }

    if (input.github) {
      _validateGithubUsername(input.github);
      users[callerIndex]["links"]["github"] = input.github;
    }

    if (input.instagram) {
      _validateInstagramUsername(input.instagram);
      users[callerIndex]["links"]["instagram"] = input.instagram;
    }

    if (input.twitter) {
      _validateTwitterUsername(input.twitter);
      users[callerIndex]["links"]["twitter"] = input.twitter;
    }

    if (input.url) {
      // Arweave TXID with a supported MIME type
      await _validateUrl(input.url);
      users[callerIndex]["url"] = input.url;
    }

    if (input.customUrl) {
      // custom url (string)
      _validateCustomUrl(input.customUrl);
      users[callerIndex]["links"]["customUrl"] = input.customUrl;
    }

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
    const targetColor = _generateAddressColor(target);
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
        nickname: `arweaver#${SmartWeave.block.height}`,
        address_color: targetColor,
        bio: "account's metadata auto-generated at a transfer event",
        avatar: "",
        links: {},
        subdomains: {},
        freeSubdomains: 3,
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
  
   if (input.function === "setSubdomain") {
    // testnet implementation:
    // the subdomain is bound to the
    // any `currentLabel`. in other words
    // the subdomain is bound to the
    // label that points to the user's address
    // at any time
    const subdomain = input.subdomain;
    const value = input.value;

    const callerIndex = _validateUserExistence(caller);
    const normalizedSubdomain = _validateSubdomain(callerIndex, subdomain);

    await _validateSubdomainValue(value);
    // add subdomain OR update it's value if it exist already
    state.users[callerIndex]["subdomains"][normalizedSubdomain] = value;
    // substract a free subdomain
    state.users[callerIndex].freeSubdomains -= 1;

    return { state };
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
  
  // API FUNCTIONS
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
  
  if (input.function === "balanceOf") {
    // the function return the DLT balance of an
    // address that is deposited in the SWC (ANS)
    const address = input.address;

    _validateArweaveAddress(address);

    const balance = balances[address] ? balances[address] : 0;

    return {
      result: {
        balance: balance,
      },
    };
  }
  
  if (input.function === "usersCount") {
    const count = state.users.length;

    return {
      result: {
        count: count,
      },
    };
  }

  // WDLT FUNCTIONS
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

    if (normalizedUsername.length < 2 || normalizedUsername.length > 15) {
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
  
  function _validateInstagramUsername(username) {
    if (typeof username !== "string") {
      throw new ContractError(ERROR_INVALID_PRIMITIVE_TYPE);
    }
    const regex = /^([a-zA-Z0-9_]{1,30})$/i;
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
  
  function _validateNickname(nickname) {
    _validateStringTypeLength(nickname, 1, 30);
    // trim the nickname to ensure a good UX
    // e.g. eliminate right-left whitespace
    const trimmed = nickname.trim();
    _validateStringTypeLength(trimmed, 1, 30);

    return trimmed;
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
        return "yon";
      case 5:
        return "go";
      case 6:
        return "roku";
      case 7:
        return "nana";
      case 8:
        return "hachi";
      case 9:
        return "ku";
      case 10:
        return "juu";
      case 11:
        return "juuichi";
      case 12:
        return "juuni";
      case 13:
        return "juusan";
      case 14:
        return "juuyon";
      case 15:
        return "juugo";
      default:
        throw new ContractError(ERROR_INVALID_STRING_LENGTH);
    }
  }

  function _getMintingCost(username) {
    const len = username.length;
    const UP = 1; // unit price = 1 DLT
    const unitsCount = 16 - len; // (maxLen + 1) - toMintLen

    return unitsCount * UP;
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
      throw new ContractError(ERROR_REQUIRED_ARGUMENT);
    }

    if (!Number.isInteger(number)) {
      throw new ContractError(ERROR_INVALID_NUMBER_TYPE);
    }

    if (allowNull) {
      if (number < 0) {
        throw new ContractError(ERROR_NEGATIVE_INTEGER);
      }
    } else if (number <= 0) {
      throw new ContractError(ERROR_INVALID_NUMBER_TYPE);
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
    const callerIndex = _validateUserExistence(address);
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
    const radicalsOwners = {};

    for (let usr of state.users) {
      const radicalOwner = usr["ownedLabels"].filter(
        (labels) => label.includes(labels["label"]) && label.length < 16
      );

      if (radicalOwner.length >= 1) {
        radicalsOwners[usr.user] = radicalOwner;
      }
    }
    const owners = {};

    for (let owner in radicalsOwners) {
      // owner === address

      owners[owner] = {};

      radicalsOwners[owner].forEach((labels) => {
        if (label.includes(labels["label"])) {
          if (!owners[owner][labels["scarcity"]]) {
            owners[owner][labels["scarcity"]] = 1;
          } else {
            owners[owner][labels["scarcity"]] += 1;
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
      yon: [],
      go: [],
      roku: [],
      nana: [],
      hachi: [],
      ku: [],
      juu: [],
      juuichi: [],
      juuni: [],
      juusan: [],
      juuyon: [],
    };

    for (let user in owners) {
      const userShares = owners[user];

      for (let labelShare of Object.entries(userShares)) {
        const shareName = labelShare[0];
        const userShares = labelShare[1];
        const data = [user, userShares];
        
        shares[shareName].push(data);
      }
    }

    return shares;
  }
  
  function _generateAddressColor(address) {
    let hash = 0;
    for (let i = 0; i < address.length; i++) {
      hash = address.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = "#";
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += ("00" + value.toString(16)).substr(-2);
    }

    return color;
  }
  
  function _addMintingCostToTreasury(amount) {
    if (!(SmartWeave.contract.owner in state.balances)) {
      balances[SmartWeave.contract.owner] = 0;
    }

    balances[SmartWeave.contract.owner] += +amount;
  }

  function _por(toMintLable, mintingCost) {
    const a = toMintLable.length;
    const unsortedPercentages = [];
    const foundRadicals = [];
    const shares = _allocatePerRadicalScarcity(toMintLable);
    let totalPorSharedPercentage = 0;

    for (let radical in shares) {
      const b = __getRadicalLength(radical); // radical length

      if (b < a && a !== b) {
        const radicalPercentage = (((a + b) / (a - b)) * 100) / Math.E ** b;
        unsortedPercentages.push(radicalPercentage);
        totalPorSharedPercentage += radicalPercentage;
        foundRadicals.push(radical);
      }
    }

    const sortedPercentages = unsortedPercentages.sort((a, b) => a - b);
    const scarcityPercentagesArray = sortedPercentages.map(
      (percentage, index) => [foundRadicals[index], percentage]
    );
    const finalDistribution = Object.fromEntries(scarcityPercentagesArray);
    // treasury amount is the fixed non-distributed percentage per minted
    // label of 2 < length < 15
    // e.g. in this case https://github.com/decentldotland/ANS/blob/main/incentives/img/len10.png
    // treasury's allocation is (100e^-2 - 37.8e^-2) * mintingCost 
    const treasuryAmount = (100 - totalPorSharedPercentage) / 100 * mintingCost;
    _addMintingCostToTreasury(treasuryAmount);

    return __distributeProfitSharing(finalDistribution, shares, mintingCost, treasuryAmount);
  }

  function __distributeProfitSharing(finalDistribution, shares, mintingCost, treasuryAmount) {
    // this variable represents the theoretical fraction of minting fee
    // allocated for distribution as per PoR (even if there are no roots)
    let rootsAllocatedDistribution = mintingCost - treasuryAmount;
    for (let share in shares) {
      const sharePerScarcity = shares[share].flat();

      if (sharePerScarcity.length >= 1) { // equal to 'if roots exist in this label type'
        const totalShares = sharePerScarcity
          .filter((element) => typeof element === "number")
          .reduce((a, b) => a + b, 0);
        const totalRewardFromFee =
          (finalDistribution[share] / 100) * mintingCost;
        const rewardPerShare = totalRewardFromFee / totalShares;

        shares[share].forEach((user) => {
          const userAddress = user[0];
          const sharePerUser = user[1];
          
          if (!balances[userAddress]) {
            // if the user's account was setted up at a previous label transfer event
            balances[userAddress] = 0;
          }
          // update the balance
          balances[userAddress] += rewardPerShare * sharePerUser;
          state.totalProfitSharing += rewardPerShare * sharePerUser;
          // deduct the distributed amount from the theoretical 
          // allocation as a root was found & rewarded
          rootsAllocatedDistribution -= rewardPerShare *  sharePerUser;
          // adds stats record, does not update the balance
          __addUserEarning(userAddress, rewardPerShare * sharePerUser);
        });
      }
    }
    // non-distributed shares from the theoretical allocated rewards are added back
    // to the treasury (if it's not 100% distributed ; roots found in all label types)
    if (rootsAllocatedDistribution > 0) {
      _addMintingCostToTreasury(rootsAllocatedDistribution);
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

      case "yon":
        return 4;

      case "go":
        return 5;

      case "roku":
        return 6;

      case "nana":
        return 7;

      case "hachi":
        return 8;

      case "ku":
        return 9;

      case "juu":
        return 10;

      case "juuichi":
        return 11;

      case "juuni":
        return 12;

      case "juusan":
        return 13;

      case "juuyon":
        return 14;
    }
  }
  
  function _validateSubdomain(userIndex, subdomain) {
    const normalizedSubdomain = subdomain.toLowerCase().trim().normalize("NFKC");
    _validateStringTypeLength(normalizedSubdomain, 2, 30);

    const stringCharcodes = normalizedSubdomain
      .split("")
      .map((char) => char.charCodeAt(0));

    for (let charCode of stringCharcodes) {
      if (!allowedCharCodes.includes(charCode)) {
        throw new ContractError(ERROR_INVALID_CHARCODE);
      }
    }

    const userFreeSubdomains = state.users[userIndex].freeSubdomains;
    const userSubdomains = state.users[userIndex].subdomains;

    if (userFreeSubdomains === 0) {
      throw new ContractError(ERROR_NO_SUBDOMAINS_AVAILABLE);
    }

    return normalizedSubdomain;
  }

  async function _validateSubdomainValue(txid) {
    try {
      await SmartWeave.unsafeClient.transactions.get(txid);
    } catch (err) {
      return new ContractError(ERROR_INVALID_ARWEAVE_TXID);
    }
  }

}

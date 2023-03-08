export async function handle(state, action) {
  const input = action.input;

  if (input.function === "updateWalletMetadata") {
    const { jwk_n, sig, nickname, bio, avatar, websites, socials, banner } = input;

    const caller = await _ownerToAddress(jwk_n);
    const callerIndex = _getCallerIndex(caller);

    await _verifyArSignature(jwk_n, sig);

    ContractAssert(
      nickname || bio || avatar || banner || websites.length || socials.length,
      "ERROR_NO_SOCIAL_ARGUMETS"
    );

    if (callerIndex < 0) {
      const profile = {};

      profile.address = caller;

      if (nickname) {
        _validateType(nickname, "[object String]");
        _validateStringLen(nickname, 2, 88);
        profile.nickname = nickname.trim();
      } else {
        profile.nickname = "";
      }

      if (bio) {
        _validateType(bio, "[object String]");
        _validateStringLen(bio, 0, 350);
        profile.bio = bio.trim();
      } else {
        profile.bio = "";
      }

      if (avatar) {
        _validateType(avatar, "[object String]");
        _validateArweaveAddress(avatar);
        profile.avatar = avatar.trim();
      } else {
        profile.avatar = "";
      }

      if (banner) {
        _validateType(banner, "[object String]");
        _validateArweaveAddress(banner);
        profile.banner = banner.trim();
      } else {
        profile.banner = "";
      }

      if (websites) {
        const uniqueWebs = [...new Set(websites)];
        for (const url of uniqueWebs) {
          _isValidUrl(url);
        }
        profile.websites = uniqueWebs;
      }

      if (socials) {
        for (const element of socials) {
          _isValidUrl(element.url);
          ContractAssert(
            state.supported_socials.includes(element.platform),
            "ERROR_INVALID_SOCIAL_PLATFORM"
          );
        }
        profile.socials = socials;
      }

      state.profiles.push(profile);
      return { state };
    }

    // if old user

    if (nickname) {
      _validateType(nickname, "[object String]");
      _validateStringLen(nickname, 2, 88);
      state.profiles[callerIndex].nickname = nickname.trim();
    }

    if (bio) {
      _validateType(bio, "[object String]");
      _validateStringLen(bio, 0, 350);
      state.profiles[callerIndex].bio = bio.trim();
    }

    if (avatar) {
      _validateType(avatar, "[object String]");
      _validateArweaveAddress(avatar);
      state.profiles[callerIndex].avatar = avatar.trim();
    }

    if (banner) {
      _validateType(banner, "[object String]");
      _validateArweaveAddress(banner);
      state.profiles[callerIndex].banner = banner.trim();
    }

    if (websites) {
      const uniqueWebs = [...new Set(websites)];
      for (const url of uniqueWebs) {
        _isValidUrl(url);
      }
      const userSites = state.profiles[callerIndex].websites;
      state.profiles[callerIndex].websites = [
        ...new Set(uniqueWebs.concat(userSites).flat()),
      ];
    }

    if (socials) {
      for (const element of socials) {
        _isValidUrl(element.url);
        ContractAssert(
          state.supported_socials.includes(element.platform),
          "ERROR_INVALID_SOCIAL_PLATFORM"
        );
        ContractAssert(
          !state.profiles[callerIndex].socials
            .map((el) => el.url)
            .includes(element.url)
        );
      }
      state.profiles[callerIndex].socials = state.profiles[callerIndex].socials
        .concat(socials)
        .flat();
    }

    return { state };
  }

  if (input.function === "removeSoWebArrayValue") {
    const { jwk_n, sig, type, key, value } = input;

    await _verifyArSignature(jwk_n, sig);
    const caller = await _ownerToAddress(jwk_n);
    const callerIndex = _getCallerIndex(caller);
    const callerProfile = state.profiles[callerIndex];

    if (type === "websites") {
      const websiteIndex = callerProfile.websites.findIndex(
        (web) => web === value
      );
      ContractAssert(websiteIndex >= 0, "ERROR_INVALID_WEB_INDEX");
      state.profiles[callerIndex].websites.splice(websiteIndex, 1);
      return { state };
    }

    // if type is `socials`
    const socialIndex = callerProfile.socials.findIndex(
      (social) => social.platform === key && social.url === value
    );
    ContractAssert(socialIndex >= 0, "ERROR_INVALID_SOCIAL_INDEX");
    state.profiles[callerIndex].socials.splice(socialIndex, 1);
    return { state };
  }

  // ADMIN function
  if (input.function === "addSocialPlatform") {
    const { jwk_n, sig, platform } = input;

    _validateType(platform, "[object String]");
    await _verifyArSignature(jwk_n, sig);
    const caller = await _ownerToAddress(jwk_n);
    ContractAssert(caller === state.admin, "ERROR_INVALID_CALLER");
    ContractAssert(platform.trim().length, "ERROR_INVALID_PLATFORM");
    ContractAssert(
      !state.supported_socials.includes(platform),
      "ERROR_PLATFORM_DUPLICATION"
    );

    state.supported_socials.push(platform.toLowerCase().trim());

    return { state };
  }

  function _isValidUrl(url) {
    ContractAssert(
      /^(?:https?|ftp):\/\/[\w\-]+(?:\.[\w\-]+)+[\w\-\./\?\#\&\=\%]*$/.test(
        url
      ),
      "ERROR_INVALID_URL_SYNTAX"
    );
  }

  function _validateType(element, expected) {
    ContractAssert(
      Object.prototype.toString.call(element) === expected,
      "ERROR_INVALID_DATA_TYPE"
    );
  }

  function _validateStringLen(string, min, max) {
    ContractAssert(
      string.trim().length <= max && string.trim().length >= min,
      "ERROR_INVALID_STRING_LENGTH"
    );
  }

  function _getCallerIndex(address) {
    return state.profiles.findIndex((profile) => profile.address === address);
  }

  async function _ownerToAddress(pubkey) {
    try {
      const req = await EXM.deterministicFetch(
        `${state.ar_molecule}/${pubkey}`
      );
      const address = req.asJSON()?.address;
      _validateArweaveAddress(address);
      return address;
    } catch (error) {
      throw new ContractError("ERROR_MOLECULE_SERVER_ERROR");
    }
  }

  async function _verifyArSignature(owner, signature) {
    try {
      _validatePubKeySyntax(owner);

      const sigBody = state.sig_message;

      const encodedMessage = new TextEncoder().encode(sigBody);
      const typedArraySig = Uint8Array.from(atob(signature), (c) =>
        c.charCodeAt(0)
      );
      const isValid = await SmartWeave.arweave.crypto.verify(
        owner,
        encodedMessage,
        typedArraySig
      );

      ContractAssert(isValid, "ERROR_INVALID_CALLER_SIGNATURE");
      ContractAssert(
        !state.signatures.includes(signature),
        "ERROR_SIGNATURE_ALREADY_USED"
      );
      state.signatures.push(signature);
    } catch (error) {
      throw new ContractError("ERROR_INVALID_CALLER_SIGNATURE");
    }
  }

  function _validateArweaveAddress(address) {
    ContractAssert(
      /[a-z0-9_-]{43}/i.test(address),
      "ERROR_INVALID_ARWEAVE_ADDRESS"
    );
  }

  function _validatePubKeySyntax(jwk_n) {
    ContractAssert(
      typeof jwk_n === "string" && jwk_n?.length === 683,
      "ERROR_INVALID_JWK_N_SYNTAX"
    );
  }
}

export async function handle(state, action) {
	const action = input.action;


	if (input.function === "updateAddress") {
		const { address, jwk_n, sig } = input;

		const caller = await _ownerToAddress(jwk_n);
		await _verifyArSignature(jwk_n, sig);
		ContractAssert(caller === state.admin, "ERROR_INVALID_CALLER");

		_validateArweaveAddress(address);
		ContractAssert(state.contract_address !== address, "ERROR_ADDRESS_DUPLICATION");
		state.contract_address = address;
		return { state };
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

        const encodedMessage = new TextEncoder().encode(
          sigBody
        );
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
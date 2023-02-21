<p align="center">
  <a href="https://decent.land">
    <img src="./img/new-logo.png" height="200">
  </a>
  <h3 align="center"><code>@decentldotland/ANS</code></h3>
  <p align="center">The Universal User Identifier ID for Arweave Network</p>
</p>
   
## Arweave Name Service

[ANS](https://ans.gg) is the first and only domain name service for the [Arweave](https://arweave.gg) network. Created by the [decent.land](https://decent.land) team, ANS provides readable names for the Arweave network addresses.

**_the protocol has no token yet, any associated token's smart contract address or ticker is for testing purposes only_**

## Domain's string handling

ANS registry contract uses the NFKC (Normalization Form Compatibility Composition) unicode normalization algorithm and case folding to normalize the label's string before comparing its length and allowing unicode that is predefined in the contract. Then, the label gets minted and stored according to its processed format (after normalization), following a Nameprep-like methodology. 

### Supported unicodes

The supported unicodes are those of the lowercase alphabetical characters in addition to integers from 0 to 9. Therefore, domains are alphanumeric.
The supported UTF-16 code units range from 48 to 57 (`0` -> `9`) and from 27 to 122 (`a` -> `z`).

The usage of the NFKC algorithm allows reducing the visual security issues like:
- visual spoofing
- reduce visual confusion. [examples](https://util.unicode.org/UnicodeJsps/confusables.jsp)
- Punnycode and Script spoofing

## Domains Supply
ANS domains supply is based and limited according to the permutation with repetition of the conditional probability. Domain's scarcity is determined by its length, the lower length it has, the more scarce it is.


| label type  |  label length  | label supply  | 
| :-----------: | :-----------: |:-------------:| 
| Ār            | 2             | 1,296          | 
| Vix           | 3             | 46,656        | 
| Zūr           | 4             | 1,679,616     |
| Yu            | 5             | 60,466,176    | 
| Yow          | 6             | 2,176,782,336 | 
| K'us          | 7             | 78,364,164,096|
| En         | 8             | 2,821,109,907,456 |
| Pon            | 9             | 101,559,956,668,416 |
| Pōr           | 10            | 3,656,158,440,062,976 |
| Strād       | 11            | 131,621,703,842,267,136 |
| Bī         | 12            | 4,738,381,338,321,616,896 |
| Sān        | 13            | 170,581,728,179,578,208,256 |
| Bōh        | 14            | 6,140,942,214,464,815,497,216 |
| Kew         | 15            | 221,073,919,720,733,357,899,776 |



## Alpha Launch
ANS testnet has been launched distributing domains for hundred of addresses during the Genesis phase. Learn more about the airdrop [here.](https://github.com/decentldotland/ANS-Testnet-Airdrop)

## Mainnet Contract Address
The mainnet smart contract of the ANS protocol is deployed on [EXM](https://exm.dev). 

Address: [VGWeJLDLJ9ify3ezl9tW-9fhB0G-GIUd60FE-5Q-_VI](https://api.exm.dev/read/VGWeJLDLJ9ify3ezl9tW-9fhB0G-GIUd60FE-5Q-_VI)

## ANS Related Repositories

### ANS Resolver
ANS protocol has REST API resolver to resolve (or reverse resolve) identities. Check the [API repository](https://github.com/decentldotland/ans-resolver).

### ANS Metrics API
The [ans-metrics](https://github.com/decentldotland/ans-metrics) repository is an API for ANS protocol metrics.

### ar.page
The [ar.page](https://ar.page) web app is multichain ANS profile resolver that utilizes the [Ark Protocol](https://github.com/decentldotland/ark-protocol). Check ar.page [repository](https://github.com/decentldotland/ar.page).

### ANS Gateways
The ANS protocol has two gateways (arweave.gg and arweave.bio) that resolves a domain's `A` record to the associated Arweave TXID and render it in-browser. [Check the repository](https://github.com/decentldotland/ans-gateway) 

### ANS-FOR-ALL
`ans-for-all` is a drop in module to utilize the ANS protocol in React apps. Check the [repository](https://github.com/nanofuxion/ans-for-all).

## Tech-Stack
ANS Protocol utilizes cutting-edge technologies built on top of the Arweave network:
- [EXM](https://exm.dev) : smart contract protocol
- [EverPay](https://everpay.io) : ANS payments processor
- [molecule.sh](https://molecule.sh) : EXM developer API

## Contributing

If you have a suggestion that would add enhancements to the ANS protocol, please fork the repository and create a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/xyz`)
3. Commit your Changes (`git commit -m 'feat: abc-xyz'`)
4. Push to the Branch (`git push origin feature/xyz`)
5. Open a Pull Request

Contributions are **greatly appreciated** !

## License
The project is licensed under the [MIT license](./LICENSE).


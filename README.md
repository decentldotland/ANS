<p align="center">
  <a href="https://decent.land">
    <img src="./img/new-logo.png" height="200">
  </a>
  <h3 align="center"><code>@decentldotland/ANS</code></h3>
  <p align="center">The Universal User Identifier ID for Arweave Network</p>
</p>
   
# Arweave Name Service

**_the protocol has no token yet, any associated token's smart contract address is for testing purposes only_**

# Motivation

Using and adopting names service accross Arweave ecosystem has several benefits:
- faciliate of sharing addresses and sending AR/PSTs
- create an economic cycle through domains financial activities (trading)
- the ability to be used as social profiles contructors in Arweave based social networks (e.g. decent.land users)
- a decentralized gravatar-like use-case


## Terminology

- label: equivalent to domain's name in DNS, such as **"decent"** in decent.ar
- user: the controller of the label
- name: full ANS identifier such as "decent.ar" (label and 'ar' TLD sepperated by a dot)

## Label's string handling

ANS registry contract uses the NFKC (Normalization Form Compatibility Composition) unicode normalization algorithm and case folding to normalize the label's string before comparing its length and allowed unicodes that are predefined in the contract. Then, the label get minted and stored according to its processed format (after normalization), following a Nameprep-like methodology. 

**Allowed unicodes**
The allowed unicode are those of the lowercase alphabetical characters in addition to integers from 0 to 9. Thus, usernames as known as labels are alphanumeric.
The supported UTF-16 code units range from 48 to 57 (0 -> 9) and from 27 to 122 (a -> z).

The usage of the NFKC algorithm allows to reduce the visual security issues like:
- visual spoofing
- reduce visual confuses. [examples](https://util.unicode.org/UnicodeJsps/confusables.jsp)
- Punnycode and Script spoofing

## Available Labels
ANS labels minting is based and limited using the permutation with repetition of the conditional probability

Knowing that `p` is that arbitrary label string entered by the user that may be alphanumerical, and `n` is the total number of allowed characters which is 36 (26 characters from alphabetical characters and 10 characters from the allowed integers).
For a better UX, labels of length equal to one are disallowed and cannot be minted, hence, that total number of labels that can ever exist is more than 43B labels. Breakdown:

| label type  |  label length  | label supply  | 
| :-----------: | :-----------: |:-------------:| 
| ni            | 2             | 1,296          | 
| san           | 3             | 46,656        | 
| yon           | 4             | 1,679,616     |
| go            | 5             | 60,466,176    | 
| roku          | 6             | 2,176,782,336 | 
| nana          | 7             | 78,364,164,096|
| hachi         | 8             | 2,821,109,907,456 |
| ku            | 9             | 101,559,956,668,416 |
| juu           | 10            | 3,656,158,440,062,976 |
| juuichi       | 11            | 131,621,703,842,267,136 |
| juuni         | 12            | 4,738,381,338,321,616,896 |
| juusan        | 13            | 170,581,728,179,578,208,256 |
| juuyon        | 14            | 6,140,942,214,464,815,497,216 |
| juugo         | 15            | 221,073,919,720,733,357,899,776 |

Label scarcity is determined by its length, the lower length it has, the more scarce it is. No renewal fees.


## Label Asset Type
ANS labels are digital properties fully owned and managed by the `user` (aka label's owner post-minting). ANS spec introduces a new asset / tokenized mechanism to the Arweave ecosystem that applies the profit sharing concept introduced in [PSCs](https://coinmarketcap.com/alexandria/article/profit-sharing-communities-a-deep-dive-by-arweave) and [PSTs](https://arweave.medium.com/profit-sharing-tokens-a-new-incentivization-mechanism-for-an-open-web-1f2532411d6e).

ANS-labels are Profit Sharing Domains (PSD) for having the following features:
- Basic ***token*** functionalities: ownership, transferability, & trade-ability.
- The first in-contract, on-chain ***profit sharing*** mechanism through the [PoR](https://github.com/decentldotland/ANS/tree/main/incentives) incentives model.
- ***Domain*** Name Service: address resolving & DeGravatar.

## Genesis Launch
ANS testnet has been launched distributing domains for hundred of addresses during the Genesis phase. Learn more about the airdrop [here.](https://github.com/decentldotland/ANS-Testnet-Airdrop)

## Interacting With ANS Contract
The [docs.decent.land](https://docs.decent.land) contains a set of guide and documentations explaining how to interact with the ANS smart contract.

## ANS Metrics API
The [ans-stats](https://github.com/decentldotland/ans-stats) repository is an API for ANS data and statistics. API endpoint: [ans-stats.decent.land](https://ans-stats.decent.land)

## ANS-FOR-ALL
`ans-for-all` is a drop in module to utilize the ANS protocol in React apps. Check [repo](https://github.com/nanofuxion/ans-for-all)

## Contributing

If you have a suggestion that would make this protocol or the [API](./server) better, please fork the repository and create a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/xyz`)
3. Commit your Changes (`git commit -m 'feat: abc-xyz'`)
4. Push to the Branch (`git push origin feature/xyz`)
5. Open a Pull Request

Contributions are **greatly appreciated** !

## License
The project is licensed under the [MIT](https://github.com/decentldotland/ANS/blob/main/LICENSE) license.


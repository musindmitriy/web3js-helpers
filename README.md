# Web3 helpers

[![Build Status](https://travis-ci.org/musindmitriy/web3js-helpers.svg?branch=master)](https://travis-ci.org/musindmitriy/web3js-helpers)

This is NodeJS library with easy wrapper object for web3js library.
Its aim is to make interactions with smart contracts more simple and quick
than full web3js contract .send and .call process.

Transaction calls become more short due to less redundant syntax and
reusing event handlers. Especially useful for testing contracts.

## Version

Current version is pre-release version for testing purposes.

## Example

```js
const web3contract = new web3.eth.Contract(erc20_abi, erc20_token);

const contract = SmartContract(web3, web3contract);

const handlers = {
  'error': console.error,
  'transactionHash': console.log,
  'receipt': console.log,
};

const txn = contract.sendTxn(
  'transfer', [toAddress, amount], 50000,
  fromAddress, fromPassword, handlers,
);

const receipt = await txn; // if you want to synchronously wait for receipt in NodeJS 8
```

## Docs

All parameters and behaviour of functions are well documented in index.js
source code. Separate page with documentation will be published with first release.

## Licence

License of web3-helpers is MIT.

'use strict';

function addHandlers(transactionPromievent, handlers) {
  const eventNameArray = Object.keys(handlers);
  for (let i = 0; i < eventNameArray.length; i += 1) {
    const eventName = eventNameArray[i];
    transactionPromievent = transactionPromievent.on(eventName, handlers[eventName]);
  }
  return transactionPromievent;

  // return transactionPromievent
  //   .on('error', (error) => { console.log('on_error', error); })
  //   .on('transactionHash', (transactionHash) => {
  //     console.log('on_transactionHash', transactionHash);
  //   });
  // // .on('receipt', receipt => { // contains the new contract address
  //   console.log('on_receipt', receipt.contractAddress);
  // });
  // .on('confirmation', (confirmationNumber, receipt) => {
  //   console.log('on_confirmation', confirmationNumber, receipt);
  // })
}

class SmartContract {
  constructor(web3, contract) {
    this.web3 = web3;
    this.contract = contract;
  }

  /**
   * Send transaction with unlocking local account by password.
   *
   * Transaction hash is returned with HTTP response.
   * Transaction receipt is returned as promise result (or null in case of unlock failure).
   *
   * @param methodName string
   * @param handlers object containing mapping of event names to handlers
   * @param fromAddress address for 'from' field
   * @param fromPassword password to unlock 'from' account
   * @param gas gas amount
   * @param args contract method arguments
   * @returns {PromiseLike<receipt> | Promise<receipt> | null}
   */
  async sendTxn(methodName, args, gas, fromAddress, fromPassword, handlers) {
    const unlocked = await this.web3.eth.personal.unlockAccount(fromAddress, fromPassword);
    if (!unlocked) {
      return null;
    }

    const transactionPromievent = this.contract.methods[methodName](...args)
      .send({ from: fromAddress, gas });

    return addHandlers(transactionPromievent, handlers);
  }

  /**
   * Transaction for already unlocked account. Correctly check data
   * that is coming here from untrusted sources.
   *
   * @param methodName
   * @param handlers object containing mapping of event names to handlers
   * @param fromAddress address for 'from' field
   * @param gas gas amount
   * @param args contract method arguments
   * @returns {PromiseLike<receipt> | Promise<receipt> | *}
   */
  sendTxnFromUnlocked(methodName, args, gas, fromAddress, handlers) {
    const transactionPromievent = this.contract.methods[methodName](...args)
      .send({ from: fromAddress, gas });

    return addHandlers(transactionPromievent, handlers);
  }

  /**
   * Obtain constant method value (no transaction in blockchain,
   * EVM code is executed locally)
   *
   * @param methodName string, method name
   * @param response object for sending response
   * @param params parameters of method call
   * @param from account to make call from
   * @returns {Promise<callResult>}
   */
  async call(methodName, response, params, from) {
    const callResult = await this.contract.methods[methodName](...params.args)
      .call({ from });
    return callResult;
  }

  /**
   * Set handler for contract event.
   *
   * Event will additionally contain timestamp field.
   *
   * @param eventName name of event
   * @param eventHandler function to handle event
   * @param errorHandler function to handle error
   * @returns {*|EventEmitter}
   */
  listenToEvent(eventName, eventHandler, errorHandler) {
    return this.contract.events[eventName]((error, event) => {
      console.log(eventName, ' callback');
      if (!error) {
        this.web3.eth.getBlock(event.blockHash)
          .then((block) => {
            event.timestamp = block.timestamp;
            eventHandler(event);
          })
          .catch(errorHandler);
      } else {
        errorHandler(error);
      }
    });
  }
}

module.exports.SmartContract = SmartContract;

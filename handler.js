'use strict';

const random = require('random-number-csprng');

const VERIFICATION_TOKEN = process.env.VERIFICATION_TOKEN;

module.exports.roll = async event => {
  let responseData = {
    response_type: 'in_channel',
    attachments: [
      { text: '' }
    ]
  };
  let requestData = event.body.split('&');
  let requestDataHash = {};
  let diceType, numDice;

  for (let i = 0; i < requestData.length; i++) {
    requestDataHash[requestData[i].split("=")[0]] = requestData[i].split("=")[1];
  }

  requestData = requestDataHash;

  if (requestData.token === VERIFICATION_TOKEN) {
    if (/[d](\d+)/g.exec(requestData.text)) {
      diceType = parseInt(/[d](\d+)/g.exec(requestData.text)[1]);
    } else {
      diceType = null;
    }

    if (!diceType) {
      responseData.response_type = 'ephemeral';
      responseData.text = 'No dice type found. Try formatting like 2d4, or 3d8.';
    } else {
      numDice = /(\d+)[d]/g.exec(requestData.text) ? parseInt(/(\d+)[d]/g.exec(requestData.text)[1]) : 1;

      numDice = numDice === 0 ? 1 : numDice;

      for (let i = 0; i < numDice; i++) {
        responseData.attachments[0].text += await random(1, diceType);

        if (i !== numDice - 1) {
          responseData.attachments[0].text += ', ';
        }
      }

      responseData.text = 'Total: ' + responseData.attachments[0].text.split(', ').reduce((accumulator, value) => {
        return parseInt(accumulator) + parseInt(value);
      });
    }
  } else {
    responseData.response_type = 'ephemeral';
    responseData.text = 'Verification token invalid.';
  }

  return {
    statusCode: 200,
    body: JSON.stringify(responseData)
  };
};

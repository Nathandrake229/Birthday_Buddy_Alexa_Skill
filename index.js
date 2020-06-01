/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');
const https = require('https')
var AmazonDateParser = require('amazon-date-parser');
const GetNewBirthHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return  (request.type === 'IntentRequest'
        && request.intent.name === 'GetNewBirthIntent');
  },
  async handle(handlerInput) {
    
  
    var vdate = handlerInput.requestEnvelope.request.intent.slots.date.value;
    var responsetext = `You share your birthday with `;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    attributes.birthDate = vdate;
    handlerInput.attributesManager.setSessionAttributes(attributes)
    const response = await httpGet(vdate);
    
      responsetext += `<break time="1s"/><voice name="Joanna">${response[0].name}, born in the year ${response[0].year}.</voice>`
      responsetext +=`<break time="2s"/> Do you want to know who else celebrates their birthday with you?`
    return handlerInput.responseBuilder
      .speak(responsetext)
      .reprompt()
      .withSimpleCard(SKILL_NAME, response[0].text)
      .getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(HELP_MESSAGE)
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};
const LaunchRequest = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return request.type === 'LaunchRequest'
      
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak("Welcome to birthday share. I can tell you who else celebrates their birthday with you. Do you want to find out?")
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(STOP_MESSAGE)
      .getResponse();
  },
};

const RepeatIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.RepeatIntent')
       
  },
  async handle(handlerInput) {
    
  
    
    var responsetext = `You share your birthday with `;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    //attributes.birthDate = vdate;
    //handlerInput.attributesManager.setSessionAttributes(attributes)
    var vdate = attributes.birthDate
    if(vdate){
      const response = await httpGet(vdate);
    
      responsetext += `<break time="1s"/><voice name="Joanna">${response[0].name}, born in the year ${response[0].year}.</voice>`
      responsetext +=`<break time="2s"/> Do you want to know who else celebrates their birthday with you?`
    return handlerInput.responseBuilder
      .speak(responsetext)
      .reprompt()
      .withSimpleCard(SKILL_NAME, response[0].text)
      .getResponse();
  }else{
    return handlerInput.responseBuilder
      .speak("When is your birthday?")
      .addElicitSlotDirective('date')
      .getResponse();
  }
    }
    
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, an error occurred.')
      .reprompt('Sorry, an error occurred.')
      .getResponse();
  },
};

const SKILL_NAME = 'Birthday Share';
//const GET_FACT_MESSAGE = 'Here\'s your fact: ';
const HELP_MESSAGE = 'What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Hope you have a Good Day.';



const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    GetNewBirthHandler,
    HelpHandler,
    ExitHandler,
    SessionEndedRequestHandler,
    LaunchRequest,
    RepeatIntentHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
  function httpGet(udate) {
    return new Promise(((resolve, reject) => {
      if(udate){
        var doc = new AmazonDateParser(udate);
        var options = {
          host: 'history.muffinlabs.com',
          //port: 443,
          path: `/date/${doc.startDate.getMonth()+1}/${doc.startDate.getDate()}`,
          method: 'GET',
      };
      }
  
      
      const request = https.request(options, (response) => {
        response.setEncoding('utf8');
        let returnData = '';
  
        response.on('data', (chunk) => {
          returnData += chunk;
        });
  
        response.on('end', () => {
            var res= JSON.parse(returnData)
            console.log(res.data.Events.length)
            var len = res.data.Births.length
            var textar = [];
            var ind = Math.floor(Math.random()*len);
                textar.push({
                  name: res.data.Births[ind].text,
                  year: res.data.Births[ind].year
                })
            
          console.log(textar)  
            
          resolve(textar);
        });
  
        response.on('error', (error) => {
          reject(error);
        });
      });
      request.end();
    }));
  }
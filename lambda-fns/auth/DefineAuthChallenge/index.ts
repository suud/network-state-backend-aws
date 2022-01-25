import { CognitoUserPoolTriggerHandler } from 'aws-lambda';

export const handler: CognitoUserPoolTriggerHandler = async event => {
    if (event.request.session &&
        event.request.session.find(attempt => attempt.challengeName !== 'CUSTOM_CHALLENGE')) {
        // We only accept custom challenges; fail auth
        event.response.issueTokens = false;
        event.response.failAuthentication = true;
    } else if (event.request.session &&
        event.request.session.length &&
        event.request.session.slice(-1)[0].challengeResult === false) {
        // Wallet doesn't fulfill requirements; fail auth
        event.response.issueTokens = false;
        event.response.failAuthentication = true;
    } else if (event.request.session &&
        event.request.session.length &&
        event.request.session.slice(-1)[0].challengeName === 'CUSTOM_CHALLENGE' &&
        event.request.session.slice(-1)[0].challengeResult === true) {
        // Wallet fulfills requirements; succeed auth
        event.response.issueTokens = true;
        event.response.failAuthentication = false;
    } else {
        // New connection; present challenge
        event.response.issueTokens = false;
        event.response.failAuthentication = false;
        event.response.challengeName = 'CUSTOM_CHALLENGE';
    }

    return event;
};
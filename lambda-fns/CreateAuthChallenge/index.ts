import { CognitoUserPoolTriggerHandler } from 'aws-lambda';
import { randomDigits } from 'crypto-secure-random-digit';

export const handler: CognitoUserPoolTriggerHandler = async event => {
    // Generate a new login code
    const loginCode = randomDigits(16).join('');

    // This is sent back to the client app
    event.response.publicChallengeParameters = {
        loginCode: loginCode,
    };

    // Add the data to the private challenge parameters
    // so it can be verified by the "Verify Auth Challenge Response" trigger
    event.response.privateChallengeParameters = {
        username: event.request.userAttributes.username,
        loginCode: loginCode,
    };

    return event;
};
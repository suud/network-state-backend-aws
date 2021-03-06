import { randomUUID } from 'crypto';
import { CognitoUserPoolTriggerHandler } from 'aws-lambda';

export const handler: CognitoUserPoolTriggerHandler = async event => {
    // Generate a new login code
    const loginCode = randomUUID();

    // This is sent back to the client app
    event.response.publicChallengeParameters = {
        loginCode: loginCode,
    };

    // Add the data to the private challenge parameters
    // so it can be verified by the "Verify Auth Challenge Response" trigger
    event.response.privateChallengeParameters = {
        userName: event.userName,
        loginCode: loginCode,
    };

    return event;
};
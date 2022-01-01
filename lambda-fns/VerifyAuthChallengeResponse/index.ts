import { CognitoUserPoolTriggerHandler } from 'aws-lambda';

export const handler: CognitoUserPoolTriggerHandler = async event => {
    const username = event.request.privateChallengeParameters!.username;
    const loginCode = event.request.privateChallengeParameters!.loginCode;

    // TODO: recover pubKey used to sign challengeAnswer
    // const signKey = recover(loginCode, event.request.challengeAnswer)
    //if (signKey === username) {
    if (username === username) {
        // TODO: check if user owns NFT/POAP
        event.response.answerCorrect = true;
    } else {
        event.response.answerCorrect = false;
    }

    return event;
};
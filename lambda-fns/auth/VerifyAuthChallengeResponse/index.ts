import Web3 from 'web3';
import { CognitoUserPoolTriggerHandler } from 'aws-lambda';

export const handler: CognitoUserPoolTriggerHandler = async event => {
    // TODO: use env variables to set rpcUrl and contractAdress
    const rpcUrl = process.env.rpcUrl;
    const contractAddress = process.env.contractAddress;
    // We only need the balanceOf function
    const contractABI = [
        {
            "constant": true,
            "inputs": [
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                }
            ],
            "name": "balanceOf",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        }
    ];


    const username = event.request.privateChallengeParameters!.username;
    const loginCode = event.request.privateChallengeParameters!.loginCode;

    // Recover pubKey that was used to sign challengeAnswer
    const web3 = new Web3(rpcUrl);
    const signKey = await web3.eth.personal.ecRecover(loginCode, event.request.challengeAnswer);

    let tokenBalance = 0.0;
    if (signKey.toLowerCase() === username.toLowerCase()) {
        // Get token balance
        const contract = new web3.eth.Contract(contractABI, contractAddress);
        try {
            tokenBalance = await contract.methods.balanceOf(signKey).call();
        } catch (error) {
            console.log('Failed to retrieve token balance', error);
        }
    }

    // Check if user has sufficient tokens
    if (tokenBalance >= 1.0) {
        event.response.answerCorrect = true;
    } else {
        event.response.answerCorrect = false;
    }

    return event;
};
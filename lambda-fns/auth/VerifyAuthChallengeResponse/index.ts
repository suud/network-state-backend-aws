import Web3 from 'web3';
import { CognitoUserPoolTriggerHandler } from 'aws-lambda';

export const handler: CognitoUserPoolTriggerHandler = async event => {
    const rpcUrl = process.env.rpcUrl;
    const contractAddress = process.env.contractAddress;
    const tokenId = process.env.tokenId;

    const username = event.request.privateChallengeParameters!.userName;
    const loginCode = event.request.privateChallengeParameters!.loginCode;

    // Recover pubKey that was used to sign challengeAnswer
    const web3 = new Web3(rpcUrl);
    const signKey = await web3.eth.accounts.recover(loginCode, event.request.challengeAnswer);

    let tokenBalance = 0.0;
    if (signKey.toLowerCase() === username.toLowerCase()) {
        tokenBalance = await getTokenBalance(web3, signKey, contractAddress, tokenId);
    }

    // Check if user has sufficient tokens
    if (tokenBalance >= 1.0) {
        event.response.answerCorrect = true;
    } else {
        event.response.answerCorrect = false;
    }

    return event;
};

const getTokenBalance = async (web3: any, pubKey: string, contractAddress: (string | undefined), tokenId: (string | undefined)) => {
    let tokenBalance = 0.0;

    try {
        if (!tokenId) {
            // When there's no tokenId, use ERC20 / ERC721 interface
            const contract = new web3.eth.Contract(getBalanceOfAbi(), contractAddress);
            tokenBalance = await contract.methods.balanceOf(pubKey).call();
        } else {
            // When tokenId is given, it's probably an ERC1155
            const contract = new web3.eth.Contract(getBalanceOfAbiERC1155(), contractAddress);
            tokenBalance = await contract.methods.balanceOf(pubKey, tokenId).call();
        }
    } catch (error) {
        console.log('Failed to retrieve token balance', error);
    }

    return tokenBalance
};

const getBalanceOfAbiERC1155 = () => {
    // ERC1155
    return [
        {
            "constant": true,
            "inputs": [
                {
                    "internalType": "address",
                    "name": "account",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "id",
                    "type": "uint256"
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
};

const getBalanceOfAbi = () => {
    // ERC20 / ERC721
    return [
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
};
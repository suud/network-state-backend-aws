import { Stack, StackProps, CfnOutput, CfnParameter } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Code, Function, LayerVersion, Runtime } from 'aws-cdk-lib/aws-lambda';
import { UserPool, UserPoolClient, AccountRecovery } from 'aws-cdk-lib/aws-cognito';
import { AuthorizationType, CognitoUserPoolsAuthorizer, LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';

export class NetworkStateBackendStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Parameters - required for auth process
    const rpcUrl = new CfnParameter(this, 'rpcUrl', {
      type: 'String',
      description: 'RPC URL of chain provider.'
    });
    const contractAddress = new CfnParameter(this, 'contractAddress', {
      type: 'String',
      description: 'Address of token smart contract.'
    });
    const tokenId = new CfnParameter(this, 'tokenId', {
      type: 'String',
      description: 'Id of ERC1155 token.'
    });

    // Lambda Layer with web3 dependency
    const web3DependencyLayer = new LayerVersion(this, 'Web3DependencyLayer', {
      compatibleRuntimes: [Runtime.NODEJS_14_X],
      code: Code.fromAsset('lambda-layers/web3'),
      description: 'web3 library'
    });

    // Auth Flow Lambda Functions
    const createAuthChallengeLambda = new Function(this, 'CreateAuthChallengeLambda', {
      runtime: Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: Code.fromAsset('lambda-fns/auth/CreateAuthChallenge'),
    })
    const defineAuthChallengeLambda = new Function(this, 'DefineAuthChallengeLambda', {
      runtime: Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: Code.fromAsset('lambda-fns/auth/DefineAuthChallenge'),
    })
    const preSignUpLambda = new Function(this, 'PreSignUpLambda', {
      runtime: Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: Code.fromAsset('lambda-fns/auth/PreSignUp'),
    })
    const verifyAuthChallengeResponseLambda = new Function(this, 'VerifyAuthChallengeResponseLambda', {
      runtime: Runtime.NODEJS_14_X,
      handler: 'index.handler',
      layers: [web3DependencyLayer],
      code: Code.fromAsset('lambda-fns/auth/VerifyAuthChallengeResponse'),
      environment: {
        rpcUrl: rpcUrl.valueAsString,
        contractAddress: contractAddress.valueAsString,
        tokenId: tokenId.valueAsString
      }
    })

    // Cognito User Pool
    const userPool = new UserPool(this, 'UserPool', {
      signInAliases: { username: true },
      selfSignUpEnabled: true,
      accountRecovery: AccountRecovery.NONE,
      lambdaTriggers: {
        createAuthChallenge: createAuthChallengeLambda,
        defineAuthChallenge: defineAuthChallengeLambda,
        preSignUp: preSignUpLambda,
        verifyAuthChallengeResponse: verifyAuthChallengeResponseLambda,
      },
    });
    const userPoolClient = new UserPoolClient(this, 'UserPoolClient', {
      userPool
    });
    const userPoolsAuthorizer = new CognitoUserPoolsAuthorizer(this, 'UserPoolAuthorizer', {
      cognitoUserPools: [userPool]
    });

    // Protected Lambda Function - only accessible by authenticated users
    const getJokeLambda = new Function(this, 'GetJokeLambda', {
      runtime: Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: Code.fromAsset('lambda-fns/GetJoke')
    });

    // REST API
    const api = new LambdaRestApi(this, 'network-state-api', {
      handler: getJokeLambda,
      defaultMethodOptions: {
        authorizer: userPoolsAuthorizer,
        authorizationType: AuthorizationType.COGNITO
      }
    });

    // Output these variables after deploying the resources
    new CfnOutput(this, 'RestApiName', {
      value: api.restApiName
    });
    new CfnOutput(this, 'RestApiEndpoint', {
      value: api.url
    });
    new CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId
    });
    new CfnOutput(this, 'UserPoolWebClientId', {
      value: userPoolClient.userPoolClientId
    });
    //new CfnOutput(this, 'UserPoolProviderUrl', {
    //  value: userPool.userPoolProviderUrl
    //});
  }
}

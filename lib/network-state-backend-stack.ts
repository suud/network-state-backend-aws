import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { UserPool, UserPoolClient, AccountRecovery } from 'aws-cdk-lib/aws-cognito';

export class NetworkStateBackendStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const createAuthChallengeLambda = new Function(this, 'CreateAuthChallengeLambda', {
      runtime: Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: Code.fromAsset('lambda-fns/CreateAuthChallenge'),
    })
    const defineAuthChallengeLambda = new Function(this, 'DefineAuthChallengeLambda', {
      runtime: Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: Code.fromAsset('lambda-fns/DefineAuthChallenge'),
    })
    const preSignUpLambda = new Function(this, 'PreSignUpLambda', {
      runtime: Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: Code.fromAsset('lambda-fns/PreSignUp'),
    })
    const verifyAuthChallengeResponseLambda = new Function(this, 'VerifyAuthChallengeResponseLambda', {
      runtime: Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: Code.fromAsset('lambda-fns/VerifyAuthChallengeResponse'),
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

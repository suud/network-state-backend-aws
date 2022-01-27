# network-state-backend-aws

Deploy an API that can only be accessed by users holding your token.

## Prerequisites

- [AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html#getting_started_prerequisites)

If you are using AWS CDK for the first time, check out the [Introduction to the CDK workshop](https://cdkworkshop.com/).

## Usage

```
# clone repository
git clone git@github.com:suud/network-state-backend.git
cd network-state-backend

# install dependencies
npm install
cd lambda-layers/web3/nodejs
npm install
cd ../../..

# compile typescript to js
npm run build

# deploy stack
cdk deploy \
    --parameters rpcUrl=... \
    --parameters contractAddress=...
```

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template

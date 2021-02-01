# CDK AppSync GraphQL API

This CDK stack deploys a real-time GraphQL API built with AWS AppSync, Amazon DynamoDB, and AWS Lambda. It uses AWS Cognito for authentication.

## Getting started

To deploy this project, follow these steps.

1. Clone the project

2. Change into the directory and install dependencies

```sh
cd cdk-graphql-backend

npm install
```

3. Run the build

```sh
npm run build
```

or for development ease

```sh
npm run watch
```

4. Deploy the stack to either dev / test / prod

```sh
cdk deploy dev/test/prod
```

If you want to destroy the stack

```sh
cdk destroy
```

To compare new changes to the current deployed stack

```sh
cdk diff
```

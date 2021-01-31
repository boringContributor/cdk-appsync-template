import {
  Construct,
  StackProps,
  CfnOutput,
  Stack,
  Duration,
  Expiration,
  RemovalPolicy,
} from '@aws-cdk/core';
import { Schema, AuthorizationType, GraphqlApi } from '@aws-cdk/aws-appsync';
import { Table, BillingMode, AttributeType } from '@aws-cdk/aws-dynamodb';
import { Function, Runtime, Code } from '@aws-cdk/aws-lambda';
import {
  UserPool,
  VerificationEmailStyle,
  UserPoolClient,
  AccountRecovery,
} from '@aws-cdk/aws-cognito';

export class AppsyncCdkAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const api = new GraphqlApi(this, 'Api', {
      name: 'cdk-appsync-api',
      schema: Schema.fromAsset('graphql/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: Expiration.after(Duration.days(365)),
          },
        },
      },
      xrayEnabled: true,
    });

    const userPool = new UserPool(this, 'cdk-user-pool', {
      selfSignUpEnabled: true,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
      },
      accountRecovery: AccountRecovery.EMAIL_ONLY,
      userVerification: {
        emailStyle: VerificationEmailStyle.CODE,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
      },
    });

    const userPoolClient = new UserPoolClient(this, 'UserPoolClient', {
      userPool,
    });

    const lambdaHandlers = new Function(this, 'AppSyncHandler', {
      runtime: Runtime.NODEJS_12_X,
      handler: 'main.handler',
      code: Code.fromAsset('lambda-fns'),
      memorySize: 1024,
    });

    // set the new Lambda function as a data source for the AppSync API
    const lambdaDatasource = api.addLambdaDataSource(
      'lambdaDatasource',
      lambdaHandlers
    );

    // create resolvers to match GraphQL operations in schema
    lambdaDatasource.createResolver({
      typeName: 'Query',
      fieldName: 'getNoteById',
    });

    lambdaDatasource.createResolver({
      typeName: 'Query',
      fieldName: 'listNotes',
    });

    lambdaDatasource.createResolver({
      typeName: 'Mutation',
      fieldName: 'createNote',
    });

    lambdaDatasource.createResolver({
      typeName: 'Mutation',
      fieldName: 'deleteNote',
    });

    lambdaDatasource.createResolver({
      typeName: 'Mutation',
      fieldName: 'updateNote',
    });

    // create DynamoDB table
    // removal policy destroy is not recommended for production use
    const table = new Table(this, 'cdk_table', {
      billingMode: BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // enable the lambda function to access the DynamoDB table (using IAM)
    // change this to a more fine grained access
    table.grantFullAccess(lambdaHandlers);

    lambdaHandlers.addEnvironment('CDK_TABLE', table.tableName);

    // print deployment information
    new CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
    });

    new CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
    });

    new CfnOutput(this, 'GraphQLAPIURL', {
      value: api.graphqlUrl,
    });

    new CfnOutput(this, 'GraphQLAPIKey', {
      value: api.apiKey || '',
    });
    new CfnOutput(this, 'Stack Region', {
      value: this.region,
    });
  }
}

import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class CartApiStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const {
      POSTGRES_HOST,
      POSTGRES_PORT,
      POSTGRES_USER,
      POSTGRES_PASSWORD,
      POSTGRES_DATABASE,
      DYNAMO_DB_PRODUCTS_TABLE,
      DYNAMO_DB_STOCKS_TABLE,
    } = process.env;

    // Reference DynamoDB tables
    const productsTable = dynamodb.Table.fromTableName(
      this,
      'ProductsTable',
      DYNAMO_DB_PRODUCTS_TABLE,
    );
    const stocksTable = dynamodb.Table.fromTableName(
      this,
      'StocksTable',
      DYNAMO_DB_STOCKS_TABLE,
    );

    // Create Lambda
    const cartApiLambda = new lambda.Function(this, 'CartApiLambda', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'main.handler',
      code: lambda.Code.fromAsset('dist'),
      environment: {
        NODE_ENV: 'aws',
        POSTGRES_HOST,
        POSTGRES_PORT,
        POSTGRES_USER,
        POSTGRES_PASSWORD,
        POSTGRES_DATABASE,
        DYNAMO_DB_PRODUCTS_TABLE,
        DYNAMO_DB_STOCKS_TABLE,
      },
      timeout: cdk.Duration.seconds(30),
    });

    productsTable.grantReadWriteData(cartApiLambda);
    stocksTable.grantReadWriteData(cartApiLambda);

    const functionUrl = cartApiLambda.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ['*'],
        allowedMethods: [lambda.HttpMethod.ALL],
        allowedHeaders: ['*'],
      },
    });

    // Output the API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: functionUrl.url ?? '',
    });
  }
}

const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

const listNotes = async () => {
  const params = {
    TableName: process.env.CDK_TABLE,
  };
  try {
    const data = await docClient.scan(params).promise();
    return data.Items;
  } catch (err) {
    console.log('DynamoDB error: ', err);
    return null;
  }
};

export default listNotes;

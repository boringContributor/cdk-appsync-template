const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

const getNoteById = async (noteId: String) => {
  const params = {
    TableName: process.env.CDK_TABLE,
    Key: { id: noteId },
  };
  try {
    const { Item } = await docClient.get(params).promise();
    return Item;
  } catch (err) {
    console.log('DynamoDB error: ', err);
  }
};

export default getNoteById;

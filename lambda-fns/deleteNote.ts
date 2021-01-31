const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

const deleteNote = async (noteId: String) => {
  const params = {
    TableName: process.env.CDK_TABLE,
    Key: {
      id: noteId,
    },
  };
  try {
    await docClient.delete(params).promise();
    return noteId;
  } catch (err) {
    console.log('DynamoDB error: ', err);
    return null;
  }
};

export default deleteNote;

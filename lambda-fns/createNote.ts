const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
import Note from './Note';

const createNote = async (note: Note) => {
  const params = {
    TableName: process.env.CDK_TABLE,
    Item: note,
  };
  try {
    await docClient.put(params).promise();
    return note;
  } catch (err) {
    console.log('DynamoDB error: ', err);
    return null;
  }
};

export default createNote;

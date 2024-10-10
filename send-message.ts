import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { randomUUID } from 'node:cryto';

const sqsClient = new SQSClient();

export async function handler(event){

  const orderId = randomUUID();
  const body = JSON.parse(event.body)

  const command = new SendMessageCommand({
    QueueUrl: 'https://sqs.us-east-1.amazonaws.com/123456789012/MyQueue',
    MessageBody: JSON.stringify({
      orderId,
      message:body.message
    })
  })
  
  await sqsClient.send(command)


  return {
    statusCode: 201,
    body: JSON.stringify({orderId})
  }
}

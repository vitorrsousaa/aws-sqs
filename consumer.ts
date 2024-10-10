// This lambda should be SQS as a trigger

// Batch size - Quantity of message the lambda will process in a single invocation

// batch window - time frame in which the lambda will wait to process the messages

// Dead letter queue - Queue where the messages that failed to be processed will be sent

import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'
import { randomUUID } from 'node:crypto'

export async function handler(event){

  const dynamoClient = new DynamoDBClient()

  // When the AWS service made a pooling to the lambda, it will send a batch of messages to the lambda
  // The lambda will process all the messages in the batch
  const putItems = event.Records.map(record => {
    const body = JSON.parse(record.body)

    const command = new PutItemCommand({
      TableName: 'Orders',
      Item: {
        orderId: {S: randomUUID()},
        message: {S: body.message}
      }
    })

    return dynamoClient.send(command)

  })

  // If one message throw a error, the lambda will stop the processing of the batch
  // And AWS service will send all the batch to the queue again
  // For this, you need to find a way to make sure that the lambda make the process one time per message
  // So, you need to make sure that the lambda is idempotent
  // The lambda should be able to process the same message multiple times without causing any problem
  await Promise.all(putItems)




  // Example with idempotent lambda
  const responses = await Promise.allSettled(putItems)
  const batchItemFailures = responses.map((response, index) => (
    response.status === 'rejected' ? {itemIdentifier: event.Records[index].messageId} : null
  )).filter(Boolean)

  return {
    batchItemFailures
  }

}

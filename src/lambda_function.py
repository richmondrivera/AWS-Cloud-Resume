"""Visitor counter for the Cloud Resume Challenge."""
import json

import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('cloud-resume-visitor-count')


def lambda_handler(event, context):
    response = table.update_item(
        Key={'id': '0'},
        UpdateExpression='SET #v = #v + :inc',
        ExpressionAttributeNames={'#v': 'views'},
        ExpressionAttributeValues={':inc': 1},
        ReturnValues='UPDATED_NEW'
    )

    new_count = response['Attributes']['views']

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        'body': json.dumps({'views': int(new_count)})
    }
# trigger terraform plan test
# retry terraform plan with new credentials
# trigger terraform-apply job test

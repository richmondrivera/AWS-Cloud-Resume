import json
import os
import sys

import boto3
from moto import mock_aws

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../src'))

os.environ.setdefault("AWS_DEFAULT_REGION", "us-east-1")

import lambda_function


@mock_aws
def test_lambda_handler_increments_count():
    dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
    dynamodb.create_table(
        TableName="cloud-resume-visitor-count",
        KeySchema=[{"AttributeName": "id", "KeyType": "HASH"}],
        AttributeDefinitions=[{"AttributeName": "id", "AttributeType": "S"}],
        BillingMode="PAY_PER_REQUEST",
    )

    # Re-create the module-level table reference against the mocked table
    lambda_function.dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
    lambda_function.table = lambda_function.dynamodb.Table("cloud-resume-visitor-count")
    lambda_function.table.put_item(Item={"id": "0", "views": 0})

    response = lambda_function.lambda_handler({}, {})
    body = json.loads(response["body"])

    assert response["statusCode"] == 200
    assert body["views"] == 1
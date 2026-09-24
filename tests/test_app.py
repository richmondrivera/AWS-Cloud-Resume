import json
import os
import sys

import boto3
from moto import mock_aws

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../src'))

os.environ.setdefault("AWS_DEFAULT_REGION", "us-east-1")
os.environ["TABLE_NAME"] = "cloud-resume-visitor-count"

import app


@mock_aws
def test_lambda_handler_increments_count():
    app._table = None

    dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
    dynamodb.create_table(
        TableName=os.environ["TABLE_NAME"],
        KeySchema=[{"AttributeName": "id", "KeyType": "HASH"}],
        AttributeDefinitions=[{"AttributeName": "id", "AttributeType": "S"}],
        BillingMode="PAY_PER_REQUEST",
    )

    response = app.lambda_handler({}, {})
    body = json.loads(response["body"])

    assert response["statusCode"] == 200
    assert body["count"] == 1
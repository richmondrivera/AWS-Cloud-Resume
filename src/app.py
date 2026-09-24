"""Visitor counter for the Cloud Resume Challenge."""
import json
import os

import boto3

_table = None


def _get_table():
    """Lazily initialise the table so tests can inject a mock."""
    global _table
    if _table is None:
        _table = boto3.resource("dynamodb").Table(os.environ["TABLE_NAME"])
    return _table


def lambda_handler(event, context):
    table = _get_table()
    result = table.update_item(
        Key={"id": "resume-visitors"},
        UpdateExpression=(
            "SET visitor_count = if_not_exists(visitor_count, :start) + :inc"
        ),
        ExpressionAttributeValues={":inc": 1, ":start": 0},
        ReturnValues="UPDATED_NEW",
    )
    count = int(result["Attributes"]["visitor_count"])
    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({"count": count}),
    }
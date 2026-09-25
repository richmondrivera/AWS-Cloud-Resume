output "api_invoke_url" {
  description = "The base URL for the visitor counter API"
  value       = aws_apigatewayv2_api.visitor_api.api_endpoint
}

output "dynamodb_table_name" {
  description = "The name of the DynamoDB table"
  value       = aws_dynamodb_table.visitor_count.name
}

output "lambda_function_name" {
  description = "The name of the Lambda function"
  value       = aws_lambda_function.visitor_counter.function_name
}
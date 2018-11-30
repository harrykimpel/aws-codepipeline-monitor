# AWS CodePipeline Monitor

An AWS Lambda function to request data from AWS CodePipeline and insert this information into New Relic Insights as custom event.

The Lambda function leverages three environment variables:

- AWS_REGION: the AWS region where the CodePipeline resides
- NR_ACCOUNT_ID: the New Relic account ID
- NR_INSIGHTS_INSERT_KEY: the New Relic Insights Insert API key

A sample New Relic Insights dashboard is also available in the root. You can use the dashboard API (see https://docs.newrelic.com/docs/insights/insights-api/manage-dashboards/insights-dashboard-api) to add this dashboard to your account.
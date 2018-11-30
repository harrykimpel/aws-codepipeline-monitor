// Load the SDK for JavaScript
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: process.env.AWS_REGION});
var https = require('https');

// send data to New Relic Insights
var sendToInsights = function(pipelineName, pipelineVersion, pipelineCreated, pipelineUpdated, stageName, actionStatesName, actionStateslatestExecutionStatus, actionStatesEntityUrl, actionStatesRevisionUrl, latestExecutionStatus, insightsCb) {
  var requestOptions = {
    host: 'insights-collector.newrelic.com',
    headers: {
      'Content-Type': 'application/json',
      'X-Insert-Key': process.env.NR_INSIGHTS_INSERT_KEY
    },
    method: 'POST',
    port: 443,
    path: '/v1/accounts/'+process.env.NR_ACCOUNT_ID+'/events'
  };
  
  var request = https.request(requestOptions, function(resp) {
    resp.setEncoding('utf8');
    var body = '';
    resp.on('data', function(chunk) {
        //console.log('chunk: '+chunk)
      body += chunk;
    });
    resp.on('end', function() {
      console.log('insights response: ', body);
      insightsCb(null);
    });
  }).on('error', function(error) {
    console.log(`Got error sending data to insights: ${error.message}`);
    insightsCb(error.message);
  });

  request.write(JSON.stringify([{
      eventType: 'AWSCodePipeline',
      pipelineName: pipelineName, 
      pipelineVersion: pipelineName, 
      pipelineCreated: pipelineCreated, 
      pipelineUpdated: pipelineUpdated, 
      stageName: stageName, 
      actionStatesName: actionStatesName, 
      actionStateslatestExecutionStatus: actionStateslatestExecutionStatus, 
      actionStatesEntityUrl: actionStatesEntityUrl, 
      actionStatesRevisionUrl: actionStatesRevisionUrl, 
      latestExecutionStatus: latestExecutionStatus
  }]));
  request.end();
};

var CUSTOM_PARAMETERS = {
};

exports.handler = (event, context, callback) => {
    var codepipeline = new AWS.CodePipeline();
    var params = {};
    var res = codepipeline.listPipelines(params, function(err, data) {
      if (err)
      {
        console.log("error: "+err, err.stack); // an error occurred
        const response = {
                statusCode: 200,
                body: data,
            };
            return response;
      }
      else 
      {
        data['pipelines'].forEach(function(element) {
          
          var params = {
              name: element.name /* required */
            };
            
          codepipeline.getPipelineState(params, function(err, dataState) {
              if (err) console.log(err, err.stack); // an error occurred
              else    
              {
                  // successful response
                  dataState['stageStates'].forEach(function(elementStage) {
                    elementStage.actionStates.forEach(function(elementStageState) {
                    sendToInsights (
                      element.name, 
                      element.version, 
                      element.created, 
                      element.updated, 
                      elementStage.stageName, 
                      elementStageState.actionName, 
                      elementStageState.latestExecution.status, 
                      elementStageState.entityUrl, 
                      elementStageState.revisionUrl, 
                      elementStage.latestExecution.status, 
                      function(err) {
                          if (err) {
                            console.log(`error sending to insights: ${err}`);
                          }
                      });
                  });
                });
              }
            });    
        });
        
        // successful response
          const response = {
                statusCode: 200,
                body: data,
            };
            return response;
      }
    });
};

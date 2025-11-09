// Example Configuration File
// Copy this to config.js and replace with your actual AWS resource identifiers

window._workshopConfig = {
  cognito: {
    userPoolId: 'us-east-1_ERqrZD4GY', // Replace with your Cognito User Pool ID
    userPoolClientId: '7spf5ol9hka8i2q4ifs2115gu3', // Replace with your Cognito App Client ID
    region: 'us-east-1' // Replace with your AWS region
  },
  api: {
    invokeUrl: 'https://mtub9gvz26.execute-api.us-east-1.amazonaws.com/dev' // Replace with your API Gateway URL
  }
};

window._configLoaded = true;
# Manual AWS Lambda Deployment Guide

## 📋 Overview

Your application has been split into two parts:

- **Lambda Layer** (`dependencies-layer.zip` - 18MB): Contains all Node.js dependencies
- **Lambda Function** (`function.zip` - 4KB): Contains your application code

## 🎯 Deployment Steps

### Step 1: Deploy the Lambda Layer

1. **Go to AWS Lambda Console** → **Layers** → **Create layer**

2. **Configure Layer:**

   - **Name**: `unicorn-finance-deps`
   - **Upload**: Choose `dependencies-layer.zip`
   - **Compatible runtimes**: Select `Node.js 18.x` and `Node.js 20.x`
   - **Description**: "Dependencies for Unicorn Finance Lambda function"

3. **Create layer** and note the **Layer ARN** (you'll need this for the function)

### Step 2: Deploy the Lambda Function

1. **Go to AWS Lambda Console** → **Functions** → **Create function**

2. **Configure Function:**

   - **Function name**: `unicorn-finance`
   - **Runtime**: `Node.js 18.x` (or 20.x)
   - **Architecture**: `x86_64`

3. **Upload Function Code:**

   - **Code source** → **Upload from** → **.zip file**
   - Choose `function.zip`

4. **Add the Layer:**

   - Scroll down to **Layers**
   - **Add a layer** → **Custom layers**
   - Select your layer: `unicorn-finance-deps`
   - Choose **Version 1**

5. **Configure Runtime Settings:**

   - **Handler**: `index.handler` (already set correctly)
   - **Timeout**: Increase to `30 seconds` (your app does HTTPS requests)
   - **Memory**: `512 MB` (recommended for your proxy operations)

6. **Environment Variables:**

   ```
   NODE_ENV=production
   SECRET_NAME=your-aws-secrets-manager-secret-name
   ```

7. **Execution Role:**
   - Ensure your Lambda execution role has:
     - `AWSLambdaBasicExecutionRole` (for CloudWatch logs)
     - `SecretsManagerReadWrite` (for accessing certificates)

### Step 3: Test the Function

1. **Create test event:**

   ```json
   {
     "httpMethod": "GET",
     "path": "/some-endpoint",
     "headers": {},
     "body": null
   }
   ```

2. **Invoke** and check the response

## 🔧 Configuration Notes

### Certificates Setup

Your function expects certificates in AWS Secrets Manager. Make sure:

- Secret contains: `KEY`, `CERT`, `DIGITAL` fields
- Lambda role can access the secret
- Environment variable `SECRET_NAME` points to correct secret

### API Gateway Integration (Optional)

To expose your Lambda as HTTP endpoints:

1. Create **API Gateway** (REST API)
2. Create resource with **{proxy+}** path
3. Create **ANY** method
4. Set **Lambda Function** as integration target
5. Enable **Lambda Proxy Integration**
6. Deploy API

## 📁 File Structure Created

```
server/
├── dependencies-layer.zip    # 18MB - Upload to Lambda Layer
├── function.zip             # 4KB - Upload to Lambda Function
├── lambda-layer/            # Build artifacts (can delete)
├── lambda-function/         # Build artifacts (can delete)
├── package-layer.json       # Dependencies for layer
├── package-lambda.json      # Clean package.json for function
└── build-lambda.sh         # Build script (rerun when needed)
```

## 🔄 Updating Your Function

**For code changes:**

1. Run `./build-lambda.sh`
2. Upload new `function.zip` to Lambda console

**For dependency changes:**

1. Update `package-layer.json`
2. Run `./build-lambda.sh`
3. Create new layer version
4. Update function to use new layer version

## ✅ Success Indicators

- Function deploys without size errors
- Layer shows as "Available"
- Function shows layer attached in console
- Test invocation returns successful response
- CloudWatch logs show no import/require errors

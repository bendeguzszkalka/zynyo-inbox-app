# Zynyo Core API Reference Documentation

> This document aggregates the Zynyo API documentation for easy access during development.

---

# 1. Getting Started

# Getting started

To start the process of getting your first sign request completed there are 4 steps:

* [1. Authentication](#1-authentication) 
* [2. Create your first sign request](#2-create-your-first-sign-request) 
* [3. Get the status of the sign request](#3-get-the-status-of-the-sign-request) 
* [4. Download the signed document](#4-download-the-signed-document) 

## 1. Authentication

There are two forms of API authentication: API-key and access token.

### 1.1 API-key

An API-key is the easiest way to authenticate. Every account has at least one associated API-account, including API-key.
The keys can be accessed by the account admin. An account can be created using the onboarding process.
See [Creating an account](/core-api-documentation/docs/account/creating-account) and [Obtaining an API-key](/core-api-documentation/docs/account/obtaining-api-key) for more info.

The API-key should be provided by adding the following header to the API-call:

```json
apikey: your-api-key

```

### 1.2 Access token

An alternative method for authentication is an access token.
See [Obtaining an access token](/core-api-documentation/docs/account/advanced/obtaining-access-token) for more info.

The access token should be provided by adding the following header to the API-call:

```json
authorization: bearer your-access-token

```

## 2. Create your first sign request

A basic sign request consists of the following elements:

* A document

* A submitter

* A signatory

* An authentication method for the signatory

The endpoint [/sign/signdocumentrequest](/core-api-documentation/api/rest/v4#tag/Signing/operation/signDocumentRequest) 
is used for creating the sign request.

Depending on the chosen authentication the request needs an `apikey` or an `authorization` header. An example of the body for a basic request is as follows:

Request: [POST/sign/signdocumentrequest](/core-api-documentation/api/rest/v4#tag/Signing/operation/signDocumentRequest) 
* API-key
* Access tokenHeaders

```json
apikey: your-api-key
content-type: application/json

```

Headers

```json
authorization: bearer your-access-token
content-type: application/json

```

Body

```json
{
 "documentInfo": {
 "name": "Contract ABC",
 "description": "Please sign the contract"
 },
 "submitter": "john.smith@zynyo.com",
 "submitterName": "John Smith",
 "signatories": [
 {
 "name": "John Doo Smith",
 "email": "john.doo.smith@zynyo.com",
 "signatoryRole": "SIGN",
 "authenticationMethods": [
 {
 "type": "idin"
 }
 ]
 }
 ],
 "applicationVersion": "Your application name and version",
 "reference": "Your own reference to this document (optional)",
 // The document content is encoded in Base64
 "content": "JVBERi0xLjQNJeLjz9MNCjc4IDAgb2JqDTw8L0xp......E2DQolJUVPRg0K"
}

```

After successfully creating the sign request the signatories will be invited and you will get the documentUUID
and, optionally, a link to sign for each signatory.

Response: [200Successful](/core-api-documentation/api/rest/v4#tag/Signing/operation/signDocumentRequest) Headers

```json
content-type: application/json

```

Body

```json
{
 "documentUUID": "3eea8187-e63d-43e7-a1f7-7272c4f50f23",
 // signatoryLink is only included if the API-account has returnSignatoryLinks enabled
 "signatoryLink": [
 {
 "sequence": 1,
 "email": "john.doo.smith@zynyo.com",
 "role": "SIGN",
 "signatoryUUID": "1eea3187-e62d-41e7-a5f7-7272c4f50f23",
 "documentLink": "https://signingservice.zynyo.com/sign/1eea3187-e62d-41e7-a5f7-7272c4f50f23"
 }
 ]
}

```

For information about the different options available when creating a sign request, see [Sign request options](/core-api-documentation/docs/eSign/signrequest-options/) .

## 3. Get the status of the sign request

To keep up to date with the process we have different states for the document and for the signatories.
To be able to complete the sign request the document state must be `SIGNED`, at this state the document can be downloaded
by all parties. For an overview of the different states please see [Getting the status of the request](/core-api-documentation/docs/eSign/status-signrequest) .

There are two ways to get the status of a sign request, callbacks and status requests.

### 3.1 Callbacks

The first option is to provide a callback url in the original request:

```json
"callbackURL": "https://your-callback-url.com/your-endpoint"

```

You will receive callbacks on this url whenever (1) the document state changes,
with the exception of the `AUDITLOG` and `DISPATCHED` state,
or (2) a signatory reaches the `VALIDATED` state.

The callbacks have a header checksum which can be used to verify the sender and integrity of the content.
The checksum is the sha256 hash of the API-key + the content of the callback.
The callbacks have the following structure:

Callback: [POSThttps://your-callback-url.com/your-endpoint](/core-api-documentation/api/rest/v4#tag/Signing/operation/signDocumentRequest) Query parameters

```json
checksum: sha256(apikey + content)

```

Headers

```json
content-type: application/json

```

Body

```json
{
 "documentUUID": "3eea8187-e63d-43e7-a1f7-7272c4f50f23",
 "currentState": "VALIDATED",
 "previousDocumentState": "NOT_VALIDATED",
 "reference": "Your own reference to this document",
 "signatoryStatusList": [
 {
 "email": "john.doo.smith@zynyo.com",
 "state": "VALIDATED",
 "date": 1577836800000
 }
 ]
}

```

### 3.2 Status requests

The second option is to manually query for the status. This can be done with the
 [/document/{uuid}](/core-api-documentation/api/rest/v4#tag/Documents/operation/getDocument) endpoint.

Request: [GET/document/{uuid}](/core-api-documentation/api/rest/v4#tag/Documents/operation/getDocument) 
* API-key
* Access tokenHeaders

```json
apikey: your-api-key

```

Headers

```json
authorization: bearer your-access-token

```

An example response is given below:

Response: [200Successful](/core-api-documentation/api/rest/v4#tag/Documents/operation/getDocument) Headers

```json
content-type: application/json

```

Body

```json
{
 // Some fields have been omitted for readability
 "documentUUID": "3eea8187-e63d-43e7-a1f7-7272c4f50f23",
 "name": "Contract ABC",
 "description": "Please sign the contract",
 "documentState": "PARTIALLY_VALIDATED",
 "previousState": "NOT_VALIDATED",
 "stateChangedDate": 1577836800000,
 "signRequest": {
 "reference": "Your own reference to this document",
 },
 "signatories": [
 {
 "name": "John Doo Smith",
 "email": "john.doo.smith@zynyo.com",
 "lastStateChangeAt": 1577836800000,
 "state": "VALIDATED",
 }
 ]
}

```

The reference field can be used in the sign request creation to give an internal reference to the request.
This reference will be sent back in the callbacks and in the manual status requests.

Each request has an expiration date. This can be set to a standard in the API-key settings,
but can also be set per request. The default is 30 days.
Once a document expires, it will be removed, and it is no longer possible to retrieve it.

## 4. Download the signed document

When the state of the document is `SIGNED` you can retrieve the signed document.
If you configured that the audit log should be separated, you will get both documents individually.
If you configured that the audit log must be added to the document, the `auditlogContent` field will be empty.

warning

Some authentication methods require the audit log to be separate and will overwrite the configuration when used.
It is therefore advised to always check the `auditlogContent` field.

The [/sign/getsigned/{documentUUID}](/core-api-documentation/api/rest/v4#tag/Signing/operation/getSignedDocument) request is used for
downloading signed documents.

Request: [GET/sign/getsigned/{documentUUID}](/core-api-documentation/api/rest/v4#tag/Signing/operation/getSignedDocument) 
* API-key
* Access tokenHeaders

```json
apikey: your-api-key

```

Headers

```json
authorization: bearer your-access-token

```

An example response is given below:

Response: [200Successful](/core-api-documentation/api/rest/v4#tag/Signing/operation/getSignedDocument) Headers

```json
content-type: application/json

```

Body

```json
{
 // The content is encoded in Base64
 "documentContent": "JVBERi0xLjQNJeLjz9MNCjc4IDAgb2JqDTw8L0xp......E2DQolJUVPRg0K<",
 "auditlogContent": "JKJJIioju9khjKJjzKKLSDSIDDAgbJKAJKjlkjos......KOJihjlahsdIKL"
}

```

---

# 2. Account Overview

# Account

## 

 [📄️ Creating an accountWe have two environments: sandbox and production.](/core-api-documentation/docs/account/creating-account)

---

# - Creating an Account

# Creating an account

We have two environments: sandbox and production.

The sandbox environment is used for testing and receives early versions of our new updates.
The sandbox environment can be found at [sandbox.zynyo.com](https://sandbox.zynyo.com) .

The production environment is used for production and can be found at [signingservice.zynyo.com](https://signingservice.zynyo.com) .

tip

If you already have an account and want to start using our API, you can continue to [Obtaining an API-key](/core-api-documentation/docs/account/obtaining-api-key) 

## Onboarding

The easiest way to create an account is by completing the self-onboarding.
The self-onboarding can be found [here](https://signingservice.zynyo.com/onboarding/info) .

## Planning a demo

If you would like a demo of our product and our API you can plan in a video call [here](https://zynyo.com/plan-een-call/product-demo/) .

## Getting in touch

If you would like some more information or you would like a test account on the sandbox environment, you can contact us at [contact@zynyo.com](mailto:contact@zynyo.com) .

---

# - Obtaining an API-key

# Obtaining an API-key

An API-key is the easiest way to authenticate. Every account has at least one associated API-account.
Each API-account has individual settings, such as the display name of the organization,
the styling of the emails, the time between reminders, and more.
Every sign request belongs to an API-account and the usage is also separated per API-account.
An account can have multiple API-accounts.

Every API-account als has an API-key that can be used to authenticate API-calls.
The keys can be accessed by the account admin by logging in (see [Creating an account](/core-api-documentation/docs/account/creating-account) ),
going to the API-keys overview, selecting an API-key and then viewing the API settings. The API-key should be displayed here.

The API-key should be provided by adding the following header to the API-call:

```json
apikey: your-api-key

```

After retrieving the API-key you can continue by creating a sign request, creating an eDelivery request or by sealing a document:

## 

 [📄️ Creating a basic signingrequestA basic sign request consists of the following elements:](/core-api-documentation/docs/eSign/basic-signrequest)

---

# - Obtaining an Access Token

# Obtaining an access token

In Rest V4 it is possible to retrieve account information and manage API accounts.
For these endpoints, an access token is required to authenticate the request.

The access token can also be used in other requests.
The first API-key matching the account of the user connected with the access token will be used in this case.
In case the user has a department, the first API-key matching the department will be used.

The [/auth/{realmId}/token](/core-api-documentation/api/rest/v4#tag/Token/operation/getToken) endpoint is used for creating an access token.

To be able to retrieve a token, a `realmId`, `client_id`, and `client_secret` must be given by Zynyo.
For this, contact our support at [support@zynyo.com](mailto:support@zynyo.com) .

An example request is given below:

Request: [POST/auth/{realmId}/token](/core-api-documentation/api/rest/v4#tag/Token/operation/getToken) Headers

```json
content-type: application/x-www-form-urlencoded

```

Body

```json
grant_type: client_credentials
client_id: your-client-id
client_secret: your-client-secret

```

It is also possible to use the token endpoint for user login.
This requires the user to be registered within our environment.
Please contact us if you want to set this up. An example is given below:

Request: [POST/auth/{realmId}/token](/core-api-documentation/api/rest/v4#tag/Token/operation/getToken) Headers

```json
content-type: application/x-www-form-urlencoded

```

Body

```json
grant_type: password
client_id: your-client-id
client_secret: your-client-secret
username: example@email.com
password: examplePassword

```

Both request will yield a response in the following format:

Response: [200Successful](/core-api-documentation/api/rest/v4#tag/Token/operation/getToken) Headers

```json
content-type: application/json

```

Body

```json
{
 // Some fields have been omitted for readability
 "access_token": "your-access-token",
 "expires_in": 300,
 "token_type": "Bearer"
}

```

---

# 3. eSign Options Overview

# eSign

## 

 [📄️ Creating a basic signingrequestA basic sign request consists of the following elements:](/core-api-documentation/docs/eSign/basic-signrequest)

---

# - Creating a Basic Sign Request

# Creating a basic signingrequest

A basic sign request consists of the following elements:

* A document

* A submitter

* A signatory

* An authentication method for the signatory

The endpoint [/sign/signdocumentrequest](/core-api-documentation/api/rest/v4#tag/Signing/operation/signDocumentRequest) 
is used for creating the sign request.

Depending on the chosen authentication the request needs an `apikey` or an `authorization` header. An example of the body for a basic request is as follows:

Request: [POST/sign/signdocumentrequest](/core-api-documentation/api/rest/v4#tag/Signing/operation/signDocumentRequest) 
* API-key
* Access tokenHeaders

```json
apikey: your-api-key
content-type: application/json

```

Headers

```json
authorization: bearer your-access-token
content-type: application/json

```

Body

```json
{
 "documentInfo": {
 "name": "Contract ABC",
 "description": "Please sign the contract"
 },
 "submitter": "john.smith@zynyo.com",
 "submitterName": "John Smith",
 "signatories": [
 {
 "name": "John Doo Smith",
 "email": "john.doo.smith@zynyo.com",
 "signatoryRole": "SIGN",
 "authenticationMethods": [
 {
 "type": "idin"
 }
 ]
 }
 ],
 "applicationVersion": "Your application name and version",
 "reference": "Your own reference to this document (optional)",
 // The document content is encoded in Base64
 "content": "JVBERi0xLjQNJeLjz9MNCjc4IDAgb2JqDTw8L0xp......E2DQolJUVPRg0K"
}

```

After successfully creating the sign request the signatories will be invited and you will get the documentUUID
and, optionally, a link to sign for each signatory.

Response: [200Successful](/core-api-documentation/api/rest/v4#tag/Signing/operation/signDocumentRequest) Headers

```json
content-type: application/json

```

Body

```json
{
 "documentUUID": "3eea8187-e63d-43e7-a1f7-7272c4f50f23",
 // signatoryLink is only included if the API-account has returnSignatoryLinks enabled
 "signatoryLink": [
 {
 "sequence": 1,
 "email": "john.doo.smith@zynyo.com",
 "role": "SIGN",
 "signatoryUUID": "1eea3187-e62d-41e7-a5f7-7272c4f50f23",
 "documentLink": "https://signingservice.zynyo.com/sign/1eea3187-e62d-41e7-a5f7-7272c4f50f23"
 }
 ]
}

```

For information about the different options available when creating a sign request, see [Sign request options](/core-api-documentation/docs/eSign/signrequest-options/) .

---

# - Sign Request Options

# Sign request options

## 

 [📄️ Signature OptionsParallel vs. Sequential](/core-api-documentation/docs/eSign/signrequest-options/signature-options)

---

# - Getting the Status of a Request

# Getting the status of the request

To keep up to date with the process we have different states for the document and for the signatories.
To be able to complete the signrequest the state must be `SIGNED`, at this state the document can be downloaded
by all parties. The following states are available for a document that is part of a signrequest:

* `NOT_VALIDATED`: The starting state of the request

* `PARTIALLY_VALIDATED`: One signatory is complete but not all

* `VALIDATED`: All signatories are complete

* `AUDITLOG`: Audit log is being generated

* `DISPATCHED`: Document is dispatched to receive its stamp

* `SIGNED`: Document is finished and ready to be downloaded

* `EXPIRED`: Document is expired and is removed from our system

* `ARCHIVED`: Depricated state

* `AUTHENTICATION_FAILED`: An authentication method failed which can not be redone

* `CANCELLED`: The submitter cancelled the document

* `REJECTED`: A receiver rejected the document

* `ERROR`: An internal error occurred

The following states are available for a document that is part of a signrequest:

* `CC`: Signatory only receives a CC of the signed document

* `REPLACEMENT_CANDIDATE`: Signatory is eligible to replace another signatory.

* `AUTHORIZATION_CANDIDATE`: Signatory is eligible to sign in the name of another signatory.

* `REPLACED`: Signatory has been replaced by another signatory

* `DELEGATED`: Signatory has authorized another signatory to sign in their name.

* `GROUP_COMPLETED`: Signatory is part of a signing group from which another signatory has successfully signed the document.

* `NOT_INVITED`: Signatory has not yet been invited to view the document

* `AWAIT_EMAIL`: Await email

* `EMAIL_SENT`: Invitation email sent to the signatory's email address

* `UUID_ACCESSED`: Signatory has accessed the UUID

* `VIEWING`: Signatory is reading the document

* `VIEWED`: Signatory has viewed the document

* `VALIDATED`: Signatory has validated the document

* `DOWNLOAD_ACCESSED`: Pre-view signatory has accessed the download page

* `DOWNLOADED`: Pre-view signatory has downloaded the document

* `AUTHENTICATION_FAILED`: Signatory has failed authentication on one of the authentication methods attached to the document process

* `REJECTED`: Signatory has rejected the document

* `E_EMAIL`: Email could not be sent

* `ERROR`: An error has occurred during the process

There are two ways to get the status of a sign request, callbacks and status requests.

## Callbacks

The first option is to provide a callback url in the original request:

```json
"callbackURL": "https://your-callback-url.com/your-endpoint"

```

You will receive callbacks on this url whenever (1) the document state changes,
with the exception of the `AUDITLOG` and `DISPATCHED` state,
or (2) a signatory reaches the `VALIDATED` state.

The callbacks have a header checksum which can be used to verify the sender and integrity of the content.
The checksum is the sha256 hash of the API-key + the content of the callback.
The callbacks have the following structure:

Callback: [POSThttps://your-callback-url.com/your-endpoint](/core-api-documentation/api/rest/v4#tag/Signing/operation/signDocumentRequest) Query parameters

```json
checksum: sha256(apikey + content)

```

Headers

```json
content-type: application/json

```

Body

```json
{
 "documentUUID": "3eea8187-e63d-43e7-a1f7-7272c4f50f23",
 "currentState": "VALIDATED",
 "previousDocumentState": "NOT_VALIDATED",
 "reference": "Your own reference to this document",
 "signatoryStatusList": [
 {
 "email": "john.doo.smith@zynyo.com",
 "state": "VALIDATED",
 "date": 1577836800000
 }
 ]
}

```

## Status requests

The second option is to manually query for the status. This can be done with the
 [/document/{uuid}](/core-api-documentation/api/rest/v4#tag/Documents/operation/getDocument) endpoint.

Request: [GET/document/{uuid}](/core-api-documentation/api/rest/v4#tag/Documents/operation/getDocument) 
* API-key
* Access tokenHeaders

```json
apikey: your-api-key

```

Headers

```json
authorization: bearer your-access-token

```

An example response is given below:

Response: [200Successful](/core-api-documentation/api/rest/v4#tag/Documents/operation/getDocument) Headers

```json
content-type: application/json

```

Body

```json
{
 // Some fields have been omitted for readability
 "documentUUID": "3eea8187-e63d-43e7-a1f7-7272c4f50f23",
 "name": "Contract ABC",
 "description": "Please sign the contract",
 "documentState": "PARTIALLY_VALIDATED",
 "previousState": "NOT_VALIDATED",
 "stateChangedDate": 1577836800000,
 "signRequest": {
 "reference": "Your own reference to this document",
 },
 "signatories": [
 {
 "name": "John Doo Smith",
 "email": "john.doo.smith@zynyo.com",
 "lastStateChangeAt": 1577836800000,
 "state": "VALIDATED",
 }
 ]
}

```

The reference field can be used in the sign request creation to give an internal reference to the request.
This reference will be sent back in the callbacks and in the manual status requests.

Each request has an expiration date. This can be set to a standard in the API-key settings,
but can also be set per request. The default is 30 days.
Once a document expires, it will be removed, and it is no longer possible to retrieve it.

---

# 4. eDelivery Overview

# eDelivery

## 

 [📄️ Creating a basic eDeliveryA basic eDelivery consists of the following elements:](/core-api-documentation/docs/eDelivery/basic-edelivery)

---

# - Creating a Basic eDelivery

# Creating a basic eDelivery

A basic eDelivery consists of the following elements:

* A subject

* A submitter

* A receiver

* An identification method for the receiver

* A message and/or document

The endpoint [/delivery/deliveryrequest](/core-api-documentation/api/rest/v4#tag/eDelivery/operation/deliveryRequest) is used for creating the eDelivery.

Request: [POST/delivery/deliveryrequest](/core-api-documentation/api/rest/v4#tag/eDelivery/operation/deliveryRequest) 
* API-key
* Access tokenHeaders

```json
apikey: your-api-key
content-type: application/json

```

Headers

```json
authorization: bearer your-access-token
content-type: application/json

```

Body

```json
{
 "subject": "Document ABC",
 "message": "Please accept this document",
 "submitter": {
 "name": "John Doo Smith",
 "email": "john.doo.smith@zynyo.com",
 "recipientRole": "CC"
 },
 "recipients": [
 {
 "name": "John Doo Smith",
 "email": "john.doo.smith@zynyo.com",
 "authenticationMethods": [
 {
 "type": "idin",
 "authtype": "PREVIEW"
 }
 ],
 "recipientRole": "DELIVERY"
 }
 ],
 "useTimeStamp": true,
 "enableLTV": true,
 "applicationVersion": "MyApplication v1.0"
}

```

info

It is important that the `recipientRole` of the submitter is set to `CC`.
If not set, it will default to `DELIVERY`, which results in the creation of two eDeliveries: one to the recipient and one to the submitter themselves.

info

All authentication methods must have `authtype` set to `PREVIEW`. If not set, this will default to `AFTERVIEW`, which is ignored for eDelivery.

After successfully creating the eDelivery, the receiver(s) will be notified, and you will get the `documentUUID` and, for each recipient, a link to open the message.

Response: [200Successful](/core-api-documentation/api/rest/v4#tag/eDelivery/operation/deliveryRequest) Headers

```json
content-type: application/json

```

Body

```json
[
 {
 "documentUUID": "3eea8187-e63d-43e7-a1f7-7272c4f50f23",
 "signatoryLink": [
 {
 "sequence": 1,
 "email": "john.doo.smith@zynyo.com",
 "role": "DELIVERY",
 "signatoryUUID": "1eea3187-e62d-41e7-a5f7-7272c4f50f23",
 "documentLink": "https://signingservice.zynyo.com/sign/1eea3187-e62d-41e7-a5f7-7272c4f50f23"
 }
 ]
 }
]

```

---

# 5. eSeal Details

# eSeal

With the eSeal module, you can seal documents instantly with a digital signature.
To seal a document by your organisation you need an organisational certificate.
You can request one from Digidentity. When received you can contact us after which the certificate can be used.
The endpoint [/eseal](/core-api-documentation/api/rest/v4#tag/eSeal/operation/eSealDocument) is used for sealing the documents.

A basic example request:

Request: [POST/eseal](/core-api-documentation/api/rest/v4#tag/eSeal/operation/eSealDocument) 
* API-key
* Access tokenHeaders

```json
apikey: your-api-key
content-type: application/json

```

Headers

```json
authorization: bearer your-access-token
content-type: application/json

```

Body

```json
{
 "filename": "document.pdf",
 "useTimeStamp": true,
 "enableLTV": true,
 "content": "JVBERi0xLjQKNM19898CFMA....yKLMI178K7l9GCg=="
}

```

Example response returning the content of the sealed document in base64 and the filename:

Response: [200Successful](/core-api-documentation/api/rest/v4#tag/eSeal/operation/eSealDocument) Headers

```json
content-type: application/json

```

Body

```json
{
 "content": "JVBERi0xLjQKNM19898CFMA....yKLMI178K7l9GCg==",
 "fileName": "document.pdf"
}

```

It is also possible to only sign the hash of a document.
The endpoint [/eseal/hash](/core-api-documentation/api/rest/v4#tag/eSeal/operation/signHash) is used for this.

Example request:

Request: [POST/eseal/hash](/core-api-documentation/api/rest/v4#tag/eSeal/operation/signHash) 
* API-key
* Access tokenHeaders

```json
apikey: your-api-key
content-type: application/json

```

Headers

```json
authorization: bearer your-access-token
content-type: application/json

```

Body

```json
{
 "documentHash": "JVBERi0xLjQKNM19898CFMA....yKLMI178K7l9GCg=="
}

```

Example response returning the signature in base64:

Response: [200Successful](/core-api-documentation/api/rest/v4#tag/eSeal/operation/signHash) Headers

```json
content-type: application/json

```

Body

```json
{
 "signature": "JVBERi0xLjQKNM19898CFMA....yKLMI178K7l9GCg=="
}

```

---

# 6. Status Codes

# Status codes

When making use of our API we can return a variety of different status codes.
Below is an overview of the meaning of each status code.

* [200 series](#200-series) 
* [300 series](#300-series) 
* [400 series](#400-series) 
* [500 series](#500-series) 

## 200 series

### 200 Success

This status code indicates that the request succeeded.
The meaning of success depends on the HTTP method:

* `GET`: The resource has been fetched and transmitted in the message body.

* `PUT` or `POST`: The resource describing the result of the action is transmitted in the message body.

### 201 Created

This status code indicates that the request succeeded and a new resource has been created.

### 202 Accepted

This status code indicates that the request has been received but not yet acted upon.
It is intended for cases where another process or server handles the request, or for batch processing.

## 300 series

### 302 Found. Link in location header

This status code indicates that the requested URI has been found and results in a temporary redirect.
This redirection is temporary and the original URI should still be used therefore for further requests.

## 400 series

### 400 Bad request

This status code indicates that the request is malformed or incomplete.
On receival, it is advised to check if all parameters are provided and if all values provided are valid.

### 401 Unauthorized

This status code indicates that the request is unauthorized.
This indicates that either the API-key or access token is missing or invalid.

### 403 Forbidden

This status code indicates that the request does not have the rights to access the content.
Unlike 401 Unauthorized, the api key or access token is present and valid
but does not hold the proper rights for the request.

### 404 Not found

This status code indicates that the server cannot find the requested resource.
This either means that the URL is not recognized by the API or that the requested resource does not exist.

### 405 Method not allowed

This status code indicates that the requested URL does not support the provided HTTP method.

### 429 Too many requests

This status code indicates that the user has sent too many requests in a given amount of time.

## 500 series

### 500 Internal server error

This status code indicates that the server has encountered a situation it does not know how to handle.
The result is that the request is aborted.

### 502 Bad gateway

This status code indicates that the server was acting as a gateway or proxy
and that it received an invalid response from the upstream server.

### 503 Service unavailable

This status code indicates that the server is not ready to handle the request.
It is either down for maintenance or it is overloaded.

---


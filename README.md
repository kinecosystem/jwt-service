# Kin ecosystem JWT service

A helper tool to create/sign [JWT](https://en.wikipedia.org/wiki/JSON_Web_Token).  
Tokens are needed, in some cases, when interacting with our [marketplace server](https://github.com/kinfoundation/marketplace-server), 
and as a result of that, the tokens are also needed when working with our SDKs.

In order to make the first integration with our SDKs simpler we supply this service, which can easily be installed and used 
by anyone who wants to try integrating Kin into their app.

### Keys
The repo contains private/public RSA keys and private/public stellar keys.  
These keys are for testing porpuses only.

### Install
```bash
npm install -g @kinecosystem/jwt-service
```

### Run
```bash
jwt-service
```

### Using the service
The service supports 4 endpoints:

#### offers
Returns a collection of made up offers:  
`GET SERVICE_URL/offers`

Result:
```json
{
    "offers": [
        {
            "id": "offer1",
            "title": "first offer",
            "amount": 10,
            "description": "the 1st test offer",
            "wallet_address": "GDC6UAWZETQRXDFJHHZS2O7JK2OQ3F5MNOZLHJP4TD7J6MB5Q2NH5YGU"
        },
        {
            "id": "offer2",
            "title": "second offer",
            "amount": 20,
            "description": "the 2nd test offer",
            "wallet_address": "GDC6UAWZETQRXDFJHHZS2O7JK2OQ3F5MNOZLHJP4TD7J6MB5Q2NH5YGU"
        },
        {
            "id": "offer1",
            "title": "third offer",
            "amount": 30,
            "description": "the 3rd test offer",
            "wallet_address": "GDC6UAWZETQRXDFJHHZS2O7JK2OQ3F5MNOZLHJP4TD7J6MB5Q2NH5YGU"
        }
    ]
}
```

#### earn
Returns a token which can be used to create an earn order:  
`GET SERVICE_URL/earn/token?user_id=userA&device_id=deviceA&offer_id=offer1&nonce=MyUniqueNonce`

Result:
```json
{
    "jwt": "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6ImRlZmF1bHQifQ.eyJ0eXAiOiJKV1QiLCJpZCI6Im9mZmVyMSIsInRpdGxlIjoidGhpcmQgb2ZmZXIiLCJhbW91bnQiOjMwLCJkZXNjcmlwdGlvbiI6InRoZSAzcmQgdGVzdCBvZmZlciIsIndhbGxldF9hZGRyZXNzIjoiR0RDNlVBV1pFVFFSWERGSkhIWlMyTzdKSzJPUTNGNU1OT1pMSEpQNFREN0o2TUI1UTJOSDVZR1UiLCJpYXQiOjE1MjM4NzI4MDYsImV4cCI6MTUyNTQxODI3OTE3MCwic3ViIjoic3BlbmQifQ.d2pEsXzWMr-XXNfnKYL52C-GscRMdIqtrETdpGc2R_TOnLcScXMLFU62HshP3hxZW88vi5JY42MszVApNmCQ_XI9XgVcZcAIYx6Ef63sO-e1WG8_oPRFFLwHf1p8VylArtkvaz2JkWbHVPQuCNdcwf31JUMVSqJZHGk6ez3KaSQ"
}
```

The `user_id` the id for the user which will receive the kin.  
The `device_id` the id of the device for the user which will receive the kin.  
The `offer_id` needs to match one of the offers which returns from the `SERVICE_URL/offers` endpoint.  
The `nonce` is an optional id (string) which can be used to differentiate between multiple requests for the same `offer_id`.

#### spend
Returns a token which can be used to create a spend order:  
`GET SERVICE_URL/spend/token?user_id=userA&offer_id=offer1&device_id=deviceA&nonce=MyUniqueNonce`

Result:
```json
{
    "jwt": "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6ImRlZmF1bHQifQ.eyJ0eXAiOiJKV1QiLCJpZCI6Im9mZmVyMSIsInRpdGxlIjoidGhpcmQgb2ZmZXIiLCJhbW91bnQiOjMwLCJkZXNjcmlwdGlvbiI6InRoZSAzcmQgdGVzdCBvZmZlciIsIndhbGxldF9hZGRyZXNzIjoiR0RDNlVBV1pFVFFSWERGSkhIWlMyTzdKSzJPUTNGNU1OT1pMSEpQNFREN0o2TUI1UTJOSDVZR1UiLCJpYXQiOjE1MjM4NzI4MDYsImV4cCI6MTUyNTQxODI3OTE3MCwic3ViIjoic3BlbmQifQ.d2pEsXzWMr-XXNfnKYL52C-GscRMdIqtrETdpGc2R_TOnLcScXMLFU62HshP3hxZW88vi5JY42MszVApNmCQ_XI9XgVcZcAIYx6Ef63sO-e1WG8_oPRFFLwHf1p8VylArtkvaz2JkWbHVPQuCNdcwf31JUMVSqJZHGk6ez3KaSQ"
}
```

The `user_id` the id for the user which will send the kin.  
The `device_id` the id of the device for the user which will send the kin. 
The `offer_id` needs to match one of the offers which returns from the `SERVICE_URL/offers` endpoint.  
The `nonce` is an optional id (string) which can be used to differentiate between multiple requests for the same `offer_id`.

#### pay to user
Returns a token which can be used to create a p2p order:  
`GET SERVICE_URL/p2p/token?user_id=userA&device_id=deviceA&offer_id=offer1&amount=0.43&sender_title=paidTitle&sender_description=paid_desc&recipient_id=userB&recipient_title=receivedTitle&recipient_description=receivedDesc&nonce=MyUniqueNonce`

Result:
```json
{
    "jwt": "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6ImRlZmF1bHQifQ.eyJ0eXAiOiJKV1QiLCJpZCI6Im9mZmVyMSIsInRpdGxlIjoidGhpcmQgb2ZmZXIiLCJhbW91bnQiOjMwLCJkZXNjcmlwdGlvbiI6InRoZSAzcmQgdGVzdCBvZmZlciIsIndhbGxldF9hZGRyZXNzIjoiR0RDNlVBV1pFVFFSWERGSkhIWlMyTzdKSzJPUTNGNU1OT1pMSEpQNFREN0o2TUI1UTJOSDVZR1UiLCJpYXQiOjE1MjM4NzI4MDYsImV4cCI6MTUyNTQxODI3OTE3MCwic3ViIjoic3BlbmQifQ.d2pEsXzWMr-XXNfnKYL52C-GscRMdIqtrETdpGc2R_TOnLcScXMLFU62HshP3hxZW88vi5JY42MszVApNmCQ_XI9XgVcZcAIYx6Ef63sO-e1WG8_oPRFFLwHf1p8VylArtkvaz2JkWbHVPQuCNdcwf31JUMVSqJZHGk6ez3KaSQ"
}
```

The `user_id` the id for the user which will send the kin.  
The `device_id` the id of the device for the user which will send the kin. 
The `offer_id` needs to match one of the offers which returns from the `SERVICE_URL/offers` endpoint.
The `amount` is how many kin this payment represents.
The `sender_title` is the title which the sender will see.  
The `sender_description` is the description which the sender will see.  
The `recipient_id` the id of the user which will receive the kin.  
The `recipient_title` is the title which the recipient will see.  
The `recipient_description` is the description which the recipient will see.  
The `nonce` is an optional id (string) which can be used to differentiate between multiple requests for the same `offer_id`.

#### register
Returns a token which can be used to register a user:  
`GET SERVICE_URL/register/token?user_id=aUserID&device_id=deviceA`

Result:
```json
{
    "jwt": "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6ImRlZmF1bHQifQ.eyJ0eXAiOiJKV1QiLCJ1c2VyX2lkIjoiYVVzZXJJRCIsImlhdCI6MTUyMzg3Mjk5NSwiZXhwIjoxNTI1NDE4NDY4Mzc2LCJzdWIiOiJyZWdpc3RlciJ9.RenNzwLk7DQCi-U3vXZO4d-4pM4nA1X-RW3JHGWq3BNRLOrzePQZ7O6VgW7wV2-YBPjR9UEAU9XrKs8FT7DYDzgfQA5iFOpEHRlDoiILmwPrje601BE5LGvoNPR4HI4bIPgDiw2-XuIqqNXRVCx4oWqR_p_ex8GEA95ty0aoP4Q"
}
```

#### sign
Returns a token for a posted arbitrary payload (and subject):  
`POST '{"subject":"a subject", "payload":{"key1":"value1"}}' SERVICE_URL/sign`

Result:
```json
{
    "jwt":"eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6ImRlZmF1bHQifQ.eyJ0eXAiOiJKV1QiLCJrZXkxIjoidmFsdWUxIiwiaWF0IjoxNTIzODczMjEzLCJleHAiOjE1MjU0MTg2ODY5MTQsInN1YiI6ImEgc3ViamVjdCJ9.KzkD8VSHNZmo0H6Mb5a83OEiaDKUugO3R7Z2JN4GJh7YepH_gz0-sZ0YlLffvYnohwhciysJ9wtcwJ8YwbO7sedObmdZbezEYaBBowaezGzIMJeZc9erfTWu7aYP_-je-DpyVbY1lLvoFF8AufF7xPmYQQweYqFGhIp-9AHtKds"
}
```

### Configuration
The service can be configured by changing the [config/default.json](config/default.json) file.

The most important of which are the:
* `port`: on which port this service will be bound to
* `offers`: the collection of offers which are returned in the `/offer` endpoint and which are signed when calling the 
`/spend?offer_id={ ID }` endpoint
* `private_keys`: the keys which will be used for signing the tokens
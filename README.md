# Kin ecosystem JWT service 
# **** This is a development tool and should NOT be used in production ****

A helper tool to create/sign [JWT](https://en.wikipedia.org/wiki/JSON_Web_Token).  
Tokens are needed, in some cases, when interacting with our [marketplace server](https://github.com/kinfoundation/marketplace-server), 
and as a result of that, the tokens are also needed when working with our SDKs.

In order to make the first integration with our SDKs simpler we supply this service, which can easily be installed and used 
by anyone who wants to try integrating Kin into their app.

Important note: This service is provided as a tool for development time to ease intergration with the SDK and should not under any circumstances be used in production. Any production solution MUST adhere to basic security best practices and encompass an authentication process limiting JWT serving to authenticated users/clients ONLY.

<a href="https://partners.kinecosystem.com/docs/server_jwt_service.html"><img src="https://partners.kinecosystem.com/img/documentation-button2x.png" width=300 height=84 alt="Documentation"/></a>

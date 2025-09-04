Prepare
keywords.txt
  (deftones,blink 182,green day,bad religion,nirvana,sonic youth,dinosaur jr,Melvins,radiohead,The cure,Pearl jam,The smashing pumpkins,Teenage fanclub,rhcp,red hot chilli pepper,nin,nine inch nails,nofx,weezer,punk o rama,marilyn manson)

feedback.json
  {
    "interested": [],
    "not_interested": [],
    "reasons": {},
    "temp": []
  }

excludes.txt
  ["REPRINT", "S-3XL", "RE-PRINT"]

config.json
  {
      "SANDBOX": {
          "clientId": "NUttapat-ailistin-SBX-xxxxxxxxx-xxxxxxxxxx",
          "clientSecret": "SBX-xxxxxxxxxxxx-xxxx-xxxx-xxxx-xxxx",
          "devid": "xxxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxxx",
          "redirectUri": "https://api.sandbox.ebay.com/identity/v1/oauth2/token",
          "baseUrl": "api.sandbox.ebay.com"
      },
      "PRODUCTION": {
          "clientId": "NUttapat-ailistin-PRD-xxxxxxxx-xxxxxxxx",
          "clientSecret": "PRD-xxxxxxxxxxxx-xxxx-xxxx-xxxx-xxxx",
          "devid": "xxxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxxx",
          "redirectUri": "https://api.ebay.com/identity/v1/oauth2/token",
          "baseUrl": "api.ebay.com"
      }
  }

Run
1. docker compose build
2. docker compose up

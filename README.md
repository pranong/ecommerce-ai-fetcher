# eBay Listing Notifier

A small project to monitor eBay listings based on your custom keywords, with exclusions and feedback tracking.

---

## 📂 Project Files (all inline)

### `keywords.txt`
```text
(deftones,blink 182,green day,bad religion,nirvana,sonic youth,dinosaur jr,Melvins,radiohead,The cure,Pearl jam,The smashing pumpkins,Teenage fanclub,rhcp,red hot chilli pepper,nin,nine inch nails,nofx,weezer,punk o rama,marilyn manson)
```

### `feedback.json`
```json
{
  "interested": [],
  "not_interested": [],
  "reasons": {},
  "temp": []
}
```

### `excludes.txt`
```json
["REPRINT", "S-3XL", "RE-PRINT"]
```

### `config.json`
```json
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
```

---

## 🚀 Run with Docker

1. Build the image:
   ```bash
   docker compose build
   ```

2. Start the containers:
   ```bash
   docker compose up -d
   ```

👉 Don’t forget `-d` to run in detached mode.  
Without `-d`, logs will stay attached in your terminal.

---

## 📌 Notes
- **keywords.txt** → contains search terms (comma separated).
- **feedback.json** → tracks user preferences.
- **excludes.txt** → filters out unwanted keywords.
- **config.json** → stores eBay API credentials for both sandbox and production.
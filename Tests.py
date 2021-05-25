import requests

url = "https://api.weatherbit.io/v2.0/current/airquality"

querystring = {"lat":"13.810061","lon":"100.547316", "key":"9706b562b7964206946dceb916acc290"}

response = requests.request("GET", url, params=querystring)

print(response.text)
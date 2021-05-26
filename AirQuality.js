// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: magic;

let gDate = new Date()

let gLoc = await Location.current()

storeLocation(gDate, gLoc)

let gAqi = await loadAQI(gLoc)

let gLocName = await determineLocation(gLoc, gAqi)

//let gCovid = await loadCovid()

let widget = await createWidget(gDate, gAqi, gLocName)
Script.setWidget(widget)

Script.complete()

async function createWidget(tNow, weather, locName)
{
    let widget = new ListWidget()
    let sWeather = "AQI: " + Math.trunc(weather.data[0].aqi).toString() + "\nPM2.5: " + Math.trunc(weather.data[0].pm25).toString() + "\nPM10: " + Math.trunc(weather.data[0].pm10).toString()

    let df = new DateFormatter()
    df.dateFormat = "HH:mm:ss"

    const wtInfo = widget.addText(sWeather + "\n" + locName)
    wtInfo.font = Font.mediumRoundedSystemFont(18)

    widget.addSpacer()

    const wtDate = widget.addText(df.string(tNow))
    wtDate.font = Font.lightRoundedSystemFont(12)

    if(weather.data[0].aqi < 50)
    {
        // healthy
        widget.backgroundColor = new Color("FFA63D")
    }
    else if(weather.data[0].aqi < 100)
    {
        // moderate
        widget.backgroundColor = new Color("FFA63D")
    }
    else if(weather.data[0].aqi < 150)
    {
        // unhealthy
        widget.backgroundColor = new Color("FF3D3D")
    }
    else if(weather.data[0].aqi < 200)
    {
        // very unhealthy
        widget.backgroundColor = new Color("CD3DFF")
    }
    else
    {
        // hazardous
        widget.backgroundColor = new Color("FF3DE0")
    }

    return widget
}

async function determineLocation(locNow, locAPI)
{
    let dToHome = getDistanceToStoredLocation(locNow, "home.txt")

    if(dToHome < 0.3) return "Home"

    let dToWork = getDistanceToStoredLocation(locNow, "work.txt")

    if(dToWork < 0.3) return "Work"

    return locAPI.country_code + " " + locAPI.city_name
}

function getDistanceToStoredLocation(locNow, pathToLocation)
{
    let fm = FileManager.iCloud()
    let docpath = fm.documentsDirectory() + "/" + pathToLocation
    fm.downloadFileFromiCloud(docpath)
    let docContent = fm.readString(docpath)

    var aContent = docContent.split(",")

    return getDistance(aContent[0], aContent[1], locNow.latitude, locNow.longitude)
}

function getDistance(lat1, lon1, lat2, lon2)
{
    var R = 6371 // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1)  // deg2rad below
    var dLon = deg2rad(lon2-lon1)
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2)
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    var d = R * c // Distance in km

    return d
}

function deg2rad(deg)
{
    return deg * (Math.PI/180)
}

async function storeLocation(tNow, locNow)
{
    let fm = FileManager.iCloud()
    let docpath = fm.documentsDirectory() + "/locationhistory.txt"
    fm.downloadFileFromiCloud(docpath)
    let df = new DateFormatter()
    df.dateFormat = "yyyy/MM/dd, HH:mm:ss"

    let docContent = fm.readString(docpath) + "\n" + df.string(tNow) + ", " + locNow.latitude + ", " + locNow.longitude
    fm.writeString(docpath, docContent)
}

async function loadAQI(LCur)
{
    let lat = LCur.latitude
    let url = "https://api.weatherbit.io/v2.0/current/airquality?lat=" + LCur.latitude + "&lon=" + LCur.longitude + "&key=9706b562b7964206946dceb916acc290"
    let req = new Request(url)
    let jreq = await req.loadJSON()

    return jreq
}

async function loadCovid()
{
    let url = "https://covid-19-data.p.rapidapi.com/country/code=th"
//    let url = "https://coronavirus-smartable.p.rapidapi.com/stats/v1/TH/"

    let req = new Request(url)

    req.headers = { "x-rapidapi-key": "16e2c1a827msh446d04107881719p157391jsn1e65b9bed8af",
        "x-rapidapi-host": "coronavirus-smartable.p.rapidapi.com"}
//    req.headers = { "x-rapidapi-key": "16e2c1a827msh446d04107881719p157391jsn1e65b9bed8af",
//        "x-rapidapi-host": "coronavirus-smartable.p.rapidapi.com"}

    let jreq = await req.loadJSON()

    console.log(jreq)

    return jreq
}
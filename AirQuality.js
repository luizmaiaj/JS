// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: magic;

const gNow = new Date()
const gDf = new DateFormatter()
gDf.dateFormat = "yyyy/MM/dd, HH:mm:ss"
const gFm = FileManager.iCloud()
const BASEPATH = gFm.documentsDirectory() + "/storage"

if(!gFm.fileExists(BASEPATH))
{
    gFm.createDirectory(BASEPATH)
}

// do not update more often than every X minutes
var minSinceUpdate = Math.trunc((gNow - getLastUpdateTime()) / 60000)
var bUpdate = (minSinceUpdate > 20)

console.log("minutes since last update: " + minSinceUpdate.toString())

const MAX = 999
var gJson
var gWeather

if(bUpdate)
{
    gLoc = await Location.current()
    storeLocation(gNow, gLoc)

    try
    {
        gJson = await loadAQI(gLoc)
        console.loc({gJson})

        var gLocName = await determineLocation(gLoc, gJson)
        gWeather = {aqi: Math.trunc(gJson.data[0].aqi), pm25: Math.trunc(gJson.data[0].pm25), pm10: Math.trunc(gJson.data[0].pm10), time: gNow, loc: {lat: gLoc.latitude, lon: gLoc.longitude, name: gLocName}}

        gDf.dateFormat = "yyyyMMdd_HHmmss"

        let docpath = BASEPATH + "/lastresponse_" + gDf.string(gNow) + ".txt"
        gFm.writeString(docpath, gJson)

        storeLastUpdate(gWeather)
    }
    catch (error)
    {
        console.log("failed to get info from API")
        bUpdate = false
    }
}

if(!bUpdate)
{
    gWeather = getLastUpdate()
}

var widget
widget = await createWidget(gWeather)

Script.setWidget(widget)

if (config.runsInApp) widget.presentSmall()

Script.complete()

//{aqi: aContent[0], pm25: aContent[1], pm10: aContent[2], time: aContent[3], loc: {lat: aContent[4], lon: aContent[5], name: }}
async function createWidget(weather)
{
    console.log({gWeather})

    let wg = new ListWidget()
    let sWeather = "AQI: " + weather.aqi.toString() + "\nPM2.5: " + weather.pm25.toString() + "\nPM10: " + weather.pm10.toString()

    const wtInfo = wg.addText(sWeather + "\n" + weather.loc.name)
    wtInfo.font = Font.mediumRoundedSystemFont(18)

    wg.addSpacer()

    gDf.dateFormat = "HH:mm:ss"
    const wtDate = wg.addText(gDf.string(weather.time))
    wtDate.font = Font.lightRoundedSystemFont(12)

    if(weather.aqi < 50) // healthy
    {
        wg.backgroundColor = Color.green()
    }
    else if(weather.aqi < 100) // moderate
    {
        wg.backgroundColor = Color.yellow()
    }
    else if(weather.aqi < 150) // unhealthy
    {
        wg.backgroundColor = Color.orange()
    }
    else if(weather.aqi < 200) // very unhealthy
    {
        wg.backgroundColor = Color.red()
    }
    else // hazardous
    {
        wg.backgroundColor = Color.black()
    }

    return wg
}

function getLastUpdateTime()
{
    let docpath = BASEPATH + "/aqlastupdate.txt"
    gFm.downloadFileFromiCloud(docpath)
    let docContent = gFm.readString(docpath)

    var aContent = docContent.split("\n")

    gDf.dateFormat = "yyyy/MM/dd, HH:mm:ss"

    return gDf.date(aContent[3])
}

function getLastUpdate()
{
    let docpath = BASEPATH + "/aqlastupdate.txt"
    gFm.downloadFileFromiCloud(docpath)
    let docContent = gFm.readString(docpath)

    var aContent = docContent.split("\n")

    gDf.dateFormat = "yyyy/MM/dd, HH:mm:ss"
    var storedTime = gDf.date(aContent[3])

    return {aqi: aContent[0], pm25: aContent[1], pm10: aContent[2], time: storedTime, loc: {lat: aContent[4], lon: aContent[5], name: aContent[6]}}
}

//{aqi: aContent[0], pm25: aContent[1], pm10: aContent[2], time: aContent[3], loc: {lat: aContent[4], lon: aContent[5], name: }}
function storeLastUpdate(weather)
{
    let docpath = BASEPATH + "/aqlastupdate.txt"

    gDf.dateFormat = "yyyy/MM/dd, HH:mm:ss"

    let docContent = weather.aqi.toString() + "\n" + weather.pm25.toString() + "\n" + weather.pm10.toString()
    docContent = docContent + "\n" + weather.loc.name + "\n" + gDf.string(weather.time) + "\n" + weather.loc.lat + "\n" + weather.loc.lon

    gFm.writeString(docpath, docContent)
}

async function determineLocation(locNow, locAPI)
{
    let dToHome = getDistanceToStoredLocation(locNow, "home.txt")

    if(dToHome < 0.3) return "Home"

    let dToWork = getDistanceToStoredLocation(locNow, "work.txt")

    if(dToWork < 0.3) return "Work"

    return locAPI.country_code + " " + locAPI.city_name
}

function getDistanceToStoredLocation(locNow, fileName)
{
    let docpath = BASEPATH + "/" + fileName
    gFm.downloadFileFromiCloud(docpath)
    let docContent = gFm.readString(docpath)

    if(docContent.length > 0)
    {
        var aContent = docContent.split(",")
        return getDistance(aContent[0], aContent[1], locNow.latitude, locNow.longitude)
    }

    return MAX
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

async function storeLocation(tNow, locNow) // store current location on a file named after the date
{
    gDf.dateFormat = "yyyyMMdd"

    let docpath = BASEPATH + "/locationhistory_" + gDf.string(tNow) + ".txt"

    gDf.dateFormat = "yyyy/MM/dd, HH:mm:ss"
    let docContent = ""
    let newContent = gDf.string(tNow) + ", " + locNow.latitude + ", " + locNow.longitude

    if(gFm.fileExists(docpath))
    {
        gFm.downloadFileFromiCloud(docpath)
        docContent = gFm.readString(docpath) + "\n" + newContent
    }
    else
    {
        docContent = newContent
    }
    
    gFm.writeString(docpath, docContent)
}

async function loadAQI(LCur)
{
    let url = "https://api.weatherbit.io/v2.0/current/airquality?lat=" + LCur.latitude + "&lon=" + LCur.longitude + "&key=9706b562b7964206946dceb916acc290"
    let req = new Request(url)
    let jreq = await req.loadJSON()

    return jreq
}
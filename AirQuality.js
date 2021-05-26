// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: magic;

let gDate = new Date()

let gLoc = await Location.current()

const gDf = new DateFormatter()
const gFm = FileManager.iCloud()
const BASEPATH = gFm.documentsDirectory() + "/storage"
if(!gFm.fileExists(BASEPATH))
{
    gFm.createDirectory(BASEPATH)
}

storeLocation(gDate, gLoc)

var widget
var gAqi
var gLocName
const MAX = 999

try
{
    gAqi = await loadAQI(gLoc)
    gLocName = await determineLocation(gLoc, gAqi)
    widget = await createWidget(gDate, gAqi, gLocName)
}
catch (error)
{
    console.log("no connection")

    widget = new ListWidget()
    getLastUpdate(widget)
}

Script.setWidget(widget)

if (config.runsInApp) widget.presentSmall()

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

    if(weather.data[0].aqi < 50) // healthy
    {
        widget.backgroundColor = new Color.green
    }
    else if(weather.data[0].aqi < 100) // moderate
    {
        widget.backgroundColor = new Color.yellow
    }
    else if(weather.data[0].aqi < 150) // unhealthy
    {
        widget.backgroundColor = new Color.orange
    }
    else if(weather.data[0].aqi < 200) // very unhealthy
    {
        widget.backgroundColor = new Color.red
    }
    else // hazardous
    {
        widget.backgroundColor = new Color.black
    }

    storeLastUpdate(wtInfo, wtDate, widget.backgroundColor)

    return widget
}

function getLastUpdate(wg)
{
    let docpath = BASEPATH + "/aqlastupdate.txt"
    gFm.downloadFileFromiCloud(docpath)
    let docContent = gFm.readString(docpath)

    var aContent = docContent.split("\n")

    const wtIf = wg.addText(aContent[0] + "\n" + aContent[1] + "\n" + aContent[2] + "\n" + aContent[3])
    wtIf.font = Font.mediumRoundedSystemFont(18)
    wg.addSpacer()
    const wtDt = widget.addText(aContent[4])
    wtDt.font = Font.lightRoundedSystemFont(12)
    widget.backgroundColor = new Color(aContent[5])
}

function storeLastUpdate(wtIf, wtDt, wtColor)
{
    let docpath = BASEPATH + "/aqlastupdate.txt"

    let docContent = wtIf.text + "\n" + wtDt.text + "\n" + wtColor.hex

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
    let lat = LCur.latitude
    let url = "https://api.weatherbit.io/v2.0/current/airquality?lat=" + LCur.latitude + "&lon=" + LCur.longitude + "&key=9706b562b7964206946dceb916acc290"
    let req = new Request(url)
    let jreq = await req.loadJSON()

    return jreq
}

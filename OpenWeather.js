// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: leaf;

const MAX = 999

async function createWidget(tNow)
{
    let wg = new ListWidget()

    const wd = await requestData(tNow)

    sTemp = Math.round(wd.w.current.temp).toString() + "°"
    sFeel = Math.round(wd.w.current.feels_like).toString() + "°"
    sUVI = Math.round(wd.w.current.uvi).toString()
    sAQI = Math.round(wd.p.list[0].main.aqi).toString()
    sPM25 = Math.round(wd.p.list[0].components.pm2_5).toString()
    sPM10 = Math.round(wd.p.list[0].components.pm10).toString()
    sCO = Math.round(wd.p.list[0].components.co).toString()
    sSO2 = Math.round(wd.p.list[0].components.so2.toString()).toString()
    sHum = wd.w.current.humidity.toString() + "%"

    sLocation = checkKnownLocations(wd.l, 0.3, wd.w.timezone)

    widgetAddText(wg, sLocation, 12)
    widgetAddText(wg, wd.w.current.weather[0].main, 16)
    widgetAddText(wg, sTemp + " (" + sFeel + ")" + " " + sHum, 16)
    widgetAddText(wg, "uvi: " + sUVI + ", aqi: " + sAQI, 12)
    widgetAddText(wg, "pm25: " + sPM25 + ", pm10: " + sPM10, 12)
    widgetAddText(wg, "co: " + sCO + ", so2: " + sSO2, 12)

    wg.addSpacer()

    let df = new DateFormatter()
    df.dateFormat = "HH:mm:ss"

    const tDate = wg.addText(df.string(tNow) + " - " + wd.m + " mins")
    tDate.font = Font.lightRoundedSystemFont(10)

    return wg
}

async function run()
{
    // get information to display
    let gDate = new Date()

    // create the widget and associate with script
    let widget = await createWidget(gDate)
    Script.setWidget(widget)
    
    // finish execution and display preview
    if (config.runsInApp) widget.presentSmall()
    
    Script.complete()   
}

function checkKnownLocations(loc, maxDist, LCurrent)
{
    let dToHome = getDistanceToStoredLocation(loc, "home.txt")
    console.log("Home " + dToHome.toString())

    if(dToHome < maxDist) return "Home"

    let dToWork = getDistanceToStoredLocation(loc, "work.txt")
    console.log("Work " + dToWork.toString())

    if(dToWork < maxDist) return "Work"

    return LCurrent
}

function getDistanceToStoredLocation(locNow, fileName)
{
    const fm = FileManager.iCloud()
    let docpath = fm.documentsDirectory() + "/storage" + "/" + fileName

    fm.downloadFileFromiCloud(docpath)
    
    let docContent = fm.readString(docpath)

    if(docContent.length > 0) {
        var aContent = docContent.split(",")

        //console.log(aContent[0].toString() + ", " + aContent[1].toString() + "; " +  locNow.lat.toString() + ", " +  locNow.lon.toString())
        return getDistance(aContent[0], aContent[1], locNow.latitude, locNow.longitude)
    }

    return MAX
}

function getDistance(lat1, lon1, lat2, lon2)
{
    //console.log(lat1.toString() + ", " + lon1.toString() + "; " +  lat2.toString() + ", " +  lon2.toString())

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

// Ex: api.openweathermap.org/data/2.5/weather?q=London,uk&APPID=faca05867d84ee306effa2c224819d0e
//     api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid=faca05867d84ee306effa2c224819d0e
// AQI: Possible values: 1, 2, 3, 4, 5. Where 1 = Good, 2 = Fair, 3 = Moderate, 4 = Poor, 5 = Very Poor
//     tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid=faca05867d84ee306effa2c224819d0e
//     layer: temp_new
//     z: zoom
async function requestData(tNow)
{
    var jWeather = await JSON.parse(readCache("owlastupdate.txt"))
    var jPolution = await JSON.parse(readCache("oplastupdate.txt"))

    var minPassed = Math.trunc(((Date.now() / 1000) - jWeather.current.dt) / 60)
    console.log("minutes passed " + minPassed.toString())

    var oldLoc = {latitude: jWeather.lat, longitude: jWeather.lon}
    var loc = oldLoc

    try { // if location request fails use the last known location
        loc = await Location.current()

        await setLocation(loc)

    } catch (error) {
        console.log(error)

        writeCache(error, "openweather_locerror.txt")

        loc = oldLoc
    }

    if(minPassed >= 15) {        
        let url = "https://api.openweathermap.org/data/2.5/onecall?lat=" + loc.latitude + "&lon=" + loc.longitude + "&exclude=minutely,hourly,daily" + "&units=metric" + "&appid=faca05867d84ee306effa2c224819d0e"

        jWeather = await sendRequest(url)

        writeCache(jWeather, "owlastupdate.txt")

        url = "https://api.openweathermap.org/data/2.5/air_pollution?lat=" + loc.latitude + "&lon=" + loc.longitude + "&appid=faca05867d84ee306effa2c224819d0e"

        jPolution = await sendRequest(url)

        writeCache(jPolution, "oplastupdate.txt")
    }

    return {w: jWeather, p: jPolution, l: loc, m: minPassed}
}

async function sendRequest(url)
{
    var jInfo
    var req

    try {
        req = new Request(url)        
    } catch (error) {
        console.log(error)

        writeCache(error, "openweather_reqerror.txt")
        return
    }

    jInfo = await req.loadJSON()

    return jInfo
}

function widgetAddText(wg, sText, iSize)
{
    let tInfo = wg.addText(sText)
    tInfo.font = Font.mediumRoundedSystemFont(iSize)
}

function readCache(fileName)
{
    const fm = FileManager.iCloud()
    const BASEPATH = fm.documentsDirectory() + "/storage"
    let docpath = BASEPATH + "/" + fileName
    
    if(!fm.fileExists(BASEPATH) || !fm.fileExists(docpath)) {
        console.log("File not found " + docpath)
        return {error: 404}
    }

    //return await JSON.parse(fm.readString(docpath))
    return fm.readString(docpath)
}

function writeCache(wd, fileName)
{
    const fm = FileManager.iCloud()
    const BASEPATH = fm.documentsDirectory() + "/storage"
    
    if(!fm.fileExists(BASEPATH)) fm.createDirectory(BASEPATH)

    let docpath = BASEPATH + "/" + fileName

    fm.writeString(docpath, JSON.stringify(wd))
}

async function setLocation(loc) // store current location on a file named after the date
{
    const fm = FileManager.iCloud()
    let filePath = fm.documentsDirectory() + "/storage" + "/" + "curr.txt"
    fm.downloadFileFromiCloud(filePath)

    console.log("location updated: " + filePath)

    let docContent = loc.latitude + "," + loc.longitude

    fm.writeString(filePath, docContent)
}

await run()
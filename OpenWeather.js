// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: leaf;

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

    widgetAddText(wg, wd.w.timezone, 12)
    widgetAddText(wg, wd.w.current.weather[0].main, 16)
    widgetAddText(wg, sTemp + " (" + sFeel + ")", 16)
    widgetAddText(wg, wd.w.current.humidity.toString() + "%", 16)
    widgetAddText(wg, "uvi " + sUVI + " aqi " + sAQI, 12)
    widgetAddText(wg, "pm25 " + sPM25 + " pm10 " + sPM10, 12)
    widgetAddText(wg, "co " + sCO + " so2 " + sSO2, 12)

    wg.addSpacer()

    let df = new DateFormatter()
    df.dateFormat = "HH:mm:ss"

    const tDate = wg.addText(df.string(tNow))
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

// Ex: api.openweathermap.org/data/2.5/weather?q=London,uk&APPID=faca05867d84ee306effa2c224819d0e
//     api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid=faca05867d84ee306effa2c224819d0e
// AQI: Possible values: 1, 2, 3, 4, 5. Where 1 = Good, 2 = Fair, 3 = Moderate, 4 = Poor, 5 = Very Poor
async function requestData(tNow)
{
    var jWeather = await JSON.parse(readCache("owlastupdate.txt"))
    var jPolution = await JSON.parse(readCache("oplastupdate.txt"))

    var minPassed = Math.trunc(((Date.now() / 1000) - jWeather.current.dt) / 60)
    console.log("minutes passed " + minPassed.toString())

    if(minPassed >= 15) {
        var req
        loc = await Location.current()
        let url = "https://api.openweathermap.org/data/2.5/onecall?lat=" + loc.latitude + "&lon=" + loc.longitude + "&exclude=minutely,hourly,daily" + "&units=metric" + "&appid=faca05867d84ee306effa2c224819d0e"

        try {
            req = new Request(url)        
        } catch (error) {
            jWeather = await req.loadJSON()

            console.log("Error requesting data: " + url)
            writeCache(jWeather, "owlasterror.txt")
            return
        }

        jWeather = await req.loadJSON()

        writeCache(jWeather, "owlastupdate.txt")

        url = "https://api.openweathermap.org/data/2.5/air_pollution?lat=" + loc.latitude + "&lon=" + loc.longitude + "&appid=faca05867d84ee306effa2c224819d0e"

        try {
            req = new Request(url)
        } catch (error) {
            jPolution = await req.loadJSON()

            console.log("Error requesting data: " + url)
            writeCache(jPolution, "oplasterror.txt")
            return
        }

        jPolution = await req.loadJSON()

        writeCache(jPolution, "oplastupdate.txt")
    }

    return {w: jWeather, p: jPolution}
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

await run()
// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: leaf;

async function createWidget(tNow)
{
    let wg = new ListWidget()

    const wd = await requestData(tNow)

    widgetAddText(wg, wd.w.current.weather[0].main, 16)
    widgetAddText(wg, "feels " + wd.w.current.feels_like.toString() + "°", 12)
    widgetAddText(wg, wd.w.current.temp.toString() + "°", 16)
    widgetAddText(wg, wd.w.current.humidity.toString() + "%", 16)
    widgetAddText(wg, "uvi " + wd.w.current.uvi.toString(), 12)
    widgetAddText(wg, wd.w.timezone, 12)
    widgetAddText(wg, "aqi " + wd.p.list[0].main.aqi, 16)

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
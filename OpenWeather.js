// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: leaf;

// openweather api
// API key: faca05867d84ee306effa2c224819d0e
// Example: api.openweathermap.org/data/2.5/weather?q=London,uk&APPID=faca05867d84ee306effa2c224819d0e

async function createWidget(tNow)
{
    let wg = new ListWidget()

    const wd = await requestData(tNow)

    widgetAddText(wg, wd.current.weather[0].main, 18)
    widgetAddText(wg, "\nfeels " + wd.current.feels_like.toString() + "°", 12)
    widgetAddText(wg, wd.current.temp.toString() + "°", 18)
    widgetAddText(wg, wd.current.humidity.toString() + "%", 18)
    widgetAddText(wg, "uvi " + wd.current.uvi.toString(), 14)
    widgetAddText(wg, wd.timezone, 14)

    wg.addSpacer()

    let df = new DateFormatter()
    df.dateFormat = "HH:mm:ss"

    const tDate = wg.addText(df.string(tNow))
    tDate.font = Font.lightRoundedSystemFont(12)

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

async function requestData(tNow)
{
    var json = await JSON.parse(readCache("owlastupdate.txt"))

    var minPassed = Math.trunc(((Date.now() / 1000) - json.current.dt) / 60)
    console.log("minutes passed " + minPassed.toString())

    if(minPassed >= 15)
    {
        var req
        loc = await Location.current()
        let url = "https://api.openweathermap.org/data/2.5/onecall?lat=" + loc.latitude + "&lon=" + loc.longitude + "&exclude=minutely,hourly,daily" + "&units=metric" + "&appid=faca05867d84ee306effa2c224819d0e"

        try
        {
            req = new Request(url)        
        }
        catch (error)
        {
            json = await req.loadJSON()

            log("Error requesting data: " + url)
            writeCache(json, "owlasterror.txt")
            return
        }

        json = await req.loadJSON()

        writeCache(json, "owlastupdate.txt")
    }

    return json
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
    
    if(!fm.fileExists(BASEPATH) || !fm.fileExists(docpath))
    {
        console.log("File not found " + docpath)
        return
    }

    //return JSON.parse(fm.readString(docpath))
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

// only logs if running inside the app
function log(toLog)
{
    if (config.runsInApp) console.log(toLog)
}

await run()
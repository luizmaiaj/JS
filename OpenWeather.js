// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: magic;

// openweather api
// API key: faca05867d84ee306effa2c224819d0e
// Example: api.openweathermap.org/data/2.5/weather?q=London,uk&APPID=faca05867d84ee306effa2c224819d0e

async function createWidget(tNow)
{
    let widget = new ListWidget()

    await requestData()

    let df = new DateFormatter()
    df.dateFormat = "HH:mm:ss"

    const wtDate = widget.addText(df.string(tNow))
    wtDate.font = Font.lightRoundedSystemFont(12)

    return widget
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

async function requestData()
{
    loc = await Location.current()

    let url = "https://api.openweathermap.org/data/2.5/onecall?lat=" + loc.latitude + "&lon=" + loc.longitude + "&units=metric" + "&appid=faca05867d84ee306effa2c224819d0e"
    let req = new Request(url)
    let jreq = await req.loadJSON()

    log(jreq)

    return jreq
}

function log(toLog)
{
    if (config.runsInApp) console.log({toLog})
}

await run()
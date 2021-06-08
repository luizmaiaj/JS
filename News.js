// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: magic;

async function createWidget(tNow)
{
    let widget = new ListWidget()

    let df = new DateFormatter()
    df.dateFormat = "HH:mm:ss"

    const wtDate = widget.addText(df.string(tNow))
    wtDate.font = Font.lightRoundedSystemFont(12)

    await request("http://www.techmeme.com/feed.xml")

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
    if (config.runsInApp) widget.presentMedium()
    
    Script.complete()   
}

await run()

async function request(url)
{
    const fm = FileManager.iCloud()
    let fileName = "techmeme.js"
    let filePath = fm.documentsDirectory() + "/storage" + "/" + fileName

    var jInfo

    console.log("************")

    if(fm.fileExists(filePath))
    {
        console.log("file found: " + fileName)

        jInfo = JSON.parse(fm.readString(filePath))

        console.log(jInfo)

        return jInfo
    }

    var req = new Request(url)

    try {
        console.log("request sent: " + JSON.stringify(req))
        jInfo = await req.loadString()

    } catch (error) {
        console.log(error)
        return
    }

    console.log(jInfo)

    fm.writeString(filePath, jInfo)

    return jInfo
}

// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: magic;

async function createWidget()
{
    let gDate = new Date()

    let loc

    try { 
        loc = await Location.current()

        storeLocation(gDate, loc)

    } catch (error) {
        console.log(error)

        writeCache(error, "dayreport_locerror.txt")
    }
   
    let widget = new ListWidget()

    let dev = Device.isFaceUp()
    let bat = Math.trunc(100 * Device.batteryLevel())
    const wtInfo = widget.addText(bat.toString() + "% " + (Device.isCharging()?"charging":"discharging"))
    wtInfo.font = Font.mediumRoundedSystemFont(18)

//    functions below always return false independently of the phones orientation
    let fu = Device.isFaceUp()
    let fd = Device.isFaceDown()

    widget.addText(fu.toString() + " " + fd.toString())

    widget.addSpacer()

    let df = new DateFormatter()
    df.dateFormat = "HH:mm:ss"

    if(bat >= 90)
        widget.backgroundColor = Color.orange()
    else if(bat >= 75)
        widget.backgroundColor = Color.green()
    else if(bat >= 60)
        widget.backgroundColor = Color.orange()
    else if(bat >= 45)
        widget.backgroundColor = Color.yellow()
    else if(bat >= 30)
        widget.backgroundColor = Color.purple()
    else if(bat >= 15)
        widget.backgroundColor = Color.red()
    else
        widget.backgroundColor = Color.black()

    const wtDate = widget.addText(df.string(gDate))
    wtDate.font = Font.lightRoundedSystemFont(12)

    return widget
}

async function run()
{
    let widget = await createWidget()
    Script.setWidget(widget)
    
    if (config.runsInApp) widget.presentSmall()

    Script.complete()
}

async function storeLocation(tNow, locNow) // store current location on a file named after the date
{
    let df = new DateFormatter()
    let fm = FileManager.iCloud()
    df.dateFormat = "yyyyMMdd"
    let docpath = fm.documentsDirectory() + "/storage/locationhistory_" + df.string(tNow) + ".csv"
    var docContent
    if(fm.fileExists(docpath))
    {
        fm.downloadFileFromiCloud(docpath)
        docContent = fm.readString(docpath)
    }
    else
    {
        docContent = "date,latitude,longitude"
    }
    df.dateFormat = "yyyy/MM/dd HH:mm:ss"
    docContent = docContent + "\n" + df.string(tNow) + "," + locNow.latitude + "," + locNow.longitude
    fm.writeString(docpath, docContent)
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
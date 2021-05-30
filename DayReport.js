// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: magic;

async function createWidget()
{
    let gDate = new Date()
    
    let widget = new ListWidget()

    let dev = Device.isFaceUp()
    let bat = Math.trunc(100 * Device.batteryLevel())
    const wtInfo = widget.addText(bat.toString() + "% " + (Device.isCharging()?"charging":"discharging"))
    wtInfo.font = Font.mediumRoundedSystemFont(18)

//    functions below always return false independently of the phones orientation
//    let fu = Device.isFaceUp()
//    let fd = Device.isFaceDown()

//    widget.addText(fu.toString() + " " + fd.toString())

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

await run()
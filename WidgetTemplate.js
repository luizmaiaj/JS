// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: magic;

let gDate = new Date()

let widget = await createWidget(gDate)
Script.setWidget(widget)

if (config.runsInApp) widget.presentSmall()

Script.complete()

async function createWidget(tNow)
{
    let widget = new ListWidget()

    let df = new DateFormatter()
    df.dateFormat = "HH:mm:ss"

    const wtDate = widget.addText(df.string(tNow))
    wtDate.font = Font.lightRoundedSystemFont(12)

    return widget
}
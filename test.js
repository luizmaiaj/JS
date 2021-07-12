// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: cut;

async function run()
{
    var aContent = shortcuteParameter.split(",")

    aContent = aContent + " testing if it works"

    Script.setShortcutOutput(aContent)

    if(!config.runsInApp) {
        Script.complete()
    }
}

await run()
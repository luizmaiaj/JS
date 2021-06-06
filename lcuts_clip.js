// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: cut;

async function run()
{
    const fm = FileManager.iCloud()
    let filePath = fm.documentsDirectory() + "/storage" + "/" + "clip.txt"
    
    var output

    if(fm.fileExists(filePath))
    {
        fm.downloadFileFromiCloud(filePath)

        output = readHistory(filePath)

        console.log(output)

        //output = {latitude: loc.latitude, longitude: loc.longitude}
    }

    Script.setShortcutOutput(output)

    if(!config.runsInApp) {
        Script.complete()
    }
}

function readHistory(filePath)
{
    const fm = FileManager.iCloud()
    var content = fm.readString(filePath)

    return content.split("\n")
}

await run()
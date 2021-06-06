// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: cut;

async function run()
{
    const fm = FileManager.iCloud()
    let filePath = fm.documentsDirectory() + "/storage" + "/" + "clip.txt"
    
    if(fm.fileExists(filePath))
    {
        fm.downloadFileFromiCloud(filePath)
    }

    Script.setShortcutOutput(filePath)

    if(!config.runsInApp) {
        Script.complete()
    }
}

await run()
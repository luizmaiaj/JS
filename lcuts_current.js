// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: cut;

async function run()
{
    const fm = FileManager.iCloud()
    var docpath = fm.bookmarkedPath("curr.txt")

    let LCurr = await updateCurrentLocation(docpath)

    var text = {latitude: LCurr.latitude, longitude: LCurr.longitude}

    Script.setShortcutOutput(text)

    if(!config.runsInApp) {
        Script.complete()
    }
}

async function updateCurrentLocation(filePath)
{
    const LIMIT = 15 // minutes

    let tNow = new Date()
    let LCurr = await getLocation(filePath)

    var age = Math.round((tNow - LCurr.update) / 60000)

    if(LCurr.update == 0 || age >= LIMIT) {
        console.log("updating after minutes: " + age)

        try {
            LCurr = await Location.current()

            await setLocation(LCurr, filePath)
        } catch (error) {
            console.log(error)
        }
    }

    return LCurr
}

async function getLocation(filePath)
{
    const fm = FileManager.iCloud()

    if(!fm.fileExists(filePath)) return {latitude: 0, longitude: 0, update: 0}

    fm.downloadFileFromiCloud(filePath)
    
    let docContent = fm.readString(filePath)

    if(docContent.length = 0) return {latitude: 0, longitude: 0, update: 0}
    
    let aContent = docContent.split(",")

    return {latitude: aContent[0], longitude: aContent[1], update: fm.modificationDate(filePath)}
}

async function setLocation(loc, filePath) // store current location on a file named after the date
{
    const fm = FileManager.iCloud()
    let docContent = loc.latitude + "," + loc.longitude

    fm.writeString(filePath, docContent)
}

await run()
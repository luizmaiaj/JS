// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: cut;

function getDistanceToStoredLocation(locNow, fileName)
{
    const fm = FileManager.iCloud()
    let docpath = fm.documentsDirectory() + "/storage" + "/" + fileName

    fm.downloadFileFromiCloud(docpath)
    
    let docContent = fm.readString(docpath)

    if(docContent.length > 0) {
        var aContent = docContent.split(",")

        return getDistance(aContent[0], aContent[1], locNow.latitude, locNow.longitude)
    }

    return MAX
}

// uses the haversine formula to calculate a direct line distance between two coordinates
function getDistance(lat1, lon1, lat2, lon2)
{
    var R = 6371 // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1)  // deg2rad below
    var dLon = deg2rad(lon2-lon1)
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2)
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    var d = R * c // Distance in km

    return d
}

function deg2rad(deg) { return deg * (Math.PI/180) }

async function run()
{
    const fm = FileManager.iCloud()
    var docpath = fm.bookmarkedPath("curr.txt")

    let loc = await updateCurrentLocation(docpath)

    let dToHome = getDistanceToStoredLocation(loc, "home.txt")
    console.log("Home " + dToHome.toString())

    Script.setShortcutOutput(dToHome)

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
// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: cut;

function checkKnownLocations(loc, maxDist, LCurrent)
{
    let dToHome = getDistanceToStoredLocation(loc, "home.txt")
    console.log("Home " + dToHome.toString())

    if(dToHome < maxDist) return "Home"

    let dToWork = getDistanceToStoredLocation(loc, "work.txt")
    console.log("Work " + dToWork.toString())

    if(dToWork < maxDist) return "Work"

    return LCurrent
}

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

function deg2rad(deg)
{
    return deg * (Math.PI/180)
}

async function run()
{
    let LCurr = await updateCurrentLocation("curr.txt")
    let LHome = await getLocation("home.txt")
    let LWork = await getLocation("work.txt")
}
async function updateCurrentLocation(fileName)
{
    const LIMIT = 15 // minutes

    let tNow = new Date()
    let LCurr = await getLocation(fileName)

    var age = Math.round((tNow - LCurr.update) / 60000)

    if(LCurr.update == 0 || age >= LIMIT) {
        console.log("updating after minutes: " + age)

        try {
            LCurr = await Location.current()

            await setLocation(LCurr, fileName)
        } catch (error) {
            console.log("unable to retrieve location at this time")
        }
    }

    return LCurr
}
async function getLocation(fileName)
{
    const fm = FileManager.iCloud()
    let docpath = fm.documentsDirectory() + "/storage" + "/" + fileName

    if(!fm.fileExists(docpath)) return {latitude: 0, longitude: 0, update: 0}

    fm.downloadFileFromiCloud(docpath)
    
    let docContent = fm.readString(docpath)

    if(docContent.length = 0) return {latitude: 0, longitude: 0, update: 0}
    
    let aContent = docContent.split(",")

    return {latitude: aContent[0], longitude: aContent[1], update: fm.modificationDate(docpath)}
}

async function setLocation(loc, fileName) // store current location on a file named after the date
{
    const fm = FileManager.iCloud()
    let docpath = fm.documentsDirectory() + "/storage" + "/" + fileName
    let docContent = loc.latitude + "," + loc.longitude

    fm.writeString(docpath, docContent)
}

await run()
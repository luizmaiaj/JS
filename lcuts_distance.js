// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: cut;

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
    var aContent = args.shortcutParameter.split(",")

    let distance = getDistance(aContent[0], aContent[1], aContent[2], aContent[3])

    Script.setShortcutOutput(distance)

    if(!config.runsInApp) {
        Script.complete()
    }
}

await run()
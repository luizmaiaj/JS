// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: magic;

async function createWidget(tNow)
{
    let widget = new ListWidget()

    var loc = await Location.current()
    var tile = await requestTile(loc)

    var wImage = widget.addImage(tile)

    sImage = new Size(128, 128)

    wImage.imageSize = sImage

    let df = new DateFormatter()
    df.dateFormat = "HH:mm:ss"

    const wtDate = widget.addText(df.string(tNow))
    wtDate.font = Font.lightRoundedSystemFont(12)

    return widget
}

async function run()
{
    // get information to display
    let tNow = new Date()

    // create the widget and associate with script
    let widget = await createWidget(tNow)
    Script.setWidget(widget)
    
    // finish execution and display preview
    if (config.runsInApp) widget.presentLarge()
    
    Script.complete()   
}

await run()

function getXY(lat, lon, zoom)
{
    return {x: lon2tile(lon, zoom), y: lat2tile(lat, zoom)};
}

function lon2tile(lon, zoom)
{
    return (Math.floor((lon+180)/360*Math.pow(2,zoom)));
}

function lat2tile(lat, zoom)
{
    return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom)));
}

async function requestTile(loc)
{
    var zoom = 4
    var tile = getXY(loc.latitude, loc.longitude, zoom)
    console.log("x: " + tile.x + " y: " + tile.y)

    let url = "https://maptiles.p.rapidapi.com/local/osm/v1/" + tile.x + "/" + tile.y + "/" + zoom + ".png"

    var jImage
    var req

    try {
        req = new Request(url)

        req.headers = { "x-rapidapi-key": "16e2c1a827msh446d04107881719p157391jsn1e65b9bed8af",
        "x-rapidapi-host": "maptiles.p.rapidapi.com"}

    } catch (error) {
        console.log(error)
        return
    }

    jImage = await req.loadImage()

    return jImage
}